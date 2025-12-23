import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportContent } from '@/lib/supabase/client';
import { OpenAIService } from '@/lib/services/openai';

export const dynamic = 'force-dynamic';

/**
 * Route ADMIN pour backfiller amazonSearchQuery dans les rapports existants.
 *
 * POST /api/admin/backfill-amazon-search
 * Headers: Authorization: Bearer <ADMIN_SECRET_KEY>
 * Body (optionnel): { useOpenAI?: boolean }
 *
 * Comportement :
 * - Parcourt tous les rapports
 * - Pour chaque rapport dont content.amazonSearchQuery / content.amazon_search_query est vide,
 *   remplit amazonSearchQuery avec :
 *   - par défaut : product_name
 *   - bonus : si useOpenAI=true, tente d'extraire le modèle exact via OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    let useOpenAI = false;
    try {
      const body = await request.json();
      if (body && typeof body.useOpenAI === 'boolean') {
        useOpenAI = body.useOpenAI;
      }
    } catch {
      // pas de body ou JSON invalide → on ignore et on reste en mode sans OpenAI
    }

    const allReports = await getAllReports();
    const openaiService = useOpenAI ? new OpenAIService() : null;

    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const details: any[] = [];

    for (const report of allReports) {
      try {
        let content: any;
        try {
          content =
            typeof report.content === 'object'
              ? report.content
              : JSON.parse(report.content || '{}');
        } catch (e) {
          console.warn('[BackfillAmazon] Contenu JSON invalide pour', report.id, e);
          content = {};
        }

        const existingQuery: string | undefined =
          content.amazonSearchQuery || content.amazon_search_query;

        if (typeof existingQuery === 'string' && existingQuery.trim().length > 0) {
          skipped++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'skipped',
            reason: 'amazonSearchQuery déjà renseigné',
          });
          continue;
        }

        const baseProductName = (report.product_name || '').trim();
        if (!baseProductName) {
          skipped++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'skipped',
            reason: 'product_name vide, impossible de déduire une requête',
          });
          continue;
        }

        let amazonSearchQuery = baseProductName;

        // Bonus : tenter d'affiner avec l'IA si demandé
        if (openaiService) {
          try {
            const refined = await refineAmazonSearchQueryWithOpenAI(
              openaiService,
              baseProductName,
              content
            );
            if (refined && refined.trim().length > 0) {
              amazonSearchQuery = refined.trim();
            }
          } catch (e) {
            console.warn(
              '[BackfillAmazon] Échec de la tentative d\'affinage OpenAI pour',
              report.id,
              e
            );
          }
        }

        const newContent = {
          ...content,
          amazonSearchQuery,
          amazonRecommendationReason:
            content.amazonRecommendationReason ||
            content.amazon_recommendation_reason ||
            'Produit recommandé par la communauté Reddit',
        };

        const success = await updateReportContent(report.id, newContent);
        if (success) {
          updated++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'updated',
            amazonSearchQuery,
          });
        } else {
          errors++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'error',
            message: 'Échec de la mise à jour du contenu dans Supabase',
          });
        }
      } catch (e) {
        errors++;
        console.error('[BackfillAmazon] Erreur lors du traitement du rapport', report.id, e);
        details.push({
          id: report.id,
          productName: report.product_name,
          status: 'error',
          message: e instanceof Error ? e.message : 'Erreur inconnue',
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: allReports.length,
        updated,
        skipped,
        errors,
      },
      details,
    });
  } catch (error) {
    console.error('[BackfillAmazon] Erreur globale:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors du backfill amazonSearchQuery: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * Utilise OpenAI pour affiner la requête Amazon à partir du produit et du contenu du rapport.
 * Retourne une chaîne avec le nom EXACT du modèle à utiliser dans la requête Amazon,
 * ou null si l'extraction échoue.
 */
async function refineAmazonSearchQueryWithOpenAI(
  openaiService: OpenAIService,
  productName: string,
  content: any
): Promise<string | null> {
  const products = Array.isArray(content?.products)
    ? content.products.filter((p: any): p is string => typeof p === 'string')
    : [];
  const choice = typeof content?.choice === 'string' ? content.choice : '';

  const context = JSON.stringify(
    {
      productName,
      products,
      choice,
      title: content?.title ?? null,
    },
    null,
    2
  );

  const prompt = `
Tu es un assistant qui extrait le **nom exact du modèle de produit** à partir d'un rapport déjà généré.

Contexte JSON:
${context}

OBJECTIF:
- Identifie le modèle précis à utiliser comme requête Amazon (par exemple "Roborock S8", "Logitech G Pro X Superlight", etc.)
- Si plusieurs modèles sont mentionnés, choisis celui qui est clairement présenté comme "choix de la communauté" ou le plus recommandé.

CONTRAINTE:
- Réponds UNIQUEMENT par le nom du modèle, sans texte additionnel, sans guillemets, sans format JSON.
- Si tu n'es pas sûr ou qu'aucun modèle précis n'apparaît, renvoie simplement "${productName}".
`;

  try {
    const completion = await openaiService['client'].chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu aides à extraire des noms de modèles de produits pour des recherches Amazon.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 64,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    // Nettoyer d'éventuels guillemets ou formatage léger
    const cleaned = raw.replace(/^"+|"+$/g, '').trim();
    return cleaned || null;
  } catch (e) {
    console.error('[BackfillAmazon] Erreur OpenAI lors de l\'extraction du modèle précis:', e);
    return null;
  }
}



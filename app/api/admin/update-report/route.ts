import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';
import { OpenAIService } from '@/lib/services/openai';
import { getReportById, updateReport } from '@/lib/supabase/client';
import { extractMainKeyword } from '@/lib/utils/keyword-extractor';

export const dynamic = 'force-dynamic';

/**
 * Route API pour mettre à jour un rapport existant
 * POST /api/admin/update-report
 * Body: { reportId: string, forceUpdateImage?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de sécurité basique (peut être améliorée)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Vérifier que la requête vient d'un admin (peut être amélioré avec une vraie authentification)
    if (!token || token !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportId, forceUpdateImage = false } = body;

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre "reportId" est requis' },
        { status: 400 }
      );
    }

    console.log('[API] 🔄 Mise à jour du rapport:', reportId, 'forceUpdateImage:', forceUpdateImage);

    // 1. Récupérer le rapport existant
    const existingReport = await getReportById(reportId);
    if (!existingReport) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

    // 2. Extraire le keyword depuis le rapport existant
    let content = {};
    try {
      content = typeof existingReport.content === 'object'
        ? existingReport.content
        : JSON.parse(existingReport.content || '{}');
    } catch (e) {
      console.error('[API] Erreur lors du parsing du contenu:', e);
      return NextResponse.json(
        { error: 'Erreur lors de la lecture du rapport existant' },
        { status: 500 }
      );
    }

    const keyword = (content as any).keyword || existingReport.product_name;
    const searchKeyword = extractMainKeyword(keyword);

    console.log('[API] 🔍 Recherche Reddit pour mise à jour:', searchKeyword);
    console.log('🚨 CONSOMMATION CRÉDIT : Appel API Serper pour mise à jour:', searchKeyword);

    // 3. Rechercher de nouveaux avis Reddit
    const serperService = new SerperService();
    const redditResults = await serperService.searchReddit(searchKeyword);

    if (redditResults.length === 0) {
      return NextResponse.json(
        { error: 'Aucune discussion Reddit trouvée pour ce mot-clé' },
        { status: 404 }
      );
    }

    console.log('🚨 CONSOMMATION CRÉDIT : Appel API OpenAI pour mise à jour:', keyword);

    // 4. Régénérer le rapport avec OpenAI
    const openaiService = new OpenAIService();
    const newReport = await openaiService.generateReport(keyword, redditResults);

    // 5. Rechercher une nouvelle image (seulement si forceUpdateImage est true ou si aucune image n'existe)
    let imageUrl: string | null = null;
    if (forceUpdateImage || !existingReport.image_url) {
      try {
        const imageQuery = newReport.title || keyword;
        if (imageQuery) {
          console.log('[API] 🔍 Recherche d\'image pour mise à jour:', imageQuery);
          imageUrl = await serperService.searchImage(imageQuery);
        }
      } catch (imageError) {
        console.warn('[API] ⚠️ Erreur lors de la recherche d\'image:', imageError);
        imageUrl = null;
      }
    }

    // 6. Mettre à jour le rapport en préservant l'image existante (sauf si forceUpdateImage)
    const success = await updateReport(reportId, {
      score: newReport.confidenceScore ?? existingReport.score,
      content: {
        ...newReport,
        keyword: keyword, // Préserver le keyword original
        slug: (content as any).slug, // Préserver le slug pour ne pas casser les URLs
      },
      category: newReport.category || existingReport.category,
      imageUrl: imageUrl,
      forceUpdateImage: forceUpdateImage,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du rapport' },
        { status: 500 }
      );
    }

    console.log('[API] ✅ Rapport mis à jour avec succès:', reportId);

    return NextResponse.json({
      success: true,
      message: 'Rapport mis à jour avec succès',
      reportId,
    });
  } catch (error) {
    console.error('[API] ❌ Erreur lors de la mise à jour du rapport:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour: ${errorMessage}` },
      { status: 500 }
    );
  }
}


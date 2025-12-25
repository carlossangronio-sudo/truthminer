import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportContent } from '@/lib/supabase/client';
import { OpenAIService } from '@/lib/services/openai';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

/**
 * Route API admin pour régénérer tous les rapports avec le nouveau format JSON
 * POST /api/admin/bulk-regenerate
 * 
 * Cette route :
 * 1. Récupère tous les rapports de Supabase
 * 2. Pour chaque rapport, prend le title actuel
 * 3. Recherche des discussions Reddit
 * 4. Régénère l'analyse avec le nouveau format (deep_analysis, reddit_quotes)
 * 5. Met à jour uniquement le champ content (NE TOUCHE PAS à url_image)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier une clé secrète simple pour protéger cette route
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    console.log('[Admin] Début de la régénération en masse des rapports...');

    // 1. Récupérer tous les rapports
    const allReports = await getAllReports();
    console.log(`[Admin] ${allReports.length} rapports trouvés`);

    const results = {
      total: allReports.length,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{
        id: string;
        productName: string;
        title: string;
        status: 'updated' | 'skipped' | 'error';
        error?: string;
      }>,
    };

    const openaiService = new OpenAIService();
    const serperService = new SerperService();

    // 2. Pour chaque rapport, régénérer avec le nouveau format
    for (const report of allReports) {
      try {
        // Extraire le titre actuel depuis le contenu JSON
        let currentTitle = report.product_name;
        try {
          const content = typeof report.content === 'object'
            ? report.content
            : JSON.parse(report.content || '{}');
          currentTitle = content.title || report.product_name;
        } catch (e) {
          console.warn(`[Admin] Impossible de parser le contenu pour ${report.id}, utilisation du product_name`);
        }

        console.log(`[Admin] Traitement de: ${currentTitle} (ID: ${report.id})`);

        // Rechercher des discussions Reddit
        const redditResults = await serperService.searchReddit(currentTitle);
        
        if (!redditResults || redditResults.length === 0) {
          console.warn(`[Admin] ⚠ Aucun résultat Reddit pour ${currentTitle}, skip`);
          results.skipped++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            title: currentTitle,
            status: 'skipped',
            error: 'Aucun résultat Reddit',
          });
          continue;
        }

        // Générer le nouveau rapport avec le nouveau format (deep_analysis, reddit_quotes)
        const newReport = await openaiService.generateReport(currentTitle, redditResults);

        // Mettre à jour uniquement le champ content (NE TOUCHE PAS à url_image)
        const success = await updateReportContent(report.id, newReport);

        if (success) {
          results.updated++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            title: currentTitle,
            status: 'updated',
          });
          console.log(`[Admin] ✅ ${currentTitle} régénéré avec succès`);
        } else {
          results.errors++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            title: currentTitle,
            status: 'error',
            error: 'Échec de la mise à jour dans Supabase',
          });
          console.error(`[Admin] ✗ Erreur lors de la mise à jour de ${currentTitle}`);
        }

        // Pause entre chaque rapport pour éviter de surcharger les APIs
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.errors++;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`[Admin] Erreur pour le rapport ${report.id}:`, errorMessage);
        results.details.push({
          id: report.id,
          productName: report.product_name,
          title: report.product_name,
          status: 'error',
          error: errorMessage,
        });
      }
    }

    console.log('[Admin] Régénération terminée:', results);

    return NextResponse.json({
      success: true,
      message: `Régénération terminée : ${results.updated} mis à jour, ${results.skipped} ignorés, ${results.errors} erreurs`,
      results,
    });
  } catch (error) {
    console.error('Erreur lors de la régénération:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la régénération: ${errorMessage}` },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportImage } from '@/lib/supabase/client';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

/**
 * Route API pour ajouter des images aux rapports existants qui n'en ont pas
 * POST /api/admin/add-images-to-reports
 * Headers: Authorization: Bearer <secret-key>
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

    console.log('[Admin] Début de l\'ajout d\'images aux rapports existants...');

    const allReports = await getAllReports();
    const serperService = new SerperService();
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const details = [];

    for (const report of allReports) {
      try {
        // Vérifier si le rapport a déjà une image
        if (report.image_url) {
          skippedCount++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'skipped',
            reason: 'Image déjà présente',
          });
          continue;
        }

        // Extraire le contenu pour obtenir le titre
        const content = typeof report.content === 'object'
          ? report.content
          : JSON.parse(report.content || '{}');

        const title = content.title || report.product_name;
        const products = content.products || [];
        
        // Construire les requêtes de recherche d'image
        const imageSearchQueries = [
          title,
          report.product_name,
          products[0],
        ].filter(Boolean) as string[];

        console.log(`[Admin] Recherche d'image pour "${report.product_name}"...`);

        // Rechercher une image
        let imageUrl: string | null = null;
        for (const searchQuery of imageSearchQueries) {
          if (!searchQuery) continue;
          
          imageUrl = await serperService.searchImage(searchQuery);
          if (imageUrl) {
            console.log(`[Admin] Image trouvée pour "${report.product_name}":`, imageUrl);
            break;
          }
        }

        if (imageUrl) {
          // Mettre à jour le rapport avec l'image
          const success = await updateReportImage(report.id, imageUrl);
          if (success) {
            updatedCount++;
            details.push({
              id: report.id,
              productName: report.product_name,
              status: 'updated',
              imageUrl,
            });
          } else {
            errorCount++;
            details.push({
              id: report.id,
              productName: report.product_name,
              status: 'error',
              message: 'Échec de la mise à jour Supabase',
            });
          }
        } else {
          skippedCount++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'skipped',
            reason: 'Aucune image trouvée',
          });
        }

        // Petite pause pour ne pas surcharger l'API Serper
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (innerError) {
        errorCount++;
        console.error(`[Admin] Erreur lors du traitement du rapport ID ${report.id}:`, innerError);
        details.push({
          id: report.id,
          productName: report.product_name,
          status: 'error',
          message: innerError instanceof Error ? innerError.message : 'Erreur inconnue',
        });
      }
    }

    console.log(`[Admin] Ajout d'images terminé : ${updatedCount} mis à jour, ${skippedCount} ignorés, ${errorCount} erreurs.`);

    return NextResponse.json({
      success: true,
      message: `Ajout d'images terminé : ${updatedCount} mis à jour, ${skippedCount} ignorés, ${errorCount} erreurs`,
      results: {
        total: allReports.length,
        updated: updatedCount,
        skipped: skippedCount,
        errors: errorCount,
        details,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'images aux rapports:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de l'ajout d'images: ${errorMessage}` },
      { status: 500 }
    );
  }
}


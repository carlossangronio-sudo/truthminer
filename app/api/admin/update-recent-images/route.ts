import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportImage } from '@/lib/supabase/client';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

/**
 * Route API pour mettre à jour les images des 10 derniers rapports sans image
 * POST /api/admin/update-recent-images
 * Headers: Authorization: Bearer <ADMIN_SECRET_KEY>
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

    console.log('[Admin] Début de la mise à jour des images des 10 derniers rapports...');

    // Récupérer tous les rapports
    const allReports = await getAllReports();
    
    // Filtrer ceux sans image et prendre les 10 plus récents
    const reportsWithoutImage = allReports
      .filter(report => !report.image_url)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    console.log(`[Admin] ${reportsWithoutImage.length} rapports sans image trouvés (sur ${allReports.length} total)`);

    if (reportsWithoutImage.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun rapport sans image trouvé parmi les 10 derniers',
        results: {
          total: allReports.length,
          withoutImage: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    const serperService = new SerperService();
    let updatedCount = 0;
    let errorCount = 0;
    const details = [];

    for (const report of reportsWithoutImage) {
      try {
        // Extraire le contenu pour obtenir le titre et les produits
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

        console.log(`[Admin] Recherche d'image pour "${report.product_name}" (ID: ${report.id})...`);

        // Rechercher une image
        let imageUrl: string | null = null;
        for (const searchQuery of imageSearchQueries) {
          if (!searchQuery) continue;
          
          imageUrl = await serperService.searchImage(searchQuery);
          if (imageUrl) {
            console.log(`[Admin] Image trouvée pour "${report.product_name}":`, imageUrl);
            break;
          }
          
          // Pause pour éviter le rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (imageUrl) {
          // Mettre à jour le rapport avec l'image
          const success = await updateReportImage(report.id, imageUrl);
          if (success) {
            updatedCount++;
            details.push({
              id: report.id,
              productName: report.product_name,
              imageUrl,
              status: 'updated',
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
          errorCount++;
          details.push({
            id: report.id,
            productName: report.product_name,
            status: 'error',
            message: 'Aucune image trouvée via Serper',
          });
        }
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

    console.log(`[Admin] Mise à jour terminée : ${updatedCount} mis à jour, ${errorCount} erreurs.`);

    return NextResponse.json({
      success: true,
      message: `Mise à jour terminée : ${updatedCount} mis à jour, ${errorCount} erreurs`,
      results: {
        total: allReports.length,
        withoutImage: reportsWithoutImage.length,
        updated: updatedCount,
        errors: errorCount,
        details,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour des images: ${errorMessage}` },
      { status: 500 }
    );
  }
}







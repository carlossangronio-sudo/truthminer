import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportImage } from '@/lib/supabase/client';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

/**
 * Route API pour régénérer l'image d'un rapport spécifique
 * POST /api/admin/regenerate-image
 * Body: { reportId: string }
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

    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Le paramètre "reportId" est requis' },
        { status: 400 }
      );
    }

    console.log(`[Admin] Régénération d'image pour le rapport ID: ${reportId}`);

    // Récupérer tous les rapports pour trouver celui avec cet ID
    const allReports = await getAllReports();
    const report = allReports.find(r => r.id === reportId);

    if (!report) {
      return NextResponse.json(
        { error: 'Rapport non trouvé' },
        { status: 404 }
      );
    }

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

    const serperService = new SerperService();
    let imageUrl: string | null = null;

    // Rechercher une image
    for (const searchQuery of imageSearchQueries) {
      if (!searchQuery) continue;
      
      try {
        imageUrl = await serperService.searchImage(searchQuery);
        if (imageUrl) {
          console.log(`[Admin] Image trouvée pour "${report.product_name}":`, imageUrl);
          break;
        }
      } catch (error) {
        console.warn(`[Admin] Erreur lors de la recherche d'image pour "${searchQuery}":`, error);
      }
      
      // Pause pour éviter le rate limit
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (imageUrl) {
      // Mettre à jour le rapport avec l'image
      const success = await updateReportImage(report.id, imageUrl);
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Image régénérée avec succès',
          imageUrl,
        });
      } else {
        return NextResponse.json(
          { error: 'Échec de la mise à jour Supabase' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Aucune image trouvée via Serper' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[Admin] Erreur lors de la régénération d\'image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la régénération d'image: ${errorMessage}` },
      { status: 500 }
    );
  }
}



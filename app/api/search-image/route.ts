import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

/**
 * Route API pour rechercher une image côté client (fallback)
 * GET /api/search-image?q=PRODUIT
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre "q" est requis' },
        { status: 400 }
      );
    }

    // Vérifier que SERPER_API_KEY est disponible
    if (!process.env.SERPER_API_KEY) {
      console.error('[API] SERPER_API_KEY is not defined');
      return NextResponse.json(
        {
          success: false,
          imageUrl: null,
          error: 'SERPER_API_KEY is not configured on the server',
        },
        { status: 500 }
      );
    }

    const serperService = new SerperService();
    const imageUrl = await serperService.searchImage(query.trim());

    return NextResponse.json({
      success: !!imageUrl,
      imageUrl: imageUrl || null,
      query: query.trim(),
    });
  } catch (error) {
    console.error('[API] Erreur lors de la recherche d\'image (fallback):', error);
    
    // Message d'erreur plus détaillé pour le débogage
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Logger la stack trace en développement
      if (process.env.NODE_ENV === 'development') {
        console.error('[API] Stack trace:', error.stack);
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        imageUrl: null,
        error: errorMessage,
        // Ajouter des détails en développement
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}


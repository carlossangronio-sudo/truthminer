import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Route ADMIN désactivée pour éviter toute consommation automatique de crédits Serper.
 * L'ajout d'images aux anciens rapports ne doit plus passer par cette API.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Route /api/admin/add-images-to-reports désactivée pour protéger les crédits Serper. Utilisez uniquement /api/generate-report.',
    },
    { status: 503 }
  );
}








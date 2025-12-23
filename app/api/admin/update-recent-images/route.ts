import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Route ADMIN désactivée pour éviter toute consommation automatique de crédits Serper.
 * Toute mise à jour d'images en masse doit désormais se faire manuellement (hors API publique).
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Route /api/admin/update-recent-images désactivée pour protéger les crédits Serper. Utilisez uniquement /api/generate-report.',
    },
    { status: 503 }
  );
}








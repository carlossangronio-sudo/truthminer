import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Route ADMIN désactivée pour éviter toute consommation automatique de crédits Serper.
 * Toute régénération d'image doit désormais passer par un script manuel ou un outil externe.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Route /api/admin/regenerate-image désactivée pour protéger les crédits Serper. Utilisez uniquement /api/generate-report.',
    },
    { status: 503 }
  );
}




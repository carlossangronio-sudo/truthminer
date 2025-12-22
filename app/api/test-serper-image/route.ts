import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || 'iPhone 15';

    const serperService = new SerperService();
    const imageUrl = await serperService.searchImage(query);

    return NextResponse.json({
      query,
      imageUrl,
      success: !!imageUrl,
    });
  } catch (error) {
    console.error('[Test] Erreur:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false,
      },
      { status: 500 }
    );
  }
}






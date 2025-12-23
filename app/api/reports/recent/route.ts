import { NextRequest, NextResponse } from 'next/server';
import { getRecentReports } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const rows = await getRecentReports(limit);

    const items = rows.map((row) => {
      const content =
        typeof row.content === 'object'
          ? row.content
          : JSON.parse(row.content || '{}');

      return {
        id: row.id,
        productName: content.keyword || row.product_name,
        score: row.score,
        slug: content.slug || null,
        title: content.title || content.keyword || row.product_name,
        choice: content.choice || '',
        createdAt: row.created_at,
        // MÊME LOGIQUE QUE app/api/reports/all/route.ts : row.image_url || content.imageUrl || null
        report: {
          ...content,
          imageUrl: row.image_url || content.imageUrl || null,
        },
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports récents:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les analyses récentes' },
      { status: 500 }
    );
  }
}








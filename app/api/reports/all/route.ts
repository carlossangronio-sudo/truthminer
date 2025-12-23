import { NextRequest, NextResponse } from 'next/server';
import { getAllReports } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const reports = await getAllReports(category || undefined);

    const formattedReports = reports.map((row) => {
      const content = typeof row.content === 'object' 
        ? row.content 
        : JSON.parse(row.content || '{}');
      
      return {
        id: row.id,
        productName: row.product_name,
        score: row.score,
        category: row.category || content.category || 'Services',
        slug: content.slug || row.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        title: content.title || row.product_name,
        choice: content.choice || 'Non spécifié',
        createdAt: row.created_at,
        imageUrl: row.image_url || content.imageUrl || null,
        report: content,
      };
    });

    return NextResponse.json({ success: true, reports: formattedReports });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les rapports:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la récupération des rapports: ${errorMessage}` },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';
import { OpenAIService } from '@/lib/services/openai';
import { getCachedReport, insertReport } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

/**
 * Route API pour générer un rapport de comparaison de produits
 * POST /api/generate-report
 * Body: { keyword: string }
 *
 * Note: Aucun stockage persistant n'est utilisé côté serveur.
 * Le rapport est renvoyé directement au frontend qui le gère en mémoire (state).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre "keyword" est requis et doit être une chaîne non vide' },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();
    const normalizedProductName = trimmedKeyword.toLowerCase();

    // 1. Vérifier dans Supabase si un rapport existe déjà pour ce produit (cache)
    const existing = await getCachedReport(normalizedProductName);

    if (existing) {
      return NextResponse.json({
        success: true,
        report: {
          ...(typeof existing.content === 'object'
            ? existing.content
            : JSON.parse(existing.content || '{}')),
          keyword: trimmedKeyword,
          createdAt: existing.created_at,
          confidenceScore: existing.score,
        },
        cached: true,
      });
    }

    // 2. Sinon, on génère un nouveau rapport avec Serper + OpenAI
    const serperService = new SerperService();
    const redditResults = await serperService.searchReddit(trimmedKeyword);

    if (redditResults.length === 0) {
      return NextResponse.json(
        { error: 'Aucune discussion Reddit trouvée pour ce mot-clé' },
        { status: 404 }
      );
    }

    const openaiService = new OpenAIService();
    const report = await openaiService.generateReport(trimmedKeyword, redditResults);

    const now = new Date().toISOString();

    // 3. Sauvegarder le rapport dans Supabase pour figer le score et le contenu
    await insertReport({
      normalizedProductName,
      score: report.confidenceScore ?? 50,
      content: report,
      category: report.category,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        keyword: trimmedKeyword,
        createdAt: now,
      },
      cached: false,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json(
      { error: `Erreur lors de la génération du rapport: ${errorMessage}` },
      { status: 500 }
    );
  }
}



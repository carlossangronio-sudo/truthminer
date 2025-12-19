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
      const existingContent = typeof existing.content === 'object'
        ? existing.content
        : JSON.parse(existing.content || '{}');
      
      return NextResponse.json({
        success: true,
        report: {
          ...existingContent,
          keyword: trimmedKeyword,
          createdAt: existing.created_at,
          confidenceScore: existing.score,
          imageUrl: existing.image_url || existingContent.imageUrl || null,
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

    // 3. Rechercher une image pour le produit AVANT de sauvegarder
    let imageUrl: string | null = null;
    try {
      // Utiliser le titre du rapport ou le mot-clé pour rechercher une image
      // Essayer d'abord avec le titre complet, puis avec le mot-clé
      const imageSearchQueries = [
        report.title,
        trimmedKeyword,
        report.products?.[0] || trimmedKeyword, // Essayer avec le premier produit mentionné
      ].filter(Boolean) as string[];

      console.log('[API] Recherche d\'image pour:', imageSearchQueries);

      // Essayer chaque requête jusqu'à trouver une image
      for (const searchQuery of imageSearchQueries) {
        if (!searchQuery) continue;
        
        imageUrl = await serperService.searchImage(searchQuery);
        if (imageUrl) {
          console.log('[API] Image trouvée avec la requête:', searchQuery, '→', imageUrl);
          break;
        }
      }

      // Si aucune image trouvée après tous les essais, utiliser une image par défaut
      if (!imageUrl) {
        console.log('[API] Aucune image trouvée, utilisation d\'une image placeholder');
        // Ne pas utiliser de placeholder, laisser null pour afficher l'icône
        imageUrl = null;
      }
    } catch (error) {
      console.error('[API] Erreur lors de la recherche d\'image:', error);
      // En cas d'erreur, laisser null pour afficher l'icône
      imageUrl = null;
    }

    // Mettre à jour le rapport avec l'image trouvée
    const reportWithImage = {
      ...report,
      imageUrl: imageUrl || report.imageUrl,
    };

    const now = new Date().toISOString();

    // 4. Sauvegarder le rapport dans Supabase pour figer le score et le contenu
    await insertReport({
      normalizedProductName,
      score: reportWithImage.confidenceScore ?? 50,
      content: reportWithImage,
      category: reportWithImage.category,
      imageUrl: reportWithImage.imageUrl,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      report: {
        ...reportWithImage,
        keyword: trimmedKeyword,
        createdAt: now,
        imageUrl: reportWithImage.imageUrl, // S'assurer que imageUrl est inclus
      },
      cached: false,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    
    let errorMessage = 'Erreur inconnue';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // Logs détaillés pour le debug
      console.error('Stack trace:', error.stack);
    }
    
    // Vérifier les erreurs spécifiques
    if (errorMessage.includes('SERPER_API_KEY')) {
      errorMessage = 'Clé API Serper manquante ou invalide';
    } else if (errorMessage.includes('OPENAI_API_KEY')) {
      errorMessage = 'Clé API OpenAI manquante ou invalide';
    } else if (errorMessage.includes('Supabase')) {
      errorMessage = 'Erreur de connexion à la base de données';
    }
    
    return NextResponse.json(
      { 
        error: `Erreur lors de la génération du rapport: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}



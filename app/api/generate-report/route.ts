import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';
import { OpenAIService } from '@/lib/services/openai';
import { getCachedReport, insertReport } from '@/lib/supabase/client';
import { extractMainKeyword, normalizeKeyword } from '@/lib/utils/keyword-extractor';

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
    
    // INTELLIGENCE DE RECHERCHE : Extraire le nom principal de la phrase
    // Exemple: "Quel est le meilleur iPhone 15 Pro Max" -> "iPhone 15 Pro Max"
    const searchKeyword = extractMainKeyword(trimmedKeyword);
    const normalizedProductName = normalizeKeyword(searchKeyword);
    
    // 🚨 LOG DE CONTRÔLE : Avertissement avant consommation de crédits
    console.log('🚨 CONSOMMATION CRÉDIT : Appel API Serper initié pour le sujet:', trimmedKeyword);
    
    console.log('[API] 🔍 Requête originale:', trimmedKeyword);
    console.log('[API] 🔍 Mot-clé extrait pour recherche:', searchKeyword);
    console.log('[API] 🔍 Mot-clé normalisé:', normalizedProductName);

    // 1. SYSTÈME DE CACHE ANTI-DOUBLONS : Vérifier EXACTEMENT le même nom dans Supabase
    // Avant de consommer des crédits OpenAI/Serper, on vérifie si un rapport identique existe
    console.log('[API] 🔍 Vérification cache anti-doublons pour:', normalizedProductName);
    const existing = await getCachedReport(normalizedProductName);

    if (existing) {
      console.log('[API] ✅ Rapport existant trouvé (cache hit) - redirection vers le rapport existant');
      const existingContent = typeof existing.content === 'object'
        ? existing.content
        : JSON.parse(existing.content || '{}');
      
      // Retourner le rapport existant avec un flag cached=true
      // Le frontend redirigera automatiquement vers /report/[slug]
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
        redirect: `/report/${existingContent.slug || normalizedProductName}`,
      });
    }

    console.log('[API] ⚠️ Aucun rapport existant trouvé - génération d\'un nouveau rapport (consommation de crédits)');
    console.log('🚨 CONSOMMATION CRÉDIT : Appel API Serper pour recherche Reddit:', searchKeyword);

    // 2. Sinon, on génère un nouveau rapport avec Serper + OpenAI
    // Utiliser le mot-clé extrait pour la recherche (plus précis)
    const serperService = new SerperService();
    const redditResults = await serperService.searchReddit(searchKeyword);
    
    console.log('🚨 CONSOMMATION CRÉDIT : Appel API OpenAI pour génération rapport:', trimmedKeyword);

    if (redditResults.length === 0) {
      return NextResponse.json(
        { error: 'Aucune discussion Reddit trouvée pour ce mot-clé' },
        { status: 404 }
      );
    }

    const openaiService = new OpenAIService();
    // Passer le mot-clé original pour l'affichage, mais utiliser searchKeyword pour la recherche
    const report = await openaiService.generateReport(trimmedKeyword, redditResults);

    const now = new Date().toISOString();

    // 3. RÉCUPÉRATION D'UNE IMAGE (UNE SEULE TENTATIVE, SANS BOUCLE)
    // On utilise Serper pour tenter de récupérer une image pertinente,
    // mais sans relancer plusieurs recherches ni boucler.
    let imageUrl: string | null = null;
    try {
      const imageQuery = report.title || trimmedKeyword;
      if (imageQuery) {
        console.log('[API] 🔍 Recherche d\'image unique avant insertion pour:', imageQuery);
        imageUrl = await serperService.searchImage(imageQuery);
      }
    } catch (imageError) {
      console.warn('[API] ⚠️ Erreur lors de la recherche d\'image (tentative unique):', imageError);
      // On ne relance PAS de recherche, et on continue sans image
      imageUrl = null;
    }

    // 4. Sauvegarder le rapport dans Supabase en incluant l'image si trouvée
    console.log('[API] 💾 Sauvegarde dans Supabase avec image_url si disponible...');
    console.log('[API] URL IMAGE RÉCUPÉRÉE:', imageUrl);
    console.log('[API] TENTATIVE INSERTION DANS COLONNE image_url');
    
    let reportId: string | null = null;
    try {
      reportId = await insertReport({
        normalizedProductName,
        score: report.confidenceScore ?? 50,
        // Stocker aussi l'URL d'image dans le contenu JSON pour cohérence
        content: {
          ...report,
          imageUrl: imageUrl ?? (report as any).imageUrl ?? null,
        },
        category: report.category,
        imageUrl: imageUrl ?? undefined,
        createdAt: now,
      });
      
      console.log('[API] ✅ Rapport sauvegardé avec succès dans Supabase (ID:', reportId, ', image_url:', imageUrl, ')');
    } catch (insertError) {
      // Erreur critique : on ne peut pas continuer sans sauvegarder
      console.error('[API] ❌ ERREUR CRITIQUE lors de l\'insertion Supabase:', insertError);
      
      if (insertError instanceof Error) {
        console.error('[API] Message d\'erreur:', insertError.message);
        console.error('[API] Stack trace:', insertError.stack);
      }
      
      // Retourner une erreur explicite
      return NextResponse.json(
        {
          error: 'Erreur lors de l\'enregistrement du rapport dans Supabase',
          details: process.env.NODE_ENV === 'development' 
            ? (insertError instanceof Error ? insertError.message : String(insertError))
            : undefined,
        },
        { status: 500 }
      );
    }

    // 5. Retourner le rapport en incluant l'URL d'image si trouvée
    // Aucune relance ou boucle supplémentaire n'est effectuée pour l'image.
    return NextResponse.json({
      success: true,
      report: {
        ...report,
        keyword: trimmedKeyword,
        createdAt: now,
        imageUrl: imageUrl ?? (report as any).imageUrl ?? null,
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



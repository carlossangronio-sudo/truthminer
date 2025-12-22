import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';
import { OpenAIService } from '@/lib/services/openai';
import { getCachedReport, insertReport, updateReportImage } from '@/lib/supabase/client';
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

    // 2. Sinon, on génère un nouveau rapport avec Serper + OpenAI
    // Utiliser le mot-clé extrait pour la recherche (plus précis)
    const serperService = new SerperService();
    const redditResults = await serperService.searchReddit(searchKeyword);

    if (redditResults.length === 0) {
      return NextResponse.json(
        { error: 'Aucune discussion Reddit trouvée pour ce mot-clé' },
        { status: 404 }
      );
    }

    const openaiService = new OpenAIService();
    // Passer le mot-clé original pour l'affichage, mais utiliser searchKeyword pour la recherche
    const report = await openaiService.generateReport(trimmedKeyword, redditResults);

    // Vérifier si OpenAI a détecté une hallucination (résultats non pertinents)
    if (report && 'error' in report) {
      return NextResponse.json(
        { error: report.error || 'Les résultats de recherche Reddit ne correspondent pas au sujet demandé. Il n\'y a pas assez d\'avis fiables pour générer une analyse fiable à ce moment.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 3. PRIORITÉ : Sauvegarder le rapport dans Supabase IMMÉDIATEMENT (sans attendre l'image)
    // Le texte est plus important que l'image, donc on sauvegarde d'abord
    console.log('[API] 💾 Sauvegarde PRIORITAIRE dans Supabase (sans image pour l\'instant)...');
    
    let reportId: string | null = null;
    try {
      reportId = await insertReport({
        normalizedProductName,
        score: report.confidenceScore ?? 50,
        content: report,
        category: report.category,
        imageUrl: undefined, // Pas d'image pour l'instant, on la cherchera après
        createdAt: now,
      });
      
      console.log('[API] ✅ Rapport sauvegardé avec succès dans Supabase (ID:', reportId, ')');
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

    // 4. RECHERCHE IMAGE (OPTIONNELLE) : Après l'insertion, lancer la recherche d'image
    // Cette étape est NON-BLOQUANTE et se fait en arrière-plan
    // Si elle échoue ou timeout, ce n'est pas grave : le rapport texte reste dans la base
    const imageSearchPromise = (async () => {
      try {
        const imageSearchQueries = [
          report.title,
          trimmedKeyword,
          report.products?.[0] || trimmedKeyword,
        ].filter(Boolean) as string[];

        console.log('[API] 🔍 Recherche d\'image (optionnelle) pour:', imageSearchQueries);

        let imageUrl: string | null = null;
        
        // Essayer chaque requête jusqu'à trouver une image
        for (const searchQuery of imageSearchQueries) {
          if (!searchQuery) continue;
          
          try {
            imageUrl = await serperService.searchImage(searchQuery);
            if (imageUrl) {
              console.log('[API] ✅ Image trouvée avec la requête:', searchQuery, '→', imageUrl);
              break;
            }
          } catch (searchError) {
            console.warn('[API] ⚠️ Erreur lors de la recherche d\'image pour:', searchQuery, searchError);
            // Continuer avec le terme suivant
          }
        }

        // 5. MISE À JOUR : Si une image est trouvée, faire un UPDATE sur la ligne créée
        if (imageUrl && reportId) {
          console.log('[API] 📸 Mise à jour du rapport avec l\'image trouvée:', imageUrl);
          
          try {
            const success = await updateReportImage(reportId, imageUrl);
            
            if (success) {
              console.log('[API] ✅ Image mise à jour avec succès dans Supabase');
            } else {
              console.warn('[API] ⚠️ Échec de la mise à jour de l\'image dans Supabase');
            }
          } catch (updateError) {
            console.error('[API] ❌ Erreur lors de la mise à jour de l\'image:', updateError);
            // Ne pas bloquer, l'image sera cherchée plus tard via le fallback
          }
        } else if (!imageUrl) {
          console.log('[API] ⚠️ Aucune image trouvée après tous les essais');
        }
      } catch (error) {
        console.error('[API] ❌ Erreur globale lors de la recherche d\'image (optionnelle):', error);
        // Ne pas bloquer, l'image sera cherchée plus tard via le fallback
        // Le rapport texte reste dans la base même si l'image échoue
      }
    })();

    // Ne pas attendre la recherche d'image, on répond immédiatement
    // La recherche continuera en arrière-plan et ne bloquera pas la réponse
    imageSearchPromise.catch((error) => {
      console.error('[API] Erreur non gérée dans la recherche d\'image asynchrone:', error);
      // Même en cas d'erreur, le rapport texte reste sauvegardé
    });

    // Retourner le rapport sans attendre l'image
    // L'image sera ajoutée plus tard si elle est trouvée
    return NextResponse.json({
      success: true,
      report: {
        ...report,
        keyword: trimmedKeyword,
        createdAt: now,
        imageUrl: null, // L'image sera ajoutée en arrière-plan si trouvée
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



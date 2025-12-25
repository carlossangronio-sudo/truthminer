import { NextRequest, NextResponse } from 'next/server';
import { SerperService } from '@/lib/services/serper';
import { OpenAIService } from '@/lib/services/openai';
import { getCachedReport, getReportByTitle, insertReport } from '@/lib/supabase/client';
import { extractMainKeyword, normalizeKeyword, normalizeProductName, generateSlug } from '@/lib/utils/keyword-extractor';
import { createClient } from '@/utils/supabase/server';

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
    
    // Normalisation avancée pour la détection de doublons (supprime articles et ponctuation)
    // Exemple: "L'iPhone 17" -> "iphone 17"
    const cleanQuery = normalizeProductName(searchKeyword);
    
    // 🚨 LOG DE CONTRÔLE : Avertissement avant consommation de crédits
    console.log('🚨 CONSOMMATION CRÉDIT : Appel API Serper initié pour le sujet:', trimmedKeyword);
    
    console.log('[API] 🔍 Requête originale:', trimmedKeyword);
    console.log('[API] 🔍 Mot-clé extrait pour recherche:', searchKeyword);
    console.log('[API] 🔍 Mot-clé normalisé:', normalizedProductName);
    console.log('[API] 🔍 Mot-clé nettoyé (anti-doublon):', cleanQuery);

    // 1. SYSTÈME DE CACHE ANTI-DOUBLONS RENFORCÉ : Vérifier si un rapport existe déjà
    // Avant de consommer des crédits OpenAI/Serper, on vérifie si un rapport identique existe
    // La normalisation gère les variations : 'iphone 13' = 'iPhone 13' = 'IPHONE 13' = "L'iPhone 13"
    // 
    // IMPORTANT : Cette vérification est CRITIQUE pour éviter le contenu dupliqué Google
    // Si plusieurs utilisateurs demandent la même chose, on redirige vers le rapport existant
    console.log('[API] 🔍 Vérification cache anti-doublons avec ilike pour:', cleanQuery);
    
    // Vérification 1 : Recherche avec ilike sur product_name (détection de doublons améliorée)
    // On utilise ilike pour être insensible à la casse et détecter les variations comme "L'iPhone 17" = "iPhone 17"
    const supabase = createClient();
    const { data: existingReport, error: searchError } = await supabase
      .from('reports')
      .select('*')
      .ilike('product_name', `%${cleanQuery}%`)
      .maybeSingle();
    
    // Si on trouve un rapport avec un nom similaire, on le renvoie directement SANS appeler l'IA
    if (existingReport && !searchError) {
      console.log(`[API] ✅ Doublon détecté pour "${trimmedKeyword}" (nom nettoyé: "${cleanQuery}"). Renvoi du rapport existant (ID: ${existingReport.id}) - ÉVITE APPEL IA`);
      const existingContent = typeof existingReport.content === 'object'
        ? existingReport.content
        : JSON.parse(existingReport.content || '{}');
      
      const existingSlug = existingContent.slug || generateSlug(existingContent.title || existingReport.product_name);
      
      // Retourner le rapport existant sans générer de nouveau contenu
      return NextResponse.json({
        success: true,
        report: {
          ...existingContent,
          keyword: trimmedKeyword,
          createdAt: existingReport.created_at,
          confidenceScore: existingReport.score,
          imageUrl: existingReport.image_url || existingReport.url_image || existingContent.imageUrl || null,
        },
        cached: true,
        isDuplicate: true,
        redirect: `/report/${existingSlug}`,
      });
    }
    
    // Vérification 2 : Par product_name normalisé (méthode classique, pour compatibilité et cas limites)
    console.log('[API] 🔍 Aucun doublon trouvé avec ilike, vérification avec normalizeKeyword...');
    const existing = await getCachedReport(normalizedProductName);

    if (existing) {
      console.log('[API] ✅ Rapport existant trouvé par product_name (cache hit) - redirection vers le rapport existant');
      const existingContent = typeof existing.content === 'object'
        ? existing.content
        : JSON.parse(existing.content || '{}');
      
      // Extraire le slug du rapport existant
      const existingSlug = existingContent.slug || generateSlug(existingContent.title || normalizedProductName);
      
      // Retourner le rapport existant avec un flag cached=true
      // Le frontend redirigera automatiquement vers /report/[slug]
      // Cela évite le contenu dupliqué pour Google
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
        redirect: `/report/${existingSlug}`,
      });
    }

    // Vérification 2 : Par slug potentiel (avant génération)
    // Si le slug généré à partir du mot-clé existe déjà, on redirige
    const potentialSlug = generateSlug(searchKeyword);
    if (potentialSlug) {
      const { getReportBySlug } = await import('@/lib/supabase/client');
      const existingBySlug = await getReportBySlug(potentialSlug);
      
      if (existingBySlug) {
        console.log('[API] ✅ Rapport existant trouvé par slug (cache hit) - redirection vers le rapport existant');
        const existingContent = typeof existingBySlug.content === 'object'
          ? existingBySlug.content
          : JSON.parse(existingBySlug.content || '{}');
        
        return NextResponse.json({
          success: true,
          report: {
            ...existingContent,
            keyword: trimmedKeyword,
            createdAt: existingBySlug.created_at,
            confidenceScore: existingBySlug.score,
            imageUrl: existingBySlug.image_url || existingContent.imageUrl || null,
          },
          cached: true,
          redirect: `/report/${potentialSlug}`,
        });
      }
    }

    console.log('[API] ⚠️ Aucun rapport existant trouvé par product_name - génération d\'un nouveau rapport (consommation de crédits)');
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

    // 2.5. SÉCURITÉ ANTI-DOUBLONS PAR TITRE ET SLUG : Vérifier si un rapport avec le même titre ou slug existe déjà
    // Cela évite de créer des doublons si le titre généré par OpenAI correspond à un rapport existant
    // IMPORTANT : Cette vérification est CRITIQUE pour éviter le contenu dupliqué Google
    if (report.title) {
      console.log('[API] 🔍 Vérification anti-doublons par titre pour:', report.title);
      const existingByTitle = await getReportByTitle(report.title);
      
      if (existingByTitle) {
        console.log('[API] ✅ Rapport existant trouvé par titre (cache hit) - redirection vers le rapport existant');
        const existingContent = typeof existingByTitle.content === 'object'
          ? existingByTitle.content
          : JSON.parse(existingByTitle.content || '{}');
        
        const existingSlug = existingContent.slug || generateSlug(existingByTitle.product_name);
        
        return NextResponse.json({
          success: true,
          report: {
            ...existingContent,
            keyword: trimmedKeyword,
            createdAt: existingByTitle.created_at,
            confidenceScore: existingByTitle.score,
            imageUrl: existingByTitle.image_url || existingContent.imageUrl || null,
          },
          cached: true,
          redirect: `/report/${existingSlug}`,
        });
      }
      
      // Vérification supplémentaire par slug généré depuis le titre
      const reportSlug = report.slug || generateSlug(report.title);
      if (reportSlug) {
        const { getReportBySlug } = await import('@/lib/supabase/client');
        const existingBySlug = await getReportBySlug(reportSlug);
        
        if (existingBySlug) {
          console.log('[API] ✅ Rapport existant trouvé par slug généré (cache hit) - redirection vers le rapport existant');
          const existingContent = typeof existingBySlug.content === 'object'
            ? existingBySlug.content
            : JSON.parse(existingBySlug.content || '{}');
          
          return NextResponse.json({
            success: true,
            report: {
              ...existingContent,
              keyword: trimmedKeyword,
              createdAt: existingBySlug.created_at,
              confidenceScore: existingBySlug.score,
              imageUrl: existingBySlug.image_url || existingContent.imageUrl || null,
            },
            cached: true,
            redirect: `/report/${reportSlug}`,
          });
        }
      }
    }

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
    console.log('[DEBUG] URL d\'image à insérer :', imageUrl);
    console.log('[DEBUG] Clé utilisée pour Supabase :', 'image_url');
    
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



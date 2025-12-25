import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// On définit la clé par défaut si non présente dans le .env
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

// Configuration pour éviter les timeouts Vercel (max 10s en Hobby, 60s en Pro)
export const maxDuration = 10; // Limité à 10s sur Vercel Hobby

// Fonction commune de traitement pour éviter les erreurs 405 (Method Not Allowed)
async function handleRegeneration(req: Request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const targetId = searchParams.get('id');
    const targetProductName = searchParams.get('product_name');

    console.log('[BulkRegenerate] Démarrage - Params:', { 
      hasKey: !!key, 
      targetId, 
      targetProductName 
    });

    // 1. Vérification de sécurité
    if (!key || key !== ADMIN_SECRET_KEY) {
      console.log('[BulkRegenerate] ❌ Clé invalide');
      return NextResponse.json({ 
        error: 'Accès non autorisé', 
        debug: "La clé fournie ne correspond pas à la configuration." 
      }, { status: 401 });
    }

    // 2. SÉCURITÉ TIMEOUT : Sur Vercel Hobby (10s max), on ne peut traiter qu'un rapport à la fois
    if (!targetId && !targetProductName) {
      return NextResponse.json({
        error: "Mode complet désactivé pour éviter les timeouts",
        message: "Sur Vercel Hobby, la limite est de 10 secondes. Tu dois traiter un rapport à la fois.",
        instruction: "Utilise l'un de ces paramètres pour cibler un seul rapport :",
        options: {
          byId: "?key=truthminer-admin-2024&id=TON_ID_ICI",
          byProductName: "?key=truthminer-admin-2024&product_name=iPhone%2015%20Pro"
        },
        tip: "Pour régénérer tous les rapports, appelle cette URL plusieurs fois avec différents IDs"
      }, { status: 400 });
    }

    console.log('[BulkRegenerate] ✅ Clé validée');

    const supabase = createClient();

    // 3. Sélection des rapports (un seul rapport uniquement)
    let query = supabase.from('reports').select('id, product_name, image_url');
    
    // Filtre par ID si fourni (mode test sur un seul rapport)
    if (targetId) {
      console.log('[BulkRegenerate] Filtre par ID:', targetId);
      query = query.eq('id', targetId);
    }
    // Sinon, filtre par product_name si fourni (alternative pour mode test)
    else if (targetProductName) {
      console.log('[BulkRegenerate] Filtre par product_name:', targetProductName);
      query = query.eq('product_name', targetProductName);
    }

    console.log('[BulkRegenerate] Exécution requête Supabase...');
    const { data: reports, error: fetchError } = await query;

    if (fetchError) {
      console.error('[BulkRegenerate] ❌ Erreur Supabase:', fetchError);
      return NextResponse.json({ 
        error: "Erreur Supabase", 
        details: fetchError.message 
      }, { status: 500 });
    }

    console.log('[BulkRegenerate] ✅ Rapports récupérés:', reports?.length || 0);

    if (!reports || reports.length === 0) {
      return NextResponse.json({ 
        message: "Aucun rapport trouvé pour ce critère.",
        searched: targetId ? `ID: ${targetId}` : `product_name: ${targetProductName}`
      });
    }

    // On ne traite que le premier rapport pour éviter les timeouts
    const report = reports[0];
    const productName = report.product_name || "Produit inconnu";
    
    console.log(`[BulkRegenerate] Traitement: ${productName} (ID: ${report.id})`);
    
    try {
      // PROMPT NARRATIF V3 (Évite les redondances)
      const prompt = `Tu es l'IA experte de TruthMiner. Analyse ce produit : ${productName}.
      
      STRUCTURE JSON STRICTE :
      {
        "consensus": "Résumé percutant en une phrase.",
        "pros": ["Avantage 1", "Avantage 2", "Avantage 3"],
        "cons": ["Inconvénient 1", "Inconvénient 2", "Inconvénient 3"],
        "deep_analysis": "Rédige 3 paragraphes narratifs détaillés (Contexte / Usage réel / Verdict).",
        "reddit_quotes": [
          {"user": "u/RedditUser", "text": "Citation réelle et marquante", "subreddit": "r/tech"}
        ],
        "target_audience": {"yes": "Cible idéale", "no": "À éviter"},
        "punchline": "Métaphore originale",
        "final_verdict": "Verdict brut"
      }

      RÈGLES : Pas de répétition. Pas de listes dans deep_analysis. Ton tranchant.`;

      console.log(`[BulkRegenerate] Appel OpenAI pour: ${productName}`);
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "Expert en analyse de sentiment Reddit. Réponse JSON uniquement." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      console.log(`[BulkRegenerate] ✅ Réponse OpenAI reçue pour: ${productName}`);
      const newContent = JSON.parse(aiResponse.choices[0].message.content || '{}');

      // Mise à jour (Sécurité image_url : on ne touche qu'au content et updated_at)
      // La colonne image_url (ton travail du 23/12) est préservée car absente de l'update
      console.log(`[BulkRegenerate] Mise à jour Supabase pour: ${productName}`);
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          content: newContent, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', report.id);

      if (updateError) {
        console.error(`[BulkRegenerate] ❌ Erreur update pour ${productName}:`, updateError);
        throw updateError;
      }
      
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log(`[BulkRegenerate] ✅ Rapport mis à jour: ${productName} (${duration}s)`);

      return NextResponse.json({
        status: "success",
        message: `Rapport régénéré avec succès: ${productName}`,
        reportId: report.id,
        productName: productName,
        duration: `${duration}s`
      });
    } catch (err: any) {
      console.error(`[BulkRegenerate] ❌ Erreur pour ${productName}:`, err.message);
      return NextResponse.json({
        status: "error",
        error: err.message,
        productName: productName,
        reportId: report.id
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[BulkRegenerate] ❌ Erreur globale:', error);
    return NextResponse.json({
      error: "Erreur lors du traitement",
      message: error.message
    }, { status: 500 });
  }
}

// On exporte GET pour le navigateur et POST pour les outils admin
export async function GET(req: Request) {
  return handleRegeneration(req);
}

export async function POST(req: Request) {
  return handleRegeneration(req);
}

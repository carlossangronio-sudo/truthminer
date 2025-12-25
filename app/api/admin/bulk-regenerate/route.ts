import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// On définit la clé par défaut si non présente dans le .env
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

// Configuration pour éviter les timeouts Vercel (max 10s en Hobby, 60s en Pro)
export const maxDuration = 60; // Secondes (nécessite Vercel Pro pour > 10s)

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

    console.log('[BulkRegenerate] ✅ Clé validée');

    const supabase = createClient();

    // 2. Sélection des rapports (Correction : colonnes réelles de la table reports)
    // On récupère uniquement les colonnes qui existent : id, product_name, image_url
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
    } else {
      console.log('[BulkRegenerate] Mode complet : tous les rapports');
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
      return NextResponse.json({ message: "Aucun rapport trouvé pour ce critère." });
    }

    const results = { success: 0, failed: 0, total: reports.length, details: [] as any[] };

    console.log('[BulkRegenerate] Début traitement de', reports.length, 'rapport(s)');

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const productName = report.product_name || "Produit inconnu";
      
      console.log(`[BulkRegenerate] [${i + 1}/${reports.length}] Traitement: ${productName}`);
      
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

        // 3. Mise à jour (Sécurité image_url : on ne touche qu'au content et updated_at)
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
        
        console.log(`[BulkRegenerate] ✅ Rapport mis à jour: ${productName}`);
        results.success++;

        // Si c'est un test sur un seul rapport, on s'arrête là
        if (targetId || targetProductName) {
          console.log('[BulkRegenerate] Mode test : arrêt après le premier rapport');
          break;
        }

        // Petit délai pour éviter de saturer l'API OpenAI
        if (i < reports.length - 1) {
          await new Promise(r => setTimeout(r, 400));
        }
      } catch (err: any) {
        console.error(`[BulkRegenerate] ❌ Erreur pour ${productName}:`, err.message);
        results.failed++;
        results.details.push({ product: productName, error: err.message });
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[BulkRegenerate] ✅ Terminé en ${duration}s - Stats:`, results);

    return NextResponse.json({
      status: "Migration terminée",
      stats: results,
      duration: `${duration}s`
    });
  } catch (error: any) {
    console.error('[BulkRegenerate] ❌ Erreur globale:', error);
    return NextResponse.json({
      error: "Erreur lors du traitement",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

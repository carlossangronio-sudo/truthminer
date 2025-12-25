import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// On définit la clé par défaut si non présente dans le .env
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

// Fonction commune de traitement pour éviter les erreurs 405 (Method Not Allowed)
async function handleRegeneration(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const targetId = searchParams.get('id');
  const targetProductName = searchParams.get('product_name');

  // 1. Vérification de sécurité
  if (!key || key !== ADMIN_SECRET_KEY) {
    return NextResponse.json({ 
      error: 'Accès non autorisé', 
      debug: "La clé fournie ne correspond pas à la configuration." 
    }, { status: 401 });
  }

  const supabase = createClient();

  // 2. Sélection des rapports (Correction : colonnes réelles de la table reports)
  // On récupère uniquement les colonnes qui existent : id, product_name, image_url
  let query = supabase.from('reports').select('id, product_name, image_url');
  
  // Filtre par ID si fourni (mode test sur un seul rapport)
  if (targetId) {
    query = query.eq('id', targetId);
  }
  // Sinon, filtre par product_name si fourni (alternative pour mode test)
  else if (targetProductName) {
    query = query.eq('product_name', targetProductName);
  }

  const { data: reports, error: fetchError } = await query;

  if (fetchError) {
    return NextResponse.json({ 
      error: "Erreur Supabase", 
      details: fetchError.message 
    }, { status: 500 });
  }

  if (!reports || reports.length === 0) {
    return NextResponse.json({ message: "Aucun rapport trouvé pour ce critère." });
  }

  const results = { success: 0, failed: 0, total: reports.length, details: [] as any[] };

  for (const report of reports) {
    const productName = report.product_name || "Produit inconnu";
    
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

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "Expert en analyse de sentiment Reddit. Réponse JSON uniquement." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const newContent = JSON.parse(aiResponse.choices[0].message.content || '{}');

      // 3. Mise à jour (Sécurité image_url : on ne touche qu'au content et updated_at)
      // La colonne image_url (ton travail du 23/12) est préservée car absente de l'update
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          content: newContent, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', report.id);

      if (updateError) throw updateError;
      results.success++;

      // Si c'est un test sur un seul rapport, on s'arrête là
      if (targetId || targetProductName) break;

      // Petit délai pour éviter de saturer l'API OpenAI
      await new Promise(r => setTimeout(r, 400));
    } catch (err: any) {
      results.failed++;
      results.details.push({ product: productName, error: err.message });
    }
  }

  return NextResponse.json({
    status: "Migration terminée",
    stats: results
  });
}

// On exporte GET pour le navigateur et POST pour les outils admin
export async function GET(req: Request) {
  return handleRegeneration(req);
}

export async function POST(req: Request) {
  return handleRegeneration(req);
}

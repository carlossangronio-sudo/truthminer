import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

export const maxDuration = 10; // Limite Vercel Hobby

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const id = searchParams.get('id');
  const productNameParam = searchParams.get('product_name');

  // 1. Sécurité
  if (!key || key !== ADMIN_SECRET_KEY) {
    console.error('[BulkRegenerate] ❌ Clé invalide');
    return NextResponse.json({ 
      error: 'Accès non autorisé' 
    }, { status: 401 });
  }

  const supabase = createClient();

  // --- MODE INDIVIDUEL (Appelé par le navigateur pour 1 rapport) ---
  if (id || productNameParam) {
    try {
      console.log('[BulkRegenerate] Début traitement - ID:', id, 'Product:', productNameParam);
      
      // Étape 1: Récupération du rapport
      let query = supabase.from('reports').select('id, product_name, image_url');
      
      if (id) {
        query = query.eq('id', id);
      } else if (productNameParam) {
        query = query.eq('product_name', productNameParam);
      }

      console.log('[BulkRegenerate] Exécution requête Supabase...');
      const { data: report, error: fetchError } = await query.maybeSingle();
      
      if (fetchError) {
        console.error('[BulkRegenerate] ❌ Erreur Supabase (fetch):', fetchError);
        return NextResponse.json({ 
          success: false,
          error: `Erreur Supabase: ${fetchError.message}`,
          step: 'fetch'
        }, { status: 500 });
      }
      
      if (!report) {
        console.error('[BulkRegenerate] ❌ Rapport non trouvé');
        return NextResponse.json({ 
          success: false,
          error: "Rapport non trouvé",
          step: 'fetch'
        }, { status: 404 });
      }

      const name = report.product_name || "Produit inconnu";
      console.log(`[BulkRegenerate] ✅ Rapport trouvé: ${name} (ID: ${report.id})`);

      // Étape 2: Appel OpenAI
      const prompt = `Tu es l'IA experte de TruthMiner. Analyse ce produit : ${name}.
      
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

      console.log('[BulkRegenerate] Appel OpenAI pour:', name);
      let aiResponse;
      try {
        aiResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: "Expert en analyse de sentiment Reddit. Réponse JSON uniquement." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });
        console.log('[BulkRegenerate] ✅ Réponse OpenAI reçue');
      } catch (openaiError: any) {
        console.error('[BulkRegenerate] ❌ Erreur OpenAI:', openaiError.message);
        return NextResponse.json({ 
          success: false,
          error: `Erreur OpenAI: ${openaiError.message}`,
          step: 'openai'
        }, { status: 500 });
      }

      // Étape 3: Parsing du JSON
      let newContent;
      try {
        const content = aiResponse.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Réponse OpenAI vide');
        }
        console.log('[BulkRegenerate] Parsing JSON (longueur:', content.length, 'caractères)');
        newContent = JSON.parse(content);
        console.log('[BulkRegenerate] ✅ JSON parsé avec succès');
      } catch (parseError: any) {
        console.error('[BulkRegenerate] ❌ Erreur parsing JSON:', parseError.message);
        return NextResponse.json({ 
          success: false,
          error: `Erreur parsing JSON: ${parseError.message}`,
          step: 'parse'
        }, { status: 500 });
      }

      // Étape 4: Mise à jour Supabase
      console.log('[BulkRegenerate] Mise à jour Supabase pour:', name);
      const { error: updateError } = await supabase
        .from('reports')
        .update({ 
          content: newContent, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', report.id);

      if (updateError) {
        console.error('[BulkRegenerate] ❌ Erreur Supabase (update):', updateError);
        return NextResponse.json({ 
          success: false,
          error: `Erreur Supabase (update): ${updateError.message}`,
          step: 'update'
        }, { status: 500 });
      }

      console.log(`[BulkRegenerate] ✅ Rapport mis à jour avec succès: ${name}`);

      return NextResponse.json({ 
        success: true, 
        product: name,
        reportId: report.id
      });
    } catch (err: any) {
      console.error('[BulkRegenerate] ❌ Erreur inattendue:', err);
      return NextResponse.json({ 
        success: false, 
        error: err.message || 'Erreur inconnue',
        step: 'unknown'
      }, { status: 500 });
    }
  }

  // --- MODE TABLEAU DE BORD (Si aucun ID n'est fourni) ---
  const { data: allReports, error: reportsError } = await supabase
    .from('reports')
    .select('id, product_name')
    .order('created_at', { ascending: false });
  
  if (reportsError) {
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des rapports",
      details: reportsError.message 
    }, { status: 500 });
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TruthMiner Migration</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <meta charset="UTF-8">
      </head>
      <body class="bg-[#02010a] text-white font-sans p-4 md:p-10">
        <div class="max-w-2xl mx-auto border border-cyan-500/30 p-6 md:p-8 rounded-3xl bg-[#0a0525]">
          <h1 class="text-xl md:text-2xl font-black italic mb-4 md:mb-6 text-cyan-400 uppercase tracking-tighter">Console de Migration Séquentielle</h1>
          <p class="text-slate-400 mb-4 md:mb-8 text-xs md:text-sm">Vercel Hobby limite les requêtes à 10s. Ce script va traiter vos <strong class="text-cyan-400">${allReports?.length || 0}</strong> rapports un par un directement depuis votre navigateur.</p>
          
          <div class="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300">
            <strong>⚠ Protection active :</strong> La colonne <code class="bg-black/30 px-1 rounded">image_url</code> ne sera pas modifiée. Seul le <code class="bg-black/30 px-1 rounded">content</code> sera régénéré.
          </div>

          <div id="stats" class="mb-6 flex gap-4 text-xs">
            <div class="flex-1 p-3 bg-white/5 rounded-lg text-center">
              <div class="text-2xl font-black text-cyan-400" id="success-count">0</div>
              <div class="text-slate-400 uppercase tracking-widest mt-1">Succès</div>
            </div>
            <div class="flex-1 p-3 bg-white/5 rounded-lg text-center">
              <div class="text-2xl font-black text-red-400" id="error-count">0</div>
              <div class="text-slate-400 uppercase tracking-widest mt-1">Erreurs</div>
            </div>
            <div class="flex-1 p-3 bg-white/5 rounded-lg text-center">
              <div class="text-2xl font-black text-yellow-400" id="remaining-count">${allReports?.length || 0}</div>
              <div class="text-slate-400 uppercase tracking-widest mt-1">Restants</div>
            </div>
          </div>
          
          <div id="progress-container" class="space-y-1 mb-6 max-h-60 overflow-y-auto border-t border-white/5 pt-4 text-xs">
            <!-- Les progrès s'afficheront ici -->
          </div>

          <button id="start-btn" class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
            Démarrer la régénération
          </button>
          
          <p class="text-[10px] text-slate-500 mt-4 text-center">
            Ne ferme pas cette page pendant le traitement. Chaque rapport prend environ 5-8 secondes.
          </p>
        </div>

        <script>
          const reports = ${JSON.stringify(allReports || [])};
          const key = "${key}";
          const startBtn = document.getElementById('start-btn');
          const container = document.getElementById('progress-container');
          const successCount = document.getElementById('success-count');
          const errorCount = document.getElementById('error-count');
          const remainingCount = document.getElementById('remaining-count');
          
          let processed = 0;
          let success = 0;
          let errors = 0;

          startBtn.onclick = async () => {
            startBtn.disabled = true;
            startBtn.innerHTML = "⏳ Traitement en cours...";
            
            for (const r of reports) {
              const item = document.createElement('div');
              item.className = "flex flex-col border-b border-white/5 py-2 uppercase tracking-widest text-[10px]";
              const nameSpan = document.createElement('span');
              nameSpan.className = "truncate mb-1";
              nameSpan.textContent = r.product_name || 'Sans nom';
              const statusSpan = document.createElement('span');
              statusSpan.className = "text-yellow-500 shrink-0";
              statusSpan.innerHTML = "⏳ Encours...";
              item.appendChild(nameSpan);
              item.appendChild(statusSpan);
              container.prepend(item);

              try {
                const res = await fetch("/api/admin/bulk-regenerate?key=" + encodeURIComponent(key) + "&id=" + encodeURIComponent(r.id));
                const data = await res.json();
                
                if (data.success) {
                  statusSpan.className = "text-green-500 shrink-0";
                  statusSpan.innerHTML = "✅ Terminé";
                  success++;
                  successCount.textContent = success;
                } else {
                  // Afficher l'erreur détaillée
                  const errorText = data.error || 'Erreur inconnue';
                  const errorStep = data.step ? ' (' + data.step + ')' : '';
                  statusSpan.className = "text-red-500 shrink-0";
                  statusSpan.innerHTML = "❌ Erreur" + errorStep;
                  statusSpan.title = errorText; // Tooltip avec le détail
                  const errorDetail = document.createElement('div');
                  errorDetail.className = "text-[9px] text-red-400 mt-1 ml-2 italic";
                  errorDetail.textContent = errorText;
                  item.appendChild(errorDetail);
                  errors++;
                  errorCount.textContent = errors;
                  console.error('Erreur pour', r.product_name, ':', errorText, errorStep);
                }
              } catch (e) {
                const errorMsg = e.message || 'Erreur réseau';
                statusSpan.className = "text-red-500 shrink-0";
                statusSpan.innerHTML = "❌ Erreur réseau";
                statusSpan.title = errorMsg;
                const errorDetail = document.createElement('div');
                errorDetail.className = "text-[9px] text-red-400 mt-1 ml-2 italic";
                errorDetail.textContent = errorMsg;
                item.appendChild(errorDetail);
                errors++;
                errorCount.textContent = errors;
                console.error('Erreur réseau pour', r.product_name, ':', e);
              }
              
              processed++;
              const remaining = reports.length - processed;
              remainingCount.textContent = remaining;
              
              // Délai de 500ms entre chaque requête pour éviter de surcharger
              if (processed < reports.length) {
                await new Promise(r => setTimeout(r, 500));
              }
            }
            
            startBtn.innerHTML = "✅ Migration Terminée !";
            startBtn.classList.remove('bg-cyan-500', 'hover:bg-cyan-400');
            startBtn.classList.add('bg-green-500');
            
            // Message de fin
            const finalMsg = document.createElement('div');
            finalMsg.className = "mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-300 text-center";
            finalMsg.innerHTML = "<strong>Migration terminée !</strong><br>Succès: " + success + " | Erreurs: " + errors;
            container.after(finalMsg);
          };
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, { 
    headers: { 
      'Content-Type': 'text/html; charset=utf-8' 
    } 
  });
}

// On exporte aussi POST pour compatibilité
export async function POST(req: Request) {
  return GET(req);
}

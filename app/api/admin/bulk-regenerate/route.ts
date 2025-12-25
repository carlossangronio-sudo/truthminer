import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';
import { generateSlug } from '@/lib/utils/keyword-extractor';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 55000 // Timeout de 55 secondes (Vercel Pro permet 60s)
});
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

export const maxDuration = 60; // Vercel Pro permet jusqu'à 60 secondes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const id = searchParams.get('id');
    const productNameParam = searchParams.get('product_name');

    // 1. Sécurité
    if (!key || key !== ADMIN_SECRET_KEY) {
      console.error('[BulkRegenerate] ❌ Clé invalide');
      return NextResponse.json({ 
        success: false,
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

        // Étape 2: Appel OpenAI - PROMPT AMÉLIORÉ pour analyses plus longues et détaillées
        const prompt = `Tu es l'IA experte de TruthMiner. Analyse ce produit : ${name}.
        
        STRUCTURE JSON STRICTE :
        {
          "consensus": "Résumé percutant en une phrase (15-25 mots).",
          "pros": ["Avantage détaillé 1 (1 phrase complète)", "Avantage détaillé 2 (1 phrase complète)", "Avantage détaillé 3 (1 phrase complète)"],
          "cons": ["Défaut caché 1 (1 phrase complète)", "Défaut caché 2 (1 phrase complète)", "Défaut caché 3 (1 phrase complète)"],
          "deep_analysis": "ÉCRIS 3 PARAGRAPHES COMPLETS ET DÉTAILLÉS EN UNE SEULE CHAÎNE DE CARACTÈRES (séparés par deux retours à la ligne \\n\\n). Minimum 150 mots par paragraphe. Paragraphe 1: Le contexte marketing et les attentes autour du produit. Paragraphe 2: La réalité de l'usage après 1-2 mois selon les retours Reddit (défauts cachés, problèmes récurrents). Paragraphe 3: Positionnement par rapport aux alternatives et verdict final. IMPORTANT: deep_analysis doit être une STRING, pas un objet JSON. Ton journaliste tech, tranchant et critique.",
          "reddit_quotes": [
            {"user": "u/RedditUser", "text": "Citation réelle et marquante trouvée sur Reddit (2-3 phrases)", "subreddit": "r/tech"}
          ],
          "target_audience": {"yes": "Profil type précis qui adorera ce produit (1 phrase)", "no": "Profil type précis qui sera déçu (1 phrase)"},
          "punchline": "Métaphore ou analogie originale et percutante (1 phrase)",
          "final_verdict": "Verdict final brut et tranché avec recommandation claire (Achetez/Fuyez/Attendez) - 3-4 phrases"
        }

        RÈGLES STRICTES :
        - deep_analysis doit faire MINIMUM 450 mots au total (150 mots par paragraphe)
        - Pas de répétition entre les sections
        - Pas de listes à puces dans deep_analysis, uniquement des paragraphes narratifs
        - Ton direct, investigatif, parfois critique
        - Ne cite jamais deux fois la même idée`;

        console.log('[BulkRegenerate] Appel OpenAI pour:', name);
        let aiResponse;
        try {
          // Utilisation de gpt-4-turbo-preview pour meilleure qualité d'analyse
          aiResponse = await Promise.race([
            openai.chat.completions.create({
              model: "gpt-4-turbo-preview",
              messages: [
                { role: "system", content: "Expert en analyse de sentiment Reddit. Réponse JSON uniquement." },
                { role: "user", content: prompt }
              ],
              response_format: { type: "json_object" },
              max_tokens: 3000 // Plus de tokens pour analyses très détaillées
            }),
            // Timeout de secours après 55 secondes (Vercel Pro permet 60s, on laisse 5s de marge)
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('OpenAI timeout après 55 secondes')), 55000)
            ) as Promise<any>
          ]);
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
          
          // Ajouter les champs manquants essentiels (title et slug)
          if (!newContent.title) {
            newContent.title = name;
          }
          if (!newContent.slug) {
            newContent.slug = generateSlug(name);
          }
          
          // S'assurer que deep_analysis est une string (pas un objet)
          if (newContent.deep_analysis && typeof newContent.deep_analysis === 'object') {
            // Si c'est un objet, le convertir en string
            newContent.deep_analysis = Object.entries(newContent.deep_analysis)
              .map(([key, value]) => typeof value === 'string' ? value : String(value))
              .join('\n\n');
          } else if (!newContent.deep_analysis) {
            // Si deep_analysis n'existe pas, utiliser consensus comme fallback
            newContent.deep_analysis = newContent.consensus || '';
          }
          
          console.log('[BulkRegenerate] ✅ JSON parsé avec succès (slug:', newContent.slug, ')');
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
        success: false,
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
              Ne ferme pas cette page pendant le traitement. Chaque rapport prend environ 3-5 secondes (optimisé avec GPT-3.5).
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
                  
                  // Vérifier si la réponse est OK
                  if (!res.ok) {
                    // Essayer de parser le JSON même si le statut n'est pas 200
                    let errorData;
                    try {
                      const text = await res.text();
                      errorData = JSON.parse(text);
                    } catch {
                      throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
                    }
                    throw new Error(errorData.error || \`HTTP \${res.status}\`);
                  }
                  
                  // Parser la réponse JSON
                  let data;
                  try {
                    const text = await res.text();
                    if (!text) {
                      throw new Error('Réponse vide du serveur');
                    }
                    data = JSON.parse(text);
                  } catch (parseErr) {
                    console.error('Erreur parsing réponse:', parseErr);
                    throw new Error('Réponse invalide du serveur (pas de JSON)');
                  }
                  
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
                  statusSpan.innerHTML = "❌ Erreur";
                  statusSpan.title = errorMsg;
                  const errorDetail = document.createElement('div');
                  errorDetail.className = "text-[9px] text-red-400 mt-1 ml-2 italic";
                  errorDetail.textContent = errorMsg;
                  item.appendChild(errorDetail);
                  errors++;
                  errorCount.textContent = errors;
                  console.error('Erreur pour', r.product_name, ':', e);
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
  } catch (error: any) {
    // Gestion d'erreur globale pour s'assurer qu'on renvoie toujours du JSON
    console.error('[BulkRegenerate] ❌ Erreur globale non catchée:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Erreur serveur inattendue',
      step: 'server'
    }, { status: 500 });
  }
}

// On exporte aussi POST pour compatibilité
export async function POST(req: Request) {
  return GET(req);
}

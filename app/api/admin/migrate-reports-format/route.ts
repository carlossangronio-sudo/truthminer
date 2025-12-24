import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportContent } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

/**
 * Route ADMIN pour migrer les anciens rapports vers le nouveau format JSON structuré
 * POST /api/admin/migrate-reports-format
 * Headers: Authorization: Bearer <ADMIN_SECRET_KEY>
 * 
 * Comportement :
 * - Récupère tous les rapports depuis Supabase
 * - Pour chaque rapport, vérifie s'il a déjà les nouveaux champs (consensus, pros, cons, punchline, recommendations)
 * - Si non, dérive les nouveaux champs depuis l'ancien format (choice, defects, article, userProfiles)
 * - Met à jour le contenu JSON dans Supabase avec les nouveaux champs ajoutés
 * - Préserve totalement url_image (ne la touche pas)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification d'authentification
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const secretKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

    if (!token || token !== secretKey) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    console.log('[MigrateReports] 📥 Récupération de tous les rapports depuis Supabase...');
    const allReports = await getAllReports();
    console.log(`[MigrateReports] ✅ ${allReports.length} rapports récupérés`);

    const results = {
      total: allReports.length,
      alreadyMigrated: 0,
      migrated: 0,
      errors: 0,
      details: [] as Array<{
        id: string;
        productName: string;
        status: 'already_migrated' | 'migrated' | 'error';
        message?: string;
      }>,
    };

    // Traiter chaque rapport
    for (const report of allReports) {
      try {
        // Parser le contenu JSON
        let content: any = {};
        try {
          content = typeof report.content === 'object'
            ? report.content
            : JSON.parse(report.content || '{}');
        } catch (e) {
          console.warn(`[MigrateReports] ⚠️ Erreur parsing contenu pour ${report.id}:`, e);
          results.errors++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            status: 'error',
            message: 'Erreur lors du parsing du contenu JSON',
          });
          continue;
        }

        // Vérifier si le rapport a déjà les nouveaux champs
        const hasNewFormat = 
          content.consensus !== undefined ||
          (Array.isArray(content.pros) && content.pros.length > 0) ||
          (Array.isArray(content.cons) && content.cons.length > 0) ||
          content.punchline !== undefined ||
          (Array.isArray(content.recommendations) && content.recommendations.length > 0);

        if (hasNewFormat) {
          results.alreadyMigrated++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            status: 'already_migrated',
          });
          continue;
        }

        // Dériver les nouveaux champs depuis l'ancien format
        const migratedContent = migrateOldFormatToNew(content, report.product_name);

        // Mettre à jour le rapport dans Supabase
        const success = await updateReportContent(report.id, migratedContent);

        if (success) {
          results.migrated++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            status: 'migrated',
          });
          console.log(`[MigrateReports] ✅ Rapport migré: ${report.product_name}`);
        } else {
          results.errors++;
          results.details.push({
            id: report.id,
            productName: report.product_name,
            status: 'error',
            message: 'Échec de la mise à jour dans Supabase',
          });
          console.error(`[MigrateReports] ❌ Erreur lors de la mise à jour: ${report.product_name}`);
        }
      } catch (error) {
        results.errors++;
        console.error(`[MigrateReports] ❌ Erreur pour le rapport ${report.id}:`, error);
        results.details.push({
          id: report.id,
          productName: report.product_name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    console.log(`[MigrateReports] ✅ Migration terminée: ${results.migrated} migrés, ${results.alreadyMigrated} déjà migrés, ${results.errors} erreurs`);

    return NextResponse.json({
      success: true,
      message: `Migration terminée : ${results.migrated} rapports migrés, ${results.alreadyMigrated} déjà migrés, ${results.errors} erreurs`,
      results,
    });
  } catch (error) {
    console.error('[MigrateReports] ❌ Erreur inattendue:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: `Erreur lors de la migration: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Migre l'ancien format vers le nouveau format JSON structuré
 * @param oldContent - Contenu au format ancien (choice, defects, article, userProfiles)
 * @param productName - Nom du produit pour générer des valeurs par défaut
 * @returns Contenu enrichi avec les nouveaux champs
 */
function migrateOldFormatToNew(oldContent: any, productName: string): any {
  // Préserver tous les champs existants
  const newContent = { ...oldContent };

  // 1. consensus : dériver depuis choice
  if (!newContent.consensus && oldContent.choice) {
    newContent.consensus = oldContent.choice;
  } else if (!newContent.consensus) {
    newContent.consensus = `Analyse de ${productName} basée sur les discussions Reddit.`;
  }

  // 2. pros : extraire depuis article ou créer depuis choice si positif
  if (!Array.isArray(newContent.pros) || newContent.pros.length === 0) {
    const pros: string[] = [];
    
    // Si choice contient des éléments positifs, créer un pro
    if (oldContent.choice && oldContent.choice.length > 0) {
      // Extraire la première phrase positive de choice
      const choiceSentences = oldContent.choice.split(/[.!?]/).filter((s: string) => s.trim().length > 0);
      if (choiceSentences.length > 0) {
        pros.push(`${choiceSentences[0].trim()} - Basé sur les discussions Reddit`);
      }
    }
    
    // Extraire des points positifs depuis l'article si disponible
    if (oldContent.article) {
      const articleLower = oldContent.article.toLowerCase();
      // Chercher des sections positives dans l'article
      const positivePatterns = [
        /points forts[:\s]+(.*?)(?=points faibles|pourquoi|est-ce fait|verdict|$)/is,
        /choix de la communauté[:\s]+(.*?)(?=points faibles|pourquoi|est-ce fait|verdict|$)/is,
      ];
      
      for (const pattern of positivePatterns) {
        const match = oldContent.article.match(pattern);
        if (match && match[1]) {
          const positiveText = match[1].trim();
          // Extraire les premières phrases positives
          const sentences = positiveText.split(/[.!?]/).filter((s: string) => s.trim().length > 20 && s.trim().length < 200);
          if (sentences.length > 0) {
            pros.push(`${sentences[0].trim()} - Basé sur les discussions Reddit`);
          }
        }
      }
    }
    
    // Si aucun pro trouvé, créer un pro générique
    if (pros.length === 0) {
      pros.push(`Analyse basée sur les discussions Reddit pour ${productName} - Basé sur les discussions Reddit`);
    }
    
    newContent.pros = pros;
  }

  // 3. cons : dériver depuis defects[]
  if (!Array.isArray(newContent.cons) || newContent.cons.length === 0) {
    if (Array.isArray(oldContent.defects) && oldContent.defects.length > 0) {
      // Utiliser directement defects comme cons (ils contiennent déjà des citations)
      newContent.cons = oldContent.defects;
    } else {
      // Extraire des points négatifs depuis l'article
      const cons: string[] = [];
      
      if (oldContent.article) {
        const negativePatterns = [
          /points faibles[:\s]+(.*?)(?=est-ce fait|verdict|$)/is,
          /pourquoi vous allez vouloir[:\s]+(.*?)(?=est-ce fait|verdict|$)/is,
        ];
        
        for (const pattern of negativePatterns) {
          const match = oldContent.article.match(pattern);
          if (match && match[1]) {
            const negativeText = match[1].trim();
            // Extraire les listes à puces ou les phrases
            const lines = negativeText.split(/\n/).filter((line: string) => line.trim().length > 20);
            for (const line of lines.slice(0, 4)) {
              const cleaned = line.replace(/^[-*•]\s*/, '').trim();
              if (cleaned.length > 0 && !cleaned.toLowerCase().includes('utilisateur reddit')) {
                cons.push(`${cleaned} - Un utilisateur Reddit`);
              }
            }
          }
        }
      }
      
      // Si aucun con trouvé, créer un con générique
      if (cons.length === 0) {
        cons.push(`Points à améliorer identifiés par la communauté Reddit - Basé sur les discussions Reddit`);
      }
      
      newContent.cons = cons;
    }
  }

  // 4. punchline : extraire depuis article ou créer depuis consensus
  if (!newContent.punchline) {
    if (oldContent.article) {
      // Chercher des punchlines dans l'article (citations, formules percutantes)
      const punchlinePatterns = [
        /["']([^"']{20,150})["']/g, // Citations entre guillemets
        /(Acheter ça, c'est comme[^.!?]+[.!?])/i,
        /(Le [^.!?]+ qui [^.!?]+[.!?])/i,
      ];
      
      for (const pattern of punchlinePatterns) {
        const matches = oldContent.article.match(pattern);
        if (matches && matches[0]) {
          newContent.punchline = matches[0].trim();
          break;
        }
      }
    }
    
    // Si aucune punchline trouvée, créer une punchline générique basée sur le consensus
    if (!newContent.punchline && newContent.consensus) {
      const consensusLower = newContent.consensus.toLowerCase();
      if (consensusLower.includes('mauvaise affaire') || consensusLower.includes('déconseillé')) {
        newContent.punchline = `Acheter ça, c'est comme essayer de vider l'océan avec une fourchette : frustrant et inutile.`;
      } else if (consensusLower.includes('excellent') || consensusLower.includes('recommandé')) {
        newContent.punchline = `Le consensus Reddit est sans appel : c'est un choix solide.`;
      } else {
        newContent.punchline = `La communauté Reddit a tranché.`;
      }
    }
  }

  // 5. recommendations : dériver depuis userProfiles
  if (!Array.isArray(newContent.recommendations) || newContent.recommendations.length === 0) {
    const recommendations: string[] = [];
    
    if (oldContent.userProfiles && typeof oldContent.userProfiles === 'string') {
      // Parser userProfiles pour extraire les recommandations
      // Format attendu : "Pour [profil] : OUI/NON - [explication]"
      const lines = oldContent.userProfiles.split(/\n/).filter((line: string) => line.trim().length > 0);
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Chercher le pattern "Pour ... : OUI/NON"
        const match = trimmed.match(/Pour\s+([^:]+):\s*(OUI|NON)\s*-\s*(.+)/i);
        if (match) {
          recommendations.push(trimmed);
        } else if (trimmed.length > 10 && trimmed.length < 200) {
          // Si pas de pattern exact, prendre la ligne telle quelle si elle semble être une recommandation
          recommendations.push(trimmed);
        }
      }
    }
    
    // Si aucune recommandation trouvée, créer des recommandations génériques
    if (recommendations.length === 0) {
      recommendations.push(`Pour les utilisateurs recherchant la qualité : À évaluer selon vos besoins spécifiques`);
      recommendations.push(`Pour ceux qui cherchent le meilleur rapport qualité/prix : À évaluer selon vos besoins spécifiques`);
    }
    
    newContent.recommendations = recommendations;
  }

  // Préserver tous les autres champs existants (title, slug, products, amazonSearchQuery, etc.)
  // Ne pas toucher à url_image (elle est dans une colonne séparée, pas dans content)

  return newContent;
}


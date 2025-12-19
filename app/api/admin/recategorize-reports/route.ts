import { NextRequest, NextResponse } from 'next/server';
import { getAllReports, updateReportCategory } from '@/lib/supabase/client';
import { OpenAIService } from '@/lib/services/openai';

export const dynamic = 'force-dynamic';

/**
 * Route API admin pour recatégoriser tous les rapports existants
 * POST /api/admin/recategorize-reports
 * 
 * Cette route :
 * 1. Récupère tous les rapports de Supabase
 * 2. Détecte automatiquement la bonne catégorie pour chaque rapport
 * 3. Met à jour la catégorie dans Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier une clé secrète simple pour protéger cette route (optionnel)
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    console.log('[Admin] Début de la recatégorisation des rapports...');

    // 1. Récupérer tous les rapports
    const allReports = await getAllReports();
    console.log(`[Admin] ${allReports.length} rapports trouvés`);

    const results = {
      total: allReports.length,
      updated: 0,
      unchanged: 0,
      errors: 0,
      details: [] as Array<{
        id: string;
        productName: string;
        oldCategory: string | null;
        newCategory: string;
        status: 'updated' | 'unchanged' | 'error';
      }>,
    };

    // 2. Pour chaque rapport, détecter et mettre à jour la catégorie
    for (const report of allReports) {
      try {
        // Extraire le nom du produit (mot-clé original)
        const productName = report.product_name;
        const currentCategory = report.category || null;

        // Détecter la nouvelle catégorie basée sur le nom du produit
        const newCategory = OpenAIService.detectCategoryFromKeyword(productName);

        // Si la catégorie est différente, mettre à jour
        if (currentCategory !== newCategory) {
          const success = await updateReportCategory(report.id, newCategory);
          
          if (success) {
            results.updated++;
            results.details.push({
              id: report.id,
              productName,
              oldCategory: currentCategory,
              newCategory,
              status: 'updated',
            });
            console.log(`[Admin] ✓ ${productName}: ${currentCategory || 'null'} → ${newCategory}`);
          } else {
            results.errors++;
            results.details.push({
              id: report.id,
              productName,
              oldCategory: currentCategory,
              newCategory,
              status: 'error',
            });
            console.error(`[Admin] ✗ Erreur lors de la mise à jour de ${productName}`);
          }
        } else {
          results.unchanged++;
          results.details.push({
            id: report.id,
            productName,
            oldCategory: currentCategory,
            newCategory,
            status: 'unchanged',
          });
        }
      } catch (error) {
        results.errors++;
        console.error(`[Admin] Erreur pour le rapport ${report.id}:`, error);
        results.details.push({
          id: report.id,
          productName: report.product_name,
          oldCategory: report.category || null,
          newCategory: 'Erreur',
          status: 'error',
        });
      }
    }

    console.log('[Admin] Recatégorisation terminée:', results);

    return NextResponse.json({
      success: true,
      message: `Recatégorisation terminée : ${results.updated} mis à jour, ${results.unchanged} inchangés, ${results.errors} erreurs`,
      results,
    });
  } catch (error) {
    console.error('Erreur lors de la recatégorisation:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: `Erreur lors de la recatégorisation: ${errorMessage}` },
      { status: 500 }
    );
  }
}


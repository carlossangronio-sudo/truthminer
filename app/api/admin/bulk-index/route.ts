import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAllReports } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

/**
 * Route ADMIN pour indexer toutes les URLs des rapports via Google Indexing API
 * 
 * POST /api/admin/bulk-index
 * Headers: Authorization: Bearer <ADMIN_SECRET_KEY>
 * 
 * Comportement :
 * - Récupère tous les rapports depuis Supabase
 * - Génère les URLs pour chaque rapport
 * - Envoie chaque URL à Google Indexing API avec le type URL_UPDATED
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification d'authentification
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';

    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Non autorisé. Utilisez Authorization: Bearer <secret-key>' },
        { status: 401 }
      );
    }

    // Vérifier que les credentials Google sont configurés
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return NextResponse.json(
        { error: 'GOOGLE_SERVICE_ACCOUNT_KEY non configuré dans les variables d\'environnement' },
        { status: 500 }
      );
    }

    // Parser le JSON du compte de service
    let credentials;
    try {
      credentials = typeof serviceAccountKey === 'string' 
        ? JSON.parse(serviceAccountKey) 
        : serviceAccountKey;
    } catch (parseError) {
      console.error('[BulkIndex] Erreur lors du parsing de GOOGLE_SERVICE_ACCOUNT_KEY:', parseError);
      return NextResponse.json(
        { error: 'Format invalide pour GOOGLE_SERVICE_ACCOUNT_KEY. Doit être un JSON valide.' },
        { status: 500 }
      );
    }

    // Initialiser l'API Google Indexing
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const authClient = await auth.getClient();
    const indexing = google.indexing({
      version: 'v3',
      auth: authClient as any, // Type assertion nécessaire pour compatibilité
    });

    // Récupérer tous les rapports depuis Supabase
    console.log('[BulkIndex] 📥 Récupération de tous les rapports depuis Supabase...');
    const allReports = await getAllReports();
    console.log(`[BulkIndex] ✅ ${allReports.length} rapports récupérés`);

    const results = {
      total: allReports.length,
      indexed: 0,
      errors: 0,
      details: [] as Array<{ url: string; status: 'success' | 'error'; message?: string }>,
    };

    // Indexer chaque URL
    for (const report of allReports) {
      try {
        // Extraire le slug depuis le contenu JSON
        let content: any = {};
        try {
          content = typeof report.content === 'object'
            ? report.content
            : JSON.parse(report.content || '{}');
        } catch (e) {
          console.warn(`[BulkIndex] ⚠️ Erreur parsing contenu pour ${report.id}:`, e);
          content = {};
        }

        // Générer le slug (priorité: content.slug > product_name normalisé)
        const slug = content.slug || 
          report.product_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 
          report.id;

        const url = `${siteUrl}/report/${slug}`;

        // Envoyer à Google Indexing API
        try {
          await indexing.urlNotifications.publish({
            requestBody: {
              url: url,
              type: 'URL_UPDATED',
            },
          });

          results.indexed++;
          results.details.push({ url, status: 'success' });
          console.log(`[BulkIndex] ✅ Indexé: ${url}`);

          // Petite pause pour éviter le rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (indexError: any) {
          results.errors++;
          const errorMessage = indexError?.message || 'Erreur inconnue';
          results.details.push({ url, status: 'error', message: errorMessage });
          console.error(`[BulkIndex] ❌ Erreur pour ${url}:`, errorMessage);
        }
      } catch (reportError) {
        results.errors++;
        console.error(`[BulkIndex] ❌ Erreur lors du traitement du rapport ${report.id}:`, reportError);
      }
    }

    console.log(`[BulkIndex] ✅ Indexation terminée: ${results.indexed} réussies, ${results.errors} erreurs`);

    return NextResponse.json({
      success: true,
      message: `Indexation terminée : ${results.indexed} URLs indexées, ${results.errors} erreurs`,
      results,
    });
  } catch (error) {
    console.error('[BulkIndex] ❌ Erreur inattendue:', error);
    
    let errorMessage = 'Erreur inconnue';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: `Erreur lors de l'indexation: ${errorMessage}` },
      { status: 500 }
    );
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant.'
  );
} else {
  try {
    const host = new URL(supabaseUrl).host;
    console.log(`Connexion Supabase OK : Projet ${host}`);
  } catch {
    console.log('Connexion Supabase OK : URL Supabase chargée');
  }
}

type SupabaseReportRow = {
  id: string;
  product_name: string;
  score: number;
  content: any;
  category?: string;
  url_image?: string;
  created_at: string;
};

export async function getCachedReport(
  normalizedProductName: string
): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getCachedReport →', {
    supabaseUrl,
    normalizedProductName,
  });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('product_name', `eq.${normalizedProductName}`);
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getCachedReport):', await res.text());
    return null;
  }

  const data = (await res.json()) as SupabaseReportRow[];
  return data[0] ?? null;
}

export async function insertReport(row: {
  normalizedProductName: string;
  score: number;
  content: any;
  category?: string;
  imageUrl?: string;
  createdAt: string;
}): Promise<string | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = 'Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant';
    console.error('[Supabase] ❌', error);
    throw new Error(error);
  }

  console.log('[Supabase] insertReport →', {
    supabaseUrl,
    product_name: row.normalizedProductName,
    score: row.score,
    category: row.category,
    imageUrl: row.imageUrl,
    created_at: row.createdAt,
  });

  const url = new URL('/rest/v1/reports', supabaseUrl);

  // Vérification des colonnes : product_name, score, content, category, url_image, created_at
  const payload: any = {
    product_name: row.normalizedProductName,
    score: row.score,
    content: row.content,
    created_at: row.createdAt,
  };

  // Ajouter la catégorie si elle existe
  if (row.category) {
    payload.category = row.category;
  }

  // Ajouter l'image si elle existe
  if (row.imageUrl) {
    payload.url_image = row.imageUrl;
  }

  console.log('[Supabase] Payload d\'insertion:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation', // Retourner l'ID du rapport créé
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Supabase] ❌ Erreur HTTP lors de l\'insertion:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        payload: payload,
      });
      
      // Essayer de parser l'erreur Supabase
      let errorMessage = `Erreur Supabase (${res.status}): ${errorText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        }
        if (errorJson.details) {
          errorMessage += ` - Détails: ${errorJson.details}`;
        }
        if (errorJson.hint) {
          errorMessage += ` - Hint: ${errorJson.hint}`;
        }
      } catch (e) {
        // Erreur non JSON, utiliser le texte brut
      }
      
      throw new Error(errorMessage);
    }

    // Récupérer l'ID du rapport créé
    const data = await res.json();
    const reportId = Array.isArray(data) && data.length > 0 ? data[0].id : null;
    
    if (reportId) {
      console.log('[Supabase] ✅ Rapport inséré avec succès (ID:', reportId, ')');
      return reportId;
    } else {
      console.warn('[Supabase] ⚠️ Rapport inséré mais ID non récupéré');
      return null;
    }
  } catch (error) {
    console.error('[Supabase] ❌ Exception lors de l\'insertion:', error);
    
    if (error instanceof Error) {
      console.error('[Supabase] Message d\'erreur:', error.message);
      console.error('[Supabase] Stack trace:', error.stack);
      throw error; // Re-lancer l'erreur pour que l'appelant puisse la gérer
    }
    
    throw new Error(`Erreur inconnue lors de l'insertion Supabase: ${String(error)}`);
  }
}

/**
 * Met à jour la catégorie d'un rapport dans Supabase
 */
export async function updateReportCategory(
  reportId: string,
  category: string
): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) return false;

  // Supabase REST API : PATCH avec filtre dans l'URL
  const url = new URL(`/rest/v1/reports`, supabaseUrl);
  url.searchParams.set('id', `eq.${reportId}`);

  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ category }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.warn('Erreur Supabase (updateReportCategory):', errorText);
    return false;
  }

  return true;
}

/**
 * Met à jour url_image d'un rapport dans Supabase
 */
export async function updateReportImage(
  reportId: string,
  imageUrl: string
): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] ❌ Supabase non configuré pour updateReportImage');
    return false;
  }

  console.log('[Supabase] updateReportImage →', { reportId, imageUrl });

  try {
    const url = new URL(`/rest/v1/reports`, supabaseUrl);
    url.searchParams.set('id', `eq.${reportId}`);

    const res = await fetch(url.toString(), {
      method: 'PATCH',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ url_image: imageUrl }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Supabase] ❌ Erreur HTTP lors de la mise à jour de l\'image:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        reportId,
        imageUrl,
      });
      return false;
    }

    console.log('[Supabase] ✅ Image mise à jour avec succès pour le rapport:', reportId);
    return true;
  } catch (error) {
    console.error('[Supabase] ❌ Exception lors de la mise à jour de l\'image:', error);
    if (error instanceof Error) {
      console.error('[Supabase] Message d\'erreur:', error.message);
      console.error('[Supabase] Stack trace:', error.stack);
    }
    return false;
  }
}

export async function getRecentReports(
  limit = 6
): Promise<SupabaseReportRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  console.log('[Supabase] getRecentReports →', { supabaseUrl, limit });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('score', 'gt.0'); // FILTRE : Exclure les rapports avec score 0%
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getRecentReports):', await res.text());
    return [];
  }

  const data = (await res.json()) as SupabaseReportRow[];
  return data;
}

export async function getAllReports(
  category?: string,
  limit?: number
): Promise<SupabaseReportRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  console.log('[Supabase] getAllReports →', { supabaseUrl, category, limit });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('score', 'gt.0'); // FILTRE : Exclure les rapports avec score 0%

  // Filtrer par catégorie si fournie
  if (category && category !== 'Tous') {
    url.searchParams.set('category', `eq.${category}`);
  }

  // Limiter le nombre de résultats si fourni (pour améliorer les performances)
  if (limit && limit > 0) {
    url.searchParams.set('limit', limit.toString());
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store', // Pas de cache pour les fonctions utilitaires
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getAllReports):', await res.text());
    return [];
  }

  const data = (await res.json()) as SupabaseReportRow[];
  
  // FILTRE SUPPLÉMENTAIRE : Supprimer les doublons basés sur product_name
  // (pour éviter les doublons comme "Indigo Park")
  const seen = new Set<string>();
  const uniqueReports = data.filter(report => {
    const normalizedName = report.product_name.toLowerCase().trim();
    if (seen.has(normalizedName)) {
      return false; // Doublon détecté, exclure
    }
    seen.add(normalizedName);
    return true;
  });
  
  return uniqueReports;
}

/**
 * Récupère un rapport par son slug depuis Supabase
 * OPTIMISÉ : Essaie d'abord de trouver par product_name (rapide), puis cherche dans tous les rapports si nécessaire
 */
export async function getReportBySlug(slug: string): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getReportBySlug →', { supabaseUrl, slug });

  // OPTIMISATION 1 : Essayer de deviner le product_name à partir du slug
  // Le slug est souvent basé sur le product_name, donc on peut essayer de le reconstruire
  // Exemple : "souris-gaming-logitech" -> "souris gaming logitech"
  const possibleProductName = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitaliser chaque mot

  // Essayer de trouver par product_name exact ou proche
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  
  // OPTIMISATION 2 : Récupérer seulement les 50 derniers rapports au lieu de tous
  // (la plupart des rapports récents ont des slugs cohérents)
  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '50'); // Limiter à 50 rapports récents pour la performance

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getReportBySlug):', await res.text());
    return null;
  }

  const recentReports = (await res.json()) as SupabaseReportRow[];
  
  // 1. Chercher par slug dans le contenu (dans les rapports récents)
  for (const report of recentReports) {
    try {
      const content = typeof report.content === 'object'
        ? report.content
        : JSON.parse(report.content || '{}');
      
      // Vérifier le slug dans le contenu
      const contentSlug = content.slug;
      if (contentSlug === slug) {
        console.log('[Supabase] Rapport trouvé par slug (rapide):', slug);
        return report;
      }
      
      // Vérifier aussi si le slug correspond au product_name formaté
      const normalizedProductName = report.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (normalizedProductName === normalizedSlug) {
        console.log('[Supabase] Rapport trouvé par product_name (rapide):', report.product_name);
        return report;
      }
    } catch (e) {
      console.warn('[Supabase] Erreur lors du parsing du contenu pour le rapport:', report.id, e);
      continue;
    }
  }

  // 3. Si pas trouvé dans les 50 récents, chercher dans tous les rapports (plus lent mais nécessaire)
  console.log('[Supabase] Slug non trouvé dans les 50 récents, recherche dans tous les rapports...');
  const allReports = await getAllReports();
  
  for (const report of allReports) {
    try {
      const content = typeof report.content === 'object'
        ? report.content
        : JSON.parse(report.content || '{}');
      
      // Vérifier le slug dans le contenu
      if (content.slug === slug) {
        console.log('[Supabase] Rapport trouvé par slug (complet):', slug);
        return report;
      }
      
      // Vérifier aussi si le slug correspond au product_name formaté
      const normalizedProductName = report.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (normalizedProductName === normalizedSlug) {
        console.log('[Supabase] Rapport trouvé par product_name (complet):', report.product_name);
        return report;
      }
    } catch (e) {
      console.warn('[Supabase] Erreur lors du parsing du contenu pour le rapport:', report.id, e);
      continue;
    }
  }

  console.warn('[Supabase] Aucun rapport trouvé pour le slug:', slug);
  return null;
}


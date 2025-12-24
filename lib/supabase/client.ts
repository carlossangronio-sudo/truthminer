const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Timeout par défaut (en millisecondes) pour tous les appels Supabase
const SUPABASE_TIMEOUT_MS = 8000;

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

/**
 * Wrapper fetch avec timeout pour éviter de rester bloqué si Supabase est lent.
 */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = SUPABASE_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

type SupabaseReportRow = {
  id: string;
  product_name: string;
  score: number;
  content: any;
  category?: string;
  image_url: string | null;
  url_image?: string | null; // Colonne ajoutée manuellement pour les images OG
  created_at: string;
  updated_at?: string;
};

/**
 * Récupère un rapport en cache en normalisant le nom du produit
 * Recherche insensible à la casse et aux variations (ex: 'iphone 13' = 'iPhone 13')
 * Évite le contenu dupliqué pour Google
 */
export async function getCachedReport(
  normalizedProductName: string
): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getCachedReport →', { normalizedProductName });

  // Recherche exacte d'abord (plus rapide)
  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('product_name', `eq.${normalizedProductName}`);
  url.searchParams.set('limit', '1');

  const res = await fetchWithTimeout(url.toString(), {
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

  const data = (await res.json()) as SupabaseReportRow[] | null;
  
  // Si trouvé avec recherche exacte, retourner
  if (data && data.length > 0) {
    return data[0];
  }

  // Sinon, recherche flexible : récupérer les rapports récents et comparer les noms normalisés
  // (Supabase ne supporte pas nativement les recherches insensibles à la casse avec ilike sur toutes les colonnes)
  // IMPORTANT : Utiliser la même normalisation que dans keyword-extractor pour éviter les doublons
  console.log('[Supabase] Recherche exacte infructueuse, recherche flexible...');
  const allReports = await getAllReports(undefined, 100); // Limiter à 100 pour performance
  
  // Importer la fonction de normalisation pour cohérence
  const { normalizeKeyword } = await import('@/lib/utils/keyword-extractor');
  
  // Normaliser le nom recherché pour comparaison (même logique que dans generate-report)
  const searchNormalized = normalizeKeyword(normalizedProductName);
  
  for (const report of allReports) {
    // Normaliser le nom du rapport avec la même fonction
    const reportNormalized = normalizeKeyword(report.product_name);
    // Comparaison flexible : même contenu après normalisation
    // Cela détecte : 'iphone 13' = 'iPhone 13' = 'IPHONE 13'
    if (reportNormalized === searchNormalized) {
      console.log('[Supabase] ✅ Rapport trouvé avec recherche flexible:', report.product_name);
      return report;
    }
  }

  return null;
}

/**
 * Vérifie si un rapport avec le même titre existe déjà dans Supabase
 * @param title - Le titre du rapport à vérifier
 * @returns Le rapport existant s'il existe, null sinon
 */
export async function getReportByTitle(title: string): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getReportByTitle →', { title });

  // Récupérer tous les rapports et chercher dans le contenu JSON
  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('limit', '50'); // Limiter pour performance

  const res = await fetchWithTimeout(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getReportByTitle):', await res.text());
    return null;
  }

  const reports = (await res.json()) as SupabaseReportRow[] | null;
  if (!reports) return null;
  
  // Normaliser le titre recherché
  const normalizedTitle = title.toLowerCase().trim();
  
  // Chercher un rapport avec le même titre dans le contenu JSON
  for (const report of reports) {
    try {
      const content = typeof report.content === 'object'
        ? report.content
        : JSON.parse(report.content || '{}');
      
      const reportTitle = (content.title || '').toLowerCase().trim();
      
      if (reportTitle === normalizedTitle) {
        console.log('[Supabase] ✅ Rapport trouvé par titre:', title);
        return report;
      }
    } catch (e) {
      console.warn('[Supabase] Erreur lors du parsing du contenu pour le rapport:', report.id, e);
      continue;
    }
  }

  console.log('[Supabase] Aucun rapport trouvé pour le titre:', title);
  return null;
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
    product_name: row.normalizedProductName,
    score: row.score,
    category: row.category,
    hasImage: !!row.imageUrl,
    created_at: row.createdAt,
  });

  const url = new URL('/rest/v1/reports', supabaseUrl);

  // Vérification des colonnes : product_name, score, content, category, image_url, created_at, updated_at
  const payload: any = {
    product_name: row.normalizedProductName,
    score: row.score,
    content: row.content,
    created_at: row.createdAt,
    // updated_at : initialiser seulement si la valeur est fournie (la colonne doit exister dans Supabase avec DEFAULT)
    // Si la colonne n'existe pas, Supabase l'ignorera automatiquement
    updated_at: row.createdAt,
  };

  // Ajouter la catégorie si elle existe
  if (row.category) {
    payload.category = row.category;
  }

  // Ajouter l'image si elle existe
  if (row.imageUrl) {
    payload.image_url = row.imageUrl;
  }

  console.log('[Supabase] Payload d\'insertion:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetchWithTimeout(url.toString(), {
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
    const data = (await res.json()) as any[] | null;
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

  const res = await fetchWithTimeout(url.toString(), {
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
 * Met à jour image_url d'un rapport dans Supabase
 */
export async function updateReportImage(
  reportId: string,
  imageUrl: string
): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] ❌ Supabase non configuré pour updateReportImage');
    return false;
  }

  console.log('[Supabase] updateReportImage →', {
    reportId,
    hasImageUrl: !!imageUrl,
  });

  try {
    const url = new URL(`/rest/v1/reports`, supabaseUrl);
    url.searchParams.set('id', `eq.${reportId}`);

    const res = await fetchWithTimeout(url.toString(), {
      method: 'PATCH',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ image_url: imageUrl }),
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

/**
 * Met à jour le contenu JSON complet d'un rapport dans Supabase
 */
export async function updateReportContent(
  reportId: string,
  content: any
): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] ❌ Supabase non configuré pour updateReportContent');
    return false;
  }

  console.log('[Supabase] updateReportContent →', { reportId });

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
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Supabase] ❌ Erreur HTTP lors de la mise à jour du contenu:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        reportId,
      });
      return false;
    }

    console.log('[Supabase] ✅ Contenu mis à jour avec succès pour le rapport:', reportId);
    return true;
  } catch (error) {
    console.error('[Supabase] ❌ Exception lors de la mise à jour du contenu:', error);
    if (error instanceof Error) {
      console.error('[Supabase] Message d\'erreur:', error.message);
      console.error('[Supabase] Stack trace:', error.stack);
    }
    return false;
  }
}

/**
 * Récupère un rapport par son ID
 */
export async function getReportById(reportId: string): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getReportById →', { reportId });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('id', `eq.${reportId}`);
  url.searchParams.set('limit', '1');

  const res = await fetchWithTimeout(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getReportById):', await res.text());
    return null;
  }

  const data = (await res.json()) as SupabaseReportRow[] | null;
  if (!data || data.length === 0) return null;
  return data[0];
}

/**
 * Met à jour un rapport existant en préservant l'image existante (sauf si forceUpdateImage est true)
 * @param reportId - ID du rapport à mettre à jour
 * @param updates - Données à mettre à jour
 * @param forceUpdateImage - Si true, remplace l'image même si elle existe déjà
 */
export async function updateReport(
  reportId: string,
  updates: {
    score?: number;
    content?: any;
    category?: string;
    imageUrl?: string | null;
    forceUpdateImage?: boolean;
  }
): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] ❌ Supabase non configuré pour updateReport');
    return false;
  }

  console.log('[Supabase] updateReport →', {
    reportId,
    hasContentUpdate: updates.content !== undefined,
    hasScoreUpdate: updates.score !== undefined,
    hasCategoryUpdate: updates.category !== undefined,
    hasImageUpdate: updates.imageUrl !== undefined,
  });

  try {
    // Récupérer le rapport existant pour préserver l'image
    const existingReport = await getReportById(reportId);
    if (!existingReport) {
      console.error('[Supabase] ❌ Rapport non trouvé:', reportId);
      return false;
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    // Mettre à jour le score si fourni
    if (updates.score !== undefined) {
      payload.score = updates.score;
    }

    // Mettre à jour le contenu si fourni
    if (updates.content !== undefined) {
      payload.content = updates.content;
    }

    // Mettre à jour la catégorie si fournie
    if (updates.category !== undefined) {
      payload.category = updates.category;
    }

    // Gestion de l'image : préserver l'image existante sauf si forceUpdateImage est true
    if (updates.forceUpdateImage && updates.imageUrl !== undefined) {
      // Forcer la mise à jour de l'image
      payload.image_url = updates.imageUrl;
    } else if (updates.imageUrl !== undefined && !existingReport.image_url) {
      // Mettre à jour l'image seulement si elle n'existe pas déjà
      payload.image_url = updates.imageUrl;
    }
    // Sinon, on ne touche pas à l'image (préservation)

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
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Supabase] ❌ Erreur HTTP lors de la mise à jour du rapport:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        reportId,
        payload,
      });
      return false;
    }

    console.log('[Supabase] ✅ Rapport mis à jour avec succès:', reportId);
    return true;
  } catch (error) {
    console.error('[Supabase] ❌ Exception lors de la mise à jour du rapport:', error);
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

  console.log('[Supabase] getRecentReports →', { limit });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
  url.searchParams.set('score', 'gt.0'); // FILTRE : Exclure les rapports avec score 0%
  url.searchParams.set('limit', String(limit));

  const res = await fetchWithTimeout(url.toString(), {
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

  const data = (await res.json()) as SupabaseReportRow[] | null;
  if (!data) return [];
  return data;
}

export async function getAllReports(
  category?: string,
  limit?: number
): Promise<SupabaseReportRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  console.log('[Supabase] getAllReports →', { category, limit });

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

  const res = await fetchWithTimeout(url.toString(), {
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

  const data = (await res.json()) as SupabaseReportRow[] | null;
  if (!data) return [];
  
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

  console.log('[Supabase] getReportBySlug →', { slug });

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

  const res = await fetchWithTimeout(url.toString(), {
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

  const recentReports = (await res.json()) as SupabaseReportRow[] | null;
  if (!recentReports) return null;
  
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


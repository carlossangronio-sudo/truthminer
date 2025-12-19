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
  createdAt: string;
}): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) return;

  console.log('[Supabase] insertReport →', {
    supabaseUrl,
    product_name: row.normalizedProductName,
    score: row.score,
    category: row.category,
    created_at: row.createdAt,
  });

  const url = new URL('/rest/v1/reports', supabaseUrl);

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

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (insertReport):', await res.text());
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

export async function getRecentReports(
  limit = 6
): Promise<SupabaseReportRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  console.log('[Supabase] getRecentReports →', { supabaseUrl, limit });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');
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
  category?: string
): Promise<SupabaseReportRow[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  console.log('[Supabase] getAllReports →', { supabaseUrl, category });

  const url = new URL('/rest/v1/reports', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');

  // Filtrer par catégorie si fournie
  if (category && category !== 'Tous') {
    url.searchParams.set('category', `eq.${category}`);
  }

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (getAllReports):', await res.text());
    return [];
  }

  const data = (await res.json()) as SupabaseReportRow[];
  return data;
}

/**
 * Récupère un rapport par son slug depuis Supabase
 * Avec fallback : cherche d'abord par slug dans le contenu, puis par product_name si pas trouvé
 */
export async function getReportBySlug(slug: string): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  console.log('[Supabase] getReportBySlug →', { supabaseUrl, slug });

  // 1. Récupérer tous les rapports (on ne peut pas filtrer par slug dans le JSON directement avec Supabase REST)
  const allReports = await getAllReports();
  
  // 2. Chercher par slug dans le contenu
  for (const report of allReports) {
    const content = typeof report.content === 'object'
      ? report.content
      : JSON.parse(report.content || '{}');
    
    if (content.slug === slug) {
      console.log('[Supabase] Rapport trouvé par slug:', slug);
      return report;
    }
  }

  // 3. Fallback : si le slug correspond au product_name formaté, chercher par product_name
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  for (const report of allReports) {
    const normalizedProductName = report.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (normalizedProductName === normalizedSlug) {
      console.log('[Supabase] Rapport trouvé par product_name (fallback):', report.product_name);
      return report;
    }
  }

  console.warn('[Supabase] Aucun rapport trouvé pour le slug:', slug);
  return null;
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase non configuré : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquant.'
  );
}

type SupabaseReportRow = {
  id: string;
  product_name: string;
  score: number;
  content: any;
  created_at: string;
};

export async function getCachedReport(
  normalizedProductName: string
): Promise<SupabaseReportRow | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

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
  createdAt: string;
}): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) return;

  const url = new URL('/rest/v1/reports', supabaseUrl);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      product_name: row.normalizedProductName,
      score: row.score,
      content: row.content,
      created_at: row.createdAt,
    }),
  });

  if (!res.ok) {
    console.warn('Erreur Supabase (insertReport):', await res.text());
  }
}



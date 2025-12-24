import Navbar from '@/components/Navbar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const SUBSCRIBERS_TIMEOUT_MS = 8000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = SUBSCRIBERS_TIMEOUT_MS
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

async function getSubscribers(): Promise<Subscriber[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Subscribers] Supabase non configuré');
    return [];
  }

  try {
    const url = new URL('/rest/v1/subscribers', supabaseUrl);
    url.searchParams.set('select', 'id,email,created_at');
    url.searchParams.set('order', 'created_at.desc');

    const res = await fetchWithTimeout(url.toString(), {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[Subscribers] Erreur Supabase:', await res.text());
      return [];
    }

    const data = (await res.json()) as Subscriber[];
    return data;
  } catch (error) {
    console.error('[Subscribers] Erreur lors de la récupération:', error);
    return [];
  }
}

export default async function SubscribersPage() {
  // Protection simple via clé d'admin dans l'URL (même logique que le dashboard admin)
  const adminKey = process.env.ADMIN_SECRET_KEY || 'truthminer-admin-2024';
  const url = new URL(typeof window === 'undefined' ? '' : window.location.href);
  const providedKey = url.searchParams.get('key');

  if (!providedKey || providedKey !== adminKey) {
    return (
      <main className="min-h-screen bg-slate-950 text-gray-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">Accès refusé</h1>
          <p className="text-sm text-slate-400">
            Cette page est réservée à l&apos;administrateur. Fournissez une clé valide pour y accéder.
          </p>
        </div>
      </main>
    );
  }

  const subscribers = await getSubscribers();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard Subscribers</h1>
              <p className="text-slate-400 text-sm">Liste des emails inscrits à la newsletter</p>
            </div>
            <Link
              href="/admin-secret-dashboard"
              className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ← Retour au Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Total Inscrits</span>
              <div className="text-3xl font-bold text-white">{subscribers.length}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
          {subscribers.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>Aucun abonné pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'
                      }`}
                    >
                      <td className="p-4 text-sm text-slate-200">
                        {subscriber.email}
                      </td>
                      <td className="p-4 text-right text-sm text-slate-400">
                        {new Date(subscriber.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


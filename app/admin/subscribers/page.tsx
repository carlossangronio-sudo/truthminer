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
    console.warn('[Subscribers] Supabase non configuré');
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
  // Vérification de l'authentification via cookie de session
  const { isAdminAuthenticated } = await import('@/lib/auth/admin');
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    // Rediriger vers la page de login
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }

  const subscribers = await getSubscribers();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Liste des Abonnés</h1>
          <Link
            href="/admin-secret-dashboard"
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            Retour au Dashboard
          </Link>
        </div>

        {subscribers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>Aucun abonné pour le moment.</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(subscriber.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-sm text-slate-400">
          <p>Total: {subscribers.length} abonné{subscribers.length > 1 ? 's' : ''}</p>
        </div>
      </div>
    </main>
  );
}

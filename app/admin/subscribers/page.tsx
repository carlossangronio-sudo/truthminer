import Navbar from '@/components/Navbar';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
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

    const res = await fetch(url.toString(), {
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
  // Vérification basique de sécurité (peut être améliorée avec une vraie authentification)
  const subscribers = await getSubscribers();

  return (
    <main className="min-h-screen bg-slate-950 text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Subscribers</h1>
          <p className="text-slate-400 text-sm">Liste des emails inscrits à la newsletter</p>
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
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {new Date(subscriber.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
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


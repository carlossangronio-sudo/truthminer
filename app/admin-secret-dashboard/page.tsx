import { Metadata } from 'next';
import { getAllReports, getRecentReports } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

// Fonction pour générer un ID de session abrégé à partir de l'ID du rapport
function generateSessionId(reportId: string): string {
  // Utiliser les 8 premiers caractères de l'ID comme session ID
  return reportId.substring(0, 8).toUpperCase();
}

// Fonction pour obtenir le drapeau du pays (simulation - à remplacer par données réelles)
function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return '🌍';
  const flags: Record<string, string> = {
    'FR': '🇫🇷',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'DE': '🇩🇪',
    'ES': '🇪🇸',
    'IT': '🇮🇹',
    'CA': '🇨🇦',
    'BE': '🇧🇪',
    'CH': '🇨🇭',
    'NL': '🇳🇱',
  };
  return flags[countryCode] || '🌍';
}

export default async function AdminSecretDashboard() {
  // Récupérer les données Supabase
  const allReports = await getAllReports();
  const recentReports = await getRecentReports(20); // Augmenter à 20 pour plus de données

  // Formater les rapports récents avec toutes les infos
  const formattedRecentReports = recentReports.map((report) => {
    const content = typeof report.content === 'object' 
      ? report.content 
      : JSON.parse(report.content || '{}');
    
    return {
      id: report.id,
      title: content.title || report.product_name,
      score: report.score,
      date: new Date(report.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: report.created_at,
      sessionId: generateSessionId(report.id),
      // Pour l'instant, simuler le pays (à remplacer par données réelles depuis Vercel)
      country: 'FR', // À remplacer par données réelles
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculer les statistiques
  const totalReports = allReports.length;
  const avgScore = recentReports.length > 0
    ? Math.round(recentReports.reduce((sum, r) => sum + r.score, 0) / recentReports.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header moderne */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard Admin
            </h1>
            <p className="text-slate-400 text-sm">
              TruthMiner - Monitoring & Analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Vercel Analytics
            </a>
          </div>
        </div>

        {/* Stats Grid moderne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Total Rapports
              </span>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalReports}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Enregistrés dans Supabase
            </div>
          </div>

          {/* Score Moyen */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Score Moyen
              </span>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgScore}%
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Sur les {recentReports.length} derniers rapports
            </div>
          </div>

          {/* Serper Credits */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                Serper Credits
              </span>
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              —
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="https://serper.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Vérifier sur Serper.dev
              </a>
            </div>
          </div>

          {/* OpenAI Usage */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                OpenAI Usage
              </span>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              —
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="https://platform.openai.com/usage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Vérifier sur OpenAI
              </a>
            </div>
          </div>
        </div>

        {/* Tableau des rapports récents */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rapports Récents
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {formattedRecentReports.length} rapports
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {formattedRecentReports.length > 0 ? (
                  formattedRecentReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.title}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            report.score >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : report.score >= 60
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {report.score}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {report.sessionId}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-lg" title={report.country}>
                          {getCountryFlag(report.country)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {report.date}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                      Aucun rapport trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')} • Dashboard v2.0
        </div>
      </div>
    </div>
  );
}

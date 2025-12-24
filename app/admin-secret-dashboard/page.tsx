import { Metadata } from 'next';
import { getAllReports, getRecentReports } from '@/lib/supabase/client';
import RegenerateImageButton from '@/components/RegenerateImageButton';
import { SerperService } from '@/lib/services/serper';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

// Fonction pour générer un ID de session abrégé
function generateSessionId(reportId: string): string {
  return reportId.substring(0, 8).toUpperCase();
}

// Fonction pour obtenir le drapeau du pays
function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return '🌍';
  const flags: Record<string, string> = {
    'FR': '🇫🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'ES': '🇪🇸',
    'IT': '🇮🇹', 'CA': '🇨🇦', 'BE': '🇧🇪', 'CH': '🇨🇭', 'NL': '🇳🇱',
  };
  return flags[countryCode] || '🌍';
}

// Vérifier le status des APIs
async function checkAPIStatus() {
  const results = {
    openai: false,
    serper: false,
    serperCredits: null as number | null,
  };

  // Vérifier OpenAI (simple ping)
  try {
    if (process.env.OPENAI_API_KEY) {
      results.openai = true;
    }
  } catch {
    results.openai = false;
  }

  // Vérifier Serper
  try {
    if (process.env.SERPER_API_KEY) {
      const serperService = new SerperService();
      results.serper = true;
      results.serperCredits = await serperService.getAccountCredits();
    }
  } catch {
    results.serper = false;
    results.serperCredits = null;
  }

  return results;
}

// Calculer les rapports générés aujourd'hui vs hier
function calculateDailyStats(reports: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayReports = reports.filter(r => {
    const reportDate = new Date(r.created_at);
    return reportDate >= today;
  });

  const yesterdayReports = reports.filter(r => {
    const reportDate = new Date(r.created_at);
    return reportDate >= yesterday && reportDate < today;
  });

  return {
    today: todayReports.length,
    yesterday: yesterdayReports.length,
  };
}

export default async function AdminSecretDashboard() {
  const allReports = await getAllReports();
  const recentReports = await getRecentReports(20);
  const apiStatus = await checkAPIStatus();
  const dailyStats = calculateDailyStats(allReports);

  const formattedRecentReports = recentReports
    .map((report) => {
      const content =
        typeof report.content === 'object'
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
        country: 'FR',
        hasImage: !!report.image_url,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalReports = allReports.length;
  const avgScore = recentReports.length > 0
    ? Math.round(recentReports.reduce((sum, r) => sum + r.score, 0) / recentReports.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
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
              href="/admin/subscribers"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              📧 Gérer les abonnés (Newsletter)
            </a>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Reports */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Total Rapports</span>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{totalReports}</div>
            <div className="mt-2 text-xs text-slate-500">Enregistrés dans Supabase</div>
          </div>

          {/* Score Moyen */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Score Moyen</span>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{avgScore}%</div>
            <div className="mt-2 text-xs text-slate-500">Sur les {recentReports.length} derniers</div>
          </div>

          {/* Rapports Aujourd'hui */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Aujourd'hui</span>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{dailyStats.today}</div>
            <div className="mt-2 text-xs text-slate-500">
              Hier: {dailyStats.yesterday} ({dailyStats.today > dailyStats.yesterday ? '+' : ''}{dailyStats.today - dailyStats.yesterday})
            </div>
          </div>

          {/* Statut & Crédits API */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Statut & Crédits API</span>
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiStatus.openai ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                ></div>
                <span className="text-sm text-slate-300">
                  {apiStatus.openai ? 'OpenAI : clé configurée' : 'OpenAI : non configuré'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.serper ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {apiStatus.serper
                    ? `Serper : ${apiStatus.serperCredits ?? 'N/A'} crédits`
                    : 'Serper : indisponible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des rapports */}
        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Rapports Récents</h2>
              <span className="text-sm text-slate-400">{formattedRecentReports.length} rapports</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Titre</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Session</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Image</th>
                  <th className="text-center p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="text-right p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {formattedRecentReports.map((report, index) => (
                  <tr
                    key={report.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-900/50'
                    }`}
                  >
                    <td className="p-4">
                      <div className="text-sm font-medium text-white">{report.title}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          report.score >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : report.score >= 60
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {report.score}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-mono text-slate-400">{report.sessionId}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-lg" title={report.country}>{getCountryFlag(report.country)}</span>
                    </td>
                    <td className="p-4 text-center">
                      {report.hasImage ? (
                        <span className="text-emerald-400 text-sm">✓</span>
                      ) : (
                        <span className="text-red-400 text-sm">✗</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <RegenerateImageButton reportId={report.id} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-slate-400">{report.date}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-4">
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')} • Dashboard v2.1
        </div>
      </div>
    </div>
  );
}

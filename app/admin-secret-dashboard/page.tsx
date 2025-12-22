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

export default async function AdminSecretDashboard() {
  // Récupérer les données Supabase
  const allReports = await getAllReports();
  const recentReports = await getRecentReports(10);

  // Formater les rapports récents
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
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-green-800 pb-4">
          <h1 className="text-3xl font-bold text-green-400 mb-2">
            {'>'} ADMIN DASHBOARD
          </h1>
          <p className="text-green-600 text-sm">
            {'//'} TruthMiner - Monitoring & Stats
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Reports */}
          <div className="bg-gray-900 border border-green-800 p-6 rounded">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-600 text-sm">TOTAL_REPORTS</span>
              <span className="text-green-800 text-xs">{'//'} Supabase</span>
            </div>
            <div className="text-4xl font-bold text-green-400">
              {allReports.length}
            </div>
            <div className="mt-2 text-xs text-green-700">
              {'>'} Rapports enregistrés dans la base
            </div>
          </div>

          {/* Serper Credits Info */}
          <div className="bg-gray-900 border border-green-800 p-6 rounded">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-600 text-sm">SERPER_API</span>
              <span className="text-green-800 text-xs">{'//'} Status</span>
            </div>
            <div className="text-green-400 text-sm mb-2">
              {'>'} Vérifier sur{' '}
              <a
                href="https://serper.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-200 underline"
              >
                Serper.dev
              </a>
            </div>
            <div className="text-xs text-green-700 mt-2">
              {'//'} Les crédits sont disponibles dans les headers des réponses API
            </div>
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="bg-gray-900 border border-green-800 rounded overflow-hidden">
          <div className="border-b border-green-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm font-semibold">
                RECENT_REPORTS
              </span>
              <span className="text-green-800 text-xs">
                {'//'} Last 10 queries
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-800">
                  <th className="text-left p-4 text-green-600 text-xs font-semibold uppercase tracking-wider">
                    TITLE
                  </th>
                  <th className="text-center p-4 text-green-600 text-xs font-semibold uppercase tracking-wider">
                    SCORE
                  </th>
                  <th className="text-right p-4 text-green-600 text-xs font-semibold uppercase tracking-wider">
                    DATE
                  </th>
                </tr>
              </thead>
              <tbody>
                {formattedRecentReports.length > 0 ? (
                  formattedRecentReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`border-b border-green-900/50 ${
                        index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'
                      } hover:bg-green-900/10 transition-colors`}
                    >
                      <td className="p-4 text-green-400 text-sm">
                        {report.title}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                            report.score >= 80
                              ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                              : report.score >= 60
                              ? 'bg-amber-900/50 text-amber-400 border border-amber-800'
                              : 'bg-red-900/50 text-red-400 border border-red-800'
                          }`}
                        >
                          {report.score}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-green-500 text-xs font-mono">
                        {report.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-green-700 text-sm">
                      {'>'} No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-green-800 pt-4 text-xs text-green-700">
          <div className="flex items-center justify-between">
            <span>
              {'>'} Last update: {new Date().toLocaleString('fr-FR')}
            </span>
            <span>
              {'//'} Dashboard v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


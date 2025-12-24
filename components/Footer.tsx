import Link from 'next/link';
import { getRecentReports } from '@/lib/supabase/client';

async function RecentReportsList() {
  const reports = await getRecentReports(10);

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {reports.slice(0, 10).map((report) => {
        let content: any = {};
        try {
          content = typeof report.content === 'object'
            ? report.content
            : JSON.parse(report.content || '{}');
        } catch {
          content = { title: report.product_name, slug: report.product_name };
        }

        const title = content.title || report.product_name;
        const slug = content.slug || report.product_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || report.id;

        return (
          <Link
            key={report.id}
            href={`/report/${slug}`}
            className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors truncate"
          >
            {title}
          </Link>
        );
      })}
      <Link
        href="/explore"
        className="block text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mt-3"
      >
        → Toutes les analyses
      </Link>
    </div>
  );
}

export default async function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Analyses populaires */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              Analyses populaires
            </h3>
            <RecentReportsList />
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              Navigation
            </h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/explore"
                className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Explorer les analyses
              </Link>
              <Link
                href="/about"
                className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                À propos
              </Link>
            </div>
          </div>

          {/* Mentions légales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
              Informations
            </h3>
            <div className="space-y-2">
              <Link
                href="/mentions-legales"
                className="block text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Mentions légales
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-4">
                En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} TruthMiner. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}


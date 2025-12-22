'use client';

import Link from 'next/link';
import ArticleCard from './ArticleCard';

type ReportItem = {
  id: string;
  title: string;
  slug: string;
  score: number;
  choice: string;
  createdAt: string;
  category?: string;
  imageUrl?: string;
};

type CategorySectionProps = {
  title: string;
  icon: React.ReactNode;
  category: string;
  reports: ReportItem[];
  isLoading?: boolean;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
};

export default function CategorySection({
  title,
  icon,
  category,
  reports,
  isLoading = false,
  gradientFrom,
  gradientTo,
  iconBg,
}: CategorySectionProps) {
  return (
    <section className="mb-12 md:mb-16">
      {/* Header de section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
            {icon}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {reports.length > 0
                ? `${reports.length} analyse${reports.length > 1 ? 's' : ''} disponible${reports.length > 1 ? 's' : ''}`
                : 'Aucune analyse pour le moment'}
            </p>
          </div>
        </div>
        {reports.length > 0 && (
          <Link
            href={`/explore?category=${encodeURIComponent(category)}`}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Voir tout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Grille d'articles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aucune analyse disponible dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reports.slice(0, 3).map((report) => (
            <ArticleCard
              key={report.id}
              id={report.id}
              title={report.title}
              slug={report.slug}
              score={report.score}
              choice={report.choice}
              createdAt={report.createdAt}
              category={report.category}
              imageUrl={report.imageUrl}
              searchTerms={[report.title].filter(Boolean)} // Fallback : chercher avec le titre si pas d'image
            />
          ))}
        </div>
      )}

      {/* Bouton "Voir tout" mobile */}
      {reports.length > 0 && (
        <div className="mt-6 sm:hidden text-center">
          <Link
            href={`/explore?category=${encodeURIComponent(category)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Voir tout dans {title}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}


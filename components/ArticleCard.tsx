'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImageCard from './ImageCard';

type ArticleCardProps = {
  id: string;
  title: string;
  slug: string;
  score: number;
  choice: string;
  createdAt: string;
  category?: string;
  imageUrl?: string;
  // Pour le fallback : si imageUrl est vide, on cherche avec ces termes
  searchTerms?: string[];
};

function getConfidenceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (score >= 60) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (score >= 40) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
}

export default function ArticleCard({
  title,
  slug,
  score,
  choice,
  createdAt,
  category,
  imageUrl: initialImageUrl,
  searchTerms = [],
}: ArticleCardProps) {
  // ⚠️ RECHERCHE D'IMAGE DÉSACTIVÉE : Les images sont maintenant gérées uniquement dans generate-report
  // pour éviter la fuite de crédits API. Les images doivent être fournies via imageUrl depuis Supabase.
  const [imageUrl] = useState<string | null | undefined>(initialImageUrl);

  return (
    <Link
      href={`/report/${slug}`}
      className="group block rounded-xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image miniature en haut de la carte avec fallback automatique */}
      <ImageCard
        imageUrl={imageUrl}
        title={title}
        height="h-48"
        className="group-hover:scale-105 transition-transform duration-300"
      />
      <div className="p-5 md:p-6">
        {/* Header avec score */}
        <div className="flex items-start justify-between mb-3">
          {category && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 uppercase tracking-[0.1em]">
              {category}
            </span>
          )}
          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getConfidenceColor(
              score
            )}`}
          >
            {score}%
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-50 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {title}
        </h3>

        {/* Extrait */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {choice || 'Analyse basée sur les discussions Reddit.'}
        </p>

        {/* Footer avec date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
            Lire l&apos;analyse
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
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
          </span>
        </div>
      </div>
    </Link>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(initialImageUrl);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Fallback : si pas d'image, chercher une image au vol
  useEffect(() => {
    if (!imageUrl && searchTerms.length > 0 && !isLoadingImage) {
      setIsLoadingImage(true);
      
      // Essayer chaque terme de recherche jusqu'à trouver une image
      const searchImage = async () => {
        for (const term of searchTerms) {
          if (!term) continue;
          
          try {
            const response = await fetch(`/api/search-image?q=${encodeURIComponent(term)}`);
            
            if (!response.ok) {
              console.warn(`[ArticleCard] Erreur HTTP ${response.status} pour "${term}"`);
              // Continuer avec le terme suivant
              continue;
            }
            
            const data = await response.json();
            
            if (data.success && data.imageUrl) {
              setImageUrl(data.imageUrl);
              setIsLoadingImage(false);
              return; // Image trouvée, on arrête
            } else if (data.error) {
              console.warn(`[ArticleCard] Erreur API pour "${term}":`, data.error);
            }
          } catch (error) {
            console.warn(`[ArticleCard] Erreur lors de la recherche d'image pour "${term}":`, error);
            // Continuer avec le terme suivant
          }
        }
        
        setIsLoadingImage(false);
      };
      
      searchImage();
    }
  }, [imageUrl, searchTerms, isLoadingImage]);

  return (
    <Link
      href={`/report/${slug}`}
      className="group block rounded-xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image miniature en haut de la carte */}
      {imageUrl ? (
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-slate-800">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              console.warn('Erreur de chargement d\'image:', imageUrl);
              // Masquer l'image si elle ne charge pas
              (e.target as HTMLImageElement).style.display = 'none';
              setImageUrl(null);
            }}
          />
        </div>
      ) : (
        // Placeholder si pas d'image (avec indicateur de chargement si en cours)
        <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
          {isLoadingImage ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-gray-400 dark:border-slate-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500 dark:text-slate-500">Chargement...</span>
            </div>
          ) : (
            <svg
              className="w-16 h-16 text-gray-400 dark:text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      )}
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


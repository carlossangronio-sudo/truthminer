'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type ReportCard = {
  id: string;
  productName: string;
  score: number;
  category: string;
  slug: string;
  title: string;
  choice: string;
  createdAt: string;
  imageUrl?: string;
};

const CATEGORIES = ['Tous', 'Électronique', 'Cosmétiques', 'Alimentation', 'Services'];

function getConfidenceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
  if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
  return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
}

export default function ExplorePage() {
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lire le paramètre de catégorie depuis l'URL au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
    }
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Si une catégorie est sélectionnée, filtrer directement côté serveur
        const url = selectedCategory && selectedCategory !== 'Tous'
          ? `/api/reports/all?category=${encodeURIComponent(selectedCategory)}`
          : '/api/reports/all';
        
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des analyses');
        }
        setReports(data.reports || []);
        setFilteredReports(data.reports || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory === 'Tous') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((r) => r.category === selectedCategory));
    }
  }, [selectedCategory, reports]);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-3 tracking-tight">
            Explorer les Analyses
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Découvrez tous les produits analysés par TruthMiner, basés sur les discussions Reddit.
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white dark:bg-slate-800 dark:text-slate-50 shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-900/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
                {cat !== 'Tous' && (
                  <span className="ml-2 text-xs opacity-70">
                    ({reports.filter((r) => r.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredReports.length === 0 && (
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 md:p-12 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
              Aucune analyse trouvée
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCategory === 'Tous'
                ? 'Aucun rapport n\'a encore été généré. Soyez le premier !'
                : `Aucune analyse dans la catégorie "${selectedCategory}".`}
            </p>
          </div>
        )}

        {/* Grille de cartes */}
        {!isLoading && !error && filteredReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredReports.map((report) => (
              <Link
                key={report.id}
                href={`/report/${report.slug}`}
                className="group block rounded-2xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Image miniature en haut de la carte */}
                {report.imageUrl ? (
                  <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        console.warn('Erreur de chargement d\'image:', report.imageUrl);
                        // Masquer l'image si elle ne charge pas
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  // Placeholder si pas d'image
                  <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
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
                  </div>
                )}
                <div className="p-5 md:p-6">
                  {/* En-tête avec catégorie et score */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 uppercase tracking-[0.1em]">
                      {report.category || 'Services'}
                    </span>
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(
                        report.score
                      )}`}
                    >
                      {report.score}%
                    </div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {report.title}
                  </h3>

                  {/* Résumé (choice) */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {report.choice || 'Analyse basée sur les discussions Reddit.'}
                  </p>

                  {/* Footer avec date */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                      Lire l&apos;analyse →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats en bas */}
        {!isLoading && !error && reports.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {reports.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyses totales</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {CATEGORIES.slice(1).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Catégories</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length) || 0}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score moyen</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {new Set(reports.map((r) => r.category)).size}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Catégories actives</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


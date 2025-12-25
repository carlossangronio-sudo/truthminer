'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ArticleCard from './ArticleCard';

interface SimilarReport {
  id: string;
  title: string;
  slug: string;
  score: number;
  choice: string;
  createdAt: string;
  category?: string;
  imageUrl?: string;
}

interface SimilarReportsProps {
  currentSlug: string;
  currentCategory?: string;
}

export default function SimilarReports({ currentSlug, currentCategory }: SimilarReportsProps) {
  const [similarReports, setSimilarReports] = useState<SimilarReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSimilarReports = async () => {
      setIsLoading(true);
      try {
        // Charger TOUS les rapports pour sélectionner 3 aléatoires
        const res = await fetch('/api/reports/all');
        const data = await res.json();

        if (res.ok && data.reports) {
          // Filtrer les rapports valides (score > 0) et exclure le rapport actuel
          const validReports = data.reports
            .filter((r: any) => r.score > 0 && (r.slug || r.id) !== currentSlug)
            .map((r: any) => ({
              id: r.id,
              title: r.title,
              slug: r.slug || r.id,
              score: r.score,
              choice: r.choice,
              createdAt: r.createdAt,
              category: r.category,
              imageUrl: r.imageUrl,
            }));

          // Sélectionner 3 rapports aléatoires
          const shuffled = [...validReports].sort(() => Math.random() - 0.5);
          const randomReports = shuffled.slice(0, 3);
          
          setSimilarReports(randomReports);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des analyses similaires:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarReports();
  }, [currentSlug]);

  if (isLoading) {
    return (
      <section className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🔍 D'autres vérités à découvrir
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (similarReports.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔍 D'autres vérités à découvrir
        </h2>
        <Link
          href="/explore"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium whitespace-nowrap sm:ml-4"
        >
          <span className="hidden sm:inline">Voir toutes les analyses</span>
          <span className="sm:hidden">Toutes les analyses</span>
          <span className="hidden sm:inline"> →</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarReports.map((report) => (
          <div key={report.id} className="transform hover:scale-105 transition-transform duration-300">
            <ArticleCard
              id={report.id}
              title={report.title}
              slug={report.slug}
              score={report.score}
              choice={report.choice}
              createdAt={report.createdAt}
              category={report.category}
              imageUrl={report.imageUrl}
              searchTerms={[report.title]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}


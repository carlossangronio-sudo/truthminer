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
        // Charger les rapports de la même catégorie, ou tous les rapports récents
        const url = currentCategory
          ? `/api/reports/by-category?category=${encodeURIComponent(currentCategory)}&limit=5`
          : '/api/reports/recent?limit=5';
        
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          const reports = currentCategory
            ? (data.reports || [])
            : (data.items || []).map((item: any) => ({
                id: item.id,
                title: item.title,
                slug: item.slug || item.id,
                score: item.score,
                choice: item.choice,
                createdAt: item.createdAt,
                category: item.report?.category,
                imageUrl: item.report?.imageUrl,
              }));

          // Exclure le rapport actuel et prendre les 4 premiers
          const filtered = reports
            .filter((r: SimilarReport) => r.slug !== currentSlug)
            .slice(0, 4);
          
          setSimilarReports(filtered);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des analyses similaires:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarReports();
  }, [currentSlug, currentCategory]);

  if (isLoading) {
    return (
      <section className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📖 À lire aussi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📖 À lire aussi
        </h2>
        <Link
          href="/explore"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          Voir toutes les analyses →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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


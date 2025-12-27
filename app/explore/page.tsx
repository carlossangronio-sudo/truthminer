'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ArticleCard from '@/components/ArticleCard';

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
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />
      <div className="container mx-auto px-6 py-8 md:py-12 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase text-slate-900 mb-3 tracking-tighter">
            Explorer les <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Analyses</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium">
            Découvrez toutes les analyses générées par TruthMiner à partir des discussions Reddit.
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
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'glass-card text-slate-600 hover:bg-white/40 border border-white/60'
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
                className="h-48 glass-card animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="glass-card-ultra border-red-200 text-red-600 px-4 py-3">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredReports.length === 0 && (
          <div className="glass-card-ultra p-8 md:p-12 text-center">
            <p className="text-lg font-black uppercase italic text-slate-900 mb-2">
              Aucune analyse trouvée
            </p>
            <p className="text-sm text-slate-600 font-medium">
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
                searchTerms={[report.title, report.productName].filter(Boolean)} // Fallback : chercher avec le titre et le nom du produit
              />
            ))}
          </div>
        )}

        {/* Stats en bas */}
        {!isLoading && !error && reports.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Analyses totales', value: reports.length },
                { label: 'Catégories', value: CATEGORIES.slice(1).length },
                { label: 'Score moyen', value: `${Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length) || 0}%` },
                { label: 'Catégories actives', value: new Set(reports.map((r) => r.category)).size },
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6">
                  <p className="text-2xl md:text-3xl font-black italic text-slate-900 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


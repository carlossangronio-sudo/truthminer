'use client';

import { useState, useEffect, useRef } from 'react';
import CircularProgress from '@/components/CircularProgress';
import ReactMarkdown from 'react-markdown';
import AffiliateLink from '@/components/AffiliateLink';
import Navbar from '@/components/Navbar';
import ArticleCard from '@/components/ArticleCard';
import ShareButtons from '@/components/ShareButtons';
import ReportImage from '@/components/ReportImage';
import SimilarReports from '@/components/SimilarReports';
import Link from 'next/link';

type ClientReport = {
  title: string;
  slug: string;
  choice: string;
  defects: string[];
  article: string;
  products: string[];
  userProfiles?: string;
  keyword?: string;
  createdAt?: string;
  confidenceScore?: number;
  amazonSearchQuery?: string;
  amazonRecommendationReason?: string;
  imageUrl?: string;
};

type ReportCard = {
  id: string;
  title: string;
  slug: string;
  score: number;
  choice: string;
  createdAt: string;
  category?: string;
  imageUrl?: string;
  productName: string;
};

function getConfidenceLabel(score: number): string {
  if (score >= 80) return 'Confiance très forte';
  if (score >= 60) return 'Confiance élevée';
  if (score >= 40) return 'Confiance mitigée';
  return 'Confiance faible';
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [allReports, setAllReports] = useState<ReportCard[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Charger tous les rapports
  useEffect(() => {
    const loadReports = async () => {
      setIsLoadingReports(true);
      try {
        const res = await fetch('/api/reports/all');
        const data = await res.json();
        
        if (res.ok && data.reports) {
          // Formater les rapports au format ReportCard (même logique que la bibliothèque)
          const formatted = data.reports.map((item: any) => {
            // DEBUG: Log pour vérifier les images
            if (item.imageUrl) {
            } else {
            }
            return {
              id: item.id,
              title: item.title,
              slug: item.slug || item.id,
              score: item.score,
              choice: item.choice,
              createdAt: item.createdAt,
              category: item.category,
              imageUrl: item.imageUrl || null,
              productName: item.productName,
            };
          });
          
          setAllReports(formatted);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des rapports:', e);
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadReports();
  }, []);

  // Restaurer le rapport depuis localStorage si présent
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('truthminer:lastReport');
      if (stored) {
        const parsed = JSON.parse(stored) as ClientReport;
        setReport(parsed);
        if (parsed.keyword) {
          setKeyword(parsed.keyword);
        }
        setTimeout(() => {
          if (reportRef.current) {
            const element = reportRef.current;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elementPosition - 100,
              behavior: 'smooth'
            });
          }
        }, 500);
      }
    } catch (e) {
      console.warn('Impossible de charger le rapport depuis localStorage', e);
    }
  }, []);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      if (data.cached && data.report) {
        // Si le rapport existe déjà, rediriger vers la page de détail
        const slug = data.report.slug || data.report.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || data.report.keyword?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (slug) {
          window.location.href = `/report/${slug}`;
          return;
        }
      }

      if (data.report) {
        setReport(data.report);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('truthminer:lastReport', JSON.stringify(data.report));
        }
        setTimeout(() => {
          if (reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      
      {/* Barre de Recherche */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Vérifiez la vérité sur n'importe quel produit
            </h1>
            <p className="text-xl text-white/80 mb-8">
              L'IA analyse des milliers de discussions Reddit pour vous donner la vérité brute
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ex: Meilleure souris gaming, iPhone 15, etc."
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !keyword.trim()}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Analyse en cours...' : 'Générer avec l\'IA'}
              </button>
            </div>

            {isLoading && (
              <div className="mt-8">
                <CircularProgress isActive={isLoading} />
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Rapport Généré */}
      {report && (
        <div ref={reportRef} className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          {/* Score de confiance */}
          <section className="rounded-2xl bg-white/90 border border-gray-100 shadow-sm p-4 mb-1 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-center gap-4">
              {(() => {
                const score = report.confidenceScore ?? 50;
                const label = getConfidenceLabel(score);
                const colorClasses =
                  score >= 80
                    ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
                    : score >= 60
                    ? 'border-amber-400 text-amber-700 bg-amber-50'
                    : score >= 40
                    ? 'border-amber-400 text-amber-700 bg-amber-50'
                    : 'border-red-400 text-red-700 bg-red-50';
                return (
                  <>
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-4 text-sm font-bold ${colorClasses}`}
                    >
                      {score}%
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 mb-0.5">
                        Score de confiance TruthMiner
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug">
                        <span className="font-semibold">{label}</span>{' '}
                        — basé uniquement sur le ton des avis Reddit analysés, sans contenu sponsorisé.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </section>

          {/* Image principale */}
          <div className="mb-8">
            <ReportImage 
              imageUrl={report.imageUrl} 
              title={report.title}
            />
          </div>

          {/* Points forts et faibles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <section className="rounded-3xl bg-white border border-emerald-100 shadow-[0_18px_50px_rgba(16,185,129,0.08)] p-6 md:p-8 dark:bg-slate-900/90 dark:border-emerald-900/60">
              <div className="flex items-center mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mr-3 border border-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                    Points forts (Choix de la communauté)
                  </h2>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed">
                {report.choice}
              </p>
            </section>

            {report.defects && report.defects.length > 0 && (
              <section className="rounded-3xl bg-white border border-red-100 shadow-[0_18px_50px_rgba(248,113,113,0.08)] p-6 md:p-8 dark:bg-slate-900/90 dark:border-red-900/70">
                <div className="flex items-center mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 mr-3 border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                      <path d="M10.29 3.86L2.82 18a1 1 0 00.9 1.47h16.56a1 1 0 00.9-1.47L13.71 3.86a1 1 0 00-1.82 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                      Points faibles (Défauts rédhibitoires)
                    </h2>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {report.defects.map((defect: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 mr-3 dark:bg-red-300" />
                      <span className="text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed">
                        {defect}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Analyse détaillée */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 mb-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Analyse détaillée
            </h2>
            <div className="prose prose-lg max-w-none markdown-content">
              <ReactMarkdown>{report.article}</ReactMarkdown>
            </div>
          </section>

          {/* Lien Amazon */}
          {report.amazonSearchQuery && (
            <section className="mb-8">
              <AffiliateLink
                amazonSearchQuery={report.amazonSearchQuery}
                recommendationReason={report.amazonRecommendationReason || 'Produit recommandé par la communauté Reddit'}
              />
            </section>
          )}

          {/* Boutons de partage */}
          <ShareButtons 
            title={report.title} 
            slug={report.slug} 
            score={report.confidenceScore}
          />

          {/* D'autres analyses */}
          <SimilarReports 
            currentSlug={report.slug}
            currentCategory={undefined}
          />
        </div>
      )}

      {/* Section Tous les Rapports */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          📚 Toutes les Analyses
        </h2>
        
        {isLoadingReports ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : allReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {allReports.map((report) => (
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
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Aucune analyse disponible pour le moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}

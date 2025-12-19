'use client';

import { useState, useEffect, useRef } from 'react';
import Loader from '@/components/Loader';
import ReactMarkdown from 'react-markdown';
import AffiliateLink from '@/components/AffiliateLink';
import Navbar from '@/components/Navbar';
import CategorySection from '@/components/CategorySection';

// Utilitaires pour le nettoyage et la mise en forme du contenu
function cleanDefectText(text: string): string {
  let t = text.trim();
  t = t.replace(/\.{3,}$/g, '');
  t = t.replace(/\s+/g, ' ');
  return t;
}

function stripEstCeFaitPourVousSection(markdown: string): string {
  return markdown.replace(/##\s*Est-ce fait pour vous[\s\S]*$/i, '').trim();
}

function highlightKeyword(text: string, keyword?: string): string {
  if (!keyword) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '**$1**');
}

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
  const [recent, setRecent] = useState<
    {
      id: string;
      productName: string;
      score: number;
      title: string;
      choice: string;
      slug: string | null;
      createdAt: string;
      report: ClientReport;
    }[]
  >([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  
  // Données des sections par catégorie
  const [highTechReports, setHighTechReports] = useState<any[]>([]);
  const [santeBeauteReports, setSanteBeauteReports] = useState<any[]>([]);
  const [alimentationReports, setAlimentationReports] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Ref pour le scroll automatique vers le rapport
  const reportRef = useRef<HTMLDivElement>(null);

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
        // Scroll vers le rapport après un court délai
        setTimeout(() => {
          if (reportRef.current) {
            reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    } catch (e) {
      console.warn('Impossible de charger le rapport depuis localStorage', e);
    }
  }, []);

  useEffect(() => {
    const loadRecent = async () => {
      setIsLoadingRecent(true);
      setRecentError(null);
      try {
        const res = await fetch('/api/reports/recent');
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des analyses récentes');
        }
        setRecent(data.items || []);
      } catch (e) {
        setRecentError(
          e instanceof Error ? e.message : 'Erreur lors du chargement des analyses récentes'
        );
      } finally {
        setIsLoadingRecent(false);
      }
    };

    loadRecent();
  }, []);

  // Charger les rapports par catégorie
  useEffect(() => {
    const loadCategoryReports = async () => {
      setIsLoadingCategories(true);
      try {
        // High-Tech (Électronique)
        const resHighTech = await fetch('/api/reports/by-category?category=Électronique&limit=3');
        const dataHighTech = await resHighTech.json();
        if (resHighTech.ok) {
          setHighTechReports(dataHighTech.reports || []);
        }

        // Santé & Beauté (Cosmétiques)
        const resSanteBeaute = await fetch('/api/reports/by-category?category=Cosmétiques&limit=3');
        const dataSanteBeaute = await resSanteBeaute.json();
        if (resSanteBeaute.ok) {
          setSanteBeauteReports(dataSanteBeaute.reports || []);
        }

        // Alimentation
        const resAlimentation = await fetch('/api/reports/by-category?category=Alimentation&limit=3');
        const dataAlimentation = await resAlimentation.json();
        if (resAlimentation.ok) {
          setAlimentationReports(dataAlimentation.reports || []);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des catégories:', e);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategoryReports();
  }, []);

  const handleSelectRecent = (item: (typeof recent)[number]) => {
    const content = item.report;
    const normalized: ClientReport = {
      ...content,
      keyword: item.productName,
      createdAt: item.createdAt,
      confidenceScore: item.score,
    };
    setReport(normalized);
    setKeyword(item.productName);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('truthminer:lastReport', JSON.stringify(normalized));
      } catch (e) {
        console.warn('Impossible de sauvegarder le rapport sélectionné dans localStorage', e);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('Veuillez entrer un mot-clé');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        const errorMsg = errorData.error || `Erreur ${response.status}: ${response.statusText}`;
        console.error('Erreur API:', errorMsg, errorData.details);
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      if (!data.success || !data.report) {
        throw new Error(data.error || 'Aucun rapport généré');
      }
      const rawReport = data.report as ClientReport;
      const baseKeyword = rawReport.keyword || keyword.trim();
      const cleanedReport: ClientReport = {
        ...rawReport,
        defects: Array.isArray(rawReport.defects)
          ? rawReport.defects.map(cleanDefectText)
          : [],
        article: rawReport.article
          ? highlightKeyword(stripEstCeFaitPourVousSection(rawReport.article), baseKeyword)
          : '',
        userProfiles: rawReport.userProfiles
          ? highlightKeyword(rawReport.userProfiles, baseKeyword)
          : undefined,
      };
      setReport(cleanedReport);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('truthminer:lastReport', JSON.stringify(cleanedReport));
        } catch (e) {
          console.warn('Impossible de sauvegarder le rapport dans localStorage', e);
        }
      }
      setIsLoading(false);
      
      // Scroll automatique vers le rapport après un court délai pour laisser le DOM se mettre à jour
      setTimeout(() => {
        if (reportRef.current) {
          reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error('Erreur lors de la génération:', err);
      setError(errorMsg);
      setIsLoading(false);
      
      // Afficher les détails en mode développement
      if (process.env.NODE_ENV === 'development' && err instanceof Error) {
        console.error('Stack trace:', err.stack);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-14 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {/* Header et barre de recherche */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">
              TruthMiner
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-1">
              Comparaisons de produits ultra-honnêtes
            </p>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              L&apos;IA qui n&apos;a pas sa langue dans sa poche.
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto mb-12">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-gray-200/70 dark:border-slate-700 px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label
                  htmlFor="keyword"
                  className="block text-xs font-medium uppercase tracking-[0.18em] text-gray-500"
                >
                  Analyse un produit via Reddit
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 text-gray-400 dark:text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                  </span>
                  <input
                    id="keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Ex: Meilleure souris gaming, Casque audio sans fil..."
                    className="w-full pl-12 pr-4 py-3.5 text-base md:text-lg font-medium text-black dark:text-white bg-transparent border border-transparent rounded-2xl focus:ring-0 focus:border-gray-300 dark:focus:border-slate-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !keyword.trim()}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 text-sm md:text-base shadow-[0_14px_40px_rgba(37,99,235,0.35)] transition-all duration-200 dark:disabled:from-slate-700 dark:disabled:to-slate-800"
                >
                  {isLoading ? 'Analyse en cours...' : 'Générer un rapport honnête'}
                </button>
              </form>

              {isLoading && (
                <div className="mt-8">
                  <Loader message="Analyse des discussions Reddit et génération de l'article..." />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Affichage du rapport généré - PRIORITÉ ABSOLUE si présent */}
        {report ? (
          <div ref={reportRef} className="w-full max-w-4xl mt-8">
            {/* Bouton pour revenir à l'accueil */}
            <div className="mb-6">
              <button
                onClick={() => {
                  setReport(null);
                  setKeyword('');
                  if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('truthminer:lastReport');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
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
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
                Retour à l&apos;accueil
              </button>
            </div>
            <div className="mt-6 md:mt-10 space-y-8 md:space-y-10 animate-fade-in">
              {/* Score de confiance TruthMiner */}
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

              <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {report.createdAt
                    ? `Rapport généré le ${new Date(report.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : `Rapport généré à partir des discussions Reddit`}
                </p>
                {report.keyword && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Mot-clé analysé :{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {report.keyword}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="rounded-3xl bg-white border border-emerald-100 shadow-[0_18px_50px_rgba(16,185,129,0.08)] p-6 md:p-8 animate-fade-in-delay-1 dark:bg-slate-900/90 dark:border-emerald-900/60">
                  <div className="flex items-center mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mr-3 border border-emerald-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                        Points forts (Choix de la communauté)
                      </h2>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Ce que la communauté Reddit apprécie vraiment
                      </p>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed">
                    {report.choice}
                  </p>
                </section>

                {report.defects && report.defects.length > 0 && (
                  <section className="rounded-3xl bg-white border border-red-100 shadow-[0_18px_50px_rgba(248,113,113,0.08)] p-6 md:p-8 animate-fade-in-delay-2 dark:bg-slate-900/90 dark:border-red-900/70">
                    <div className="flex items-center mb-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 mr-3 border border-red-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.7}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M10.29 3.86L2.82 18a1 1 0 00.9 1.47h16.56a1 1 0 00.9-1.47L13.71 3.86a1 1 0 00-1.82 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-50 tracking-tight">
                          Points faibles (Défauts rédhibitoires)
                        </h2>
                        <p className="text-xs text-red-700 mt-0.5">
                          Ce que le marketing ne vous dit pas
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {report.defects.map((defect, index) => (
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

              <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-3 dark:bg-slate-900/90 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Analyse détaillée
                </h2>
                <div className="prose prose-lg max-w-none markdown-content">
                  <ReactMarkdown>{report.article}</ReactMarkdown>
                </div>
              </section>

              {report.userProfiles && report.userProfiles.trim().length > 0 && (
                <section className="rounded-2xl bg-gradient-to-br from-green-50 to-white dark:from-emerald-950 dark:to-slate-950 border border-green-100 dark:border-emerald-900 shadow-md p-6 md:p-8 animate-fade-in-delay-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                    Est-ce fait pour vous ?
                  </h2>
                  <div className="prose prose-lg max-w-none markdown-content">
                    <ReactMarkdown>{report.userProfiles}</ReactMarkdown>
                  </div>
                </section>
              )}

              {report.products && report.products.length > 0 && (
                <section className="rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-5 dark:bg-slate-900/80 dark:border-slate-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                    Vérifier les prix
                  </h2>
                  <div className="space-y-3">
                    {Array.from(new Set(report.products)).map((product, index) => (
                      <div key={index}>
                        <AffiliateLink productName={product} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-3xl bg-gray-50 border border-gray-200 shadow-sm p-6 md:p-7 animate-fade-in-delay-6 dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-900 text-gray-50 uppercase tracking-[0.16em]">
                      Verdict TruthMiner
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Synthèse basée sur les discussions Reddit
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-800 dark:text-gray-100 leading-relaxed font-semibold">
                  Le consensus Reddit est sans appel :{' '}
                  <span className="font-extrabold">
                    {report.choice}
                  </span>
                </p>
              </section>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="bg-gray-50 rounded-xl p-6 dark:bg-slate-900/80">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Comment ça fonctionne ?
              </h2>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Recherche automatique des discussions Reddit pertinentes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Analyse par GPT-4o pour identifier le choix de la communauté</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Révélation des défauts rédhibitoires ignorés par le marketing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Génération d'un article structuré et honnête</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Sections par catégories - Affichées en dessous du rapport si présent, sinon juste après la barre de recherche */}
        <div className="w-full max-w-6xl mx-auto space-y-12 md:space-y-16 mt-8">
          {/* Section High-Tech */}
          <CategorySection
            title="High-Tech"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            }
            category="Électronique"
            reports={highTechReports}
            isLoading={isLoadingCategories}
            gradientFrom="from-blue-500"
            gradientTo="to-indigo-600"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
          />

          {/* Section Santé & Beauté */}
          <CategorySection
            title="Santé & Beauté"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-pink-600 dark:text-pink-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            }
            category="Cosmétiques"
            reports={santeBeauteReports}
            isLoading={isLoadingCategories}
            gradientFrom="from-pink-500"
            gradientTo="to-rose-600"
            iconBg="bg-pink-100 dark:bg-pink-900/30"
          />

          {/* Section Alimentation */}
          <CategorySection
            title="Alimentation"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
            category="Alimentation"
            reports={alimentationReports}
            isLoading={isLoadingCategories}
            gradientFrom="from-emerald-500"
            gradientTo="to-green-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          />
        </div>
      </div>
    </main>
  );
}


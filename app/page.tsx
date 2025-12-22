'use client';

import { useState, useEffect, useRef } from 'react';
import CircularProgress from '@/components/CircularProgress';
import ReactMarkdown from 'react-markdown';
import AffiliateLink from '@/components/AffiliateLink';
import Navbar from '@/components/Navbar';
import ArticleCard from '@/components/ArticleCard';
import ShareButtons from '@/components/ShareButtons';
import ReportImage from '@/components/ReportImage';
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
  
  // Données pour le magazine
  const [latestReport, setLatestReport] = useState<ReportCard | null>(null);
  const [scamsReports, setScamsReports] = useState<ReportCard[]>([]);
  const [topReports, setTopReports] = useState<ReportCard[]>([]);
  const [techReports, setTechReports] = useState<ReportCard[]>([]);
  const [gamingReports, setGamingReports] = useState<ReportCard[]>([]);
  const [servicesReports, setServicesReports] = useState<ReportCard[]>([]);
  const [diversReports, setDiversReports] = useState<ReportCard[]>([]);
  const [allReports, setAllReports] = useState<ReportCard[]>([]);
  const [isLoadingMagazine, setIsLoadingMagazine] = useState(true);
  
  const reportRef = useRef<HTMLDivElement>(null);

  // Charger les données du magazine
  useEffect(() => {
    const loadMagazineData = async () => {
      setIsLoadingMagazine(true);
      try {
        // Charger le dernier rapport pour la section Hero
        const latestRes = await fetch('/api/reports/recent?limit=1');
        const latestData = await latestRes.json();
        if (latestRes.ok && latestData.items && latestData.items.length > 0) {
          const latest = latestData.items[0];
          setLatestReport({
            id: latest.id,
            title: latest.title,
            slug: latest.slug || latest.id,
            score: latest.score,
            choice: latest.choice,
            createdAt: latest.createdAt,
            category: latest.report?.category,
            imageUrl: latest.report?.imageUrl,
            productName: latest.productName,
          });
        }

        // Charger les rapports par catégorie et TOUS les rapports
        const [techRes, gamingRes, servicesRes, diversRes, allRes] = await Promise.all([
          fetch('/api/reports/by-category?category=Électronique&limit=4'),
          fetch('/api/reports/by-category?category=Gaming&limit=4'),
          fetch('/api/reports/by-category?category=Services&limit=4'),
          fetch('/api/reports/by-category?category=Divers&limit=4'),
          fetch('/api/reports/all'), // Récupérer TOUS les rapports (sans limite)
        ]);

        const [techData, gamingData, servicesData, diversData, allData] = await Promise.all([
          techRes.json(),
          gamingRes.json(),
          gamingRes.json(), // Gaming utilise la même catégorie pour l'instant
          servicesRes.json(),
          diversRes.json(),
          allRes.json(),
        ]);

        if (techRes.ok) setTechReports(techData.reports || []);
        if (gamingRes.ok) setGamingReports(gamingData.reports || []);
        if (servicesRes.ok) setServicesReports(servicesData.reports || []);
        if (diversRes.ok) setDiversReports(diversData.reports || []);

        // Scams : rapports avec score faible (< 40) mais > 0
        if (allRes.ok && allData.reports) {
          // NETTOYAGE STRICT : Filtrer les rapports valides (score > 0) et supprimer les doublons
          const validReports = allData.reports.filter((r: ReportCard) => r.score > 0);
          
          // Supprimer les doublons évidents basés sur le titre normalisé
          const seenTitles = new Set<string>();
          const uniqueReports = validReports.filter((r: ReportCard) => {
            const normalizedTitle = r.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
            if (seenTitles.has(normalizedTitle)) {
              return false; // Doublon détecté
            }
            seenTitles.add(normalizedTitle);
            return true;
          });
          
          // Stocker TOUS les rapports valides pour la section "Archives"
          setAllReports(uniqueReports);
          
          // Scams : rapports avec score faible (< 40)
          const scams = uniqueReports
            .filter((r: ReportCard) => r.score < 40)
            .slice(0, 4);
          setScamsReports(scams);

          // Tops : rapports avec score élevé (>= 80)
          const tops = uniqueReports
            .filter((r: ReportCard) => r.score >= 80)
            .slice(0, 4);
          setTopReports(tops);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données du magazine:', e);
      } finally {
        setIsLoadingMagazine(false);
      }
    };

    loadMagazineData();
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
        // SYSTÈME DE CACHE : Si le rapport existe déjà, rediriger vers la page de détail
        // Évite de consommer des crédits OpenAI/Serper pour un rapport déjà existant
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
      
      {/* Section Hero - À la Une */}
      {latestReport && !report && (
        <section className="relative w-full h-[70vh] min-h-[600px] overflow-hidden">
          {latestReport.imageUrl ? (
            <div className="absolute inset-0">
              <img
                src={latestReport.imageUrl}
                alt={latestReport.title}
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.4)' }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="relative z-10 container mx-auto px-4 md:px-6 h-full flex items-end pb-16">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold mb-4">
                <span>À LA UNE</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {latestReport.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6 line-clamp-2">
                {latestReport.choice}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  latestReport.score >= 80
                    ? 'bg-emerald-500 text-white'
                    : latestReport.score >= 60
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  Score: {latestReport.score}%
                </div>
                <span className="text-white/80 text-sm">
                  {new Date(latestReport.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <Link
                href={`/report/${latestReport.slug}`}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Lire l'analyse complète →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Barre de Recherche Centrale */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Vérifiez la vérité sur n'importe quel produit
            </h2>
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

          {/* Boutons de partage */}
          <ShareButtons 
            title={report.title} 
            slug={report.slug} 
            score={report.confidenceScore}
          />
        </div>
      )}

      {/* Sections Magazine */}
      {!report && (
        <div className="container mx-auto px-4 md:px-6 py-12 space-y-16">
          {/* Derniers Scams Détectés */}
          {scamsReports.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🚨 Derniers Scams Détectés
                </h2>
                <Link
                  href="/explore"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {scamsReports.map((report) => (
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
          )}

          {/* Les Tops du Moment */}
          {topReports.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ⭐ Les Tops du Moment
                </h2>
                <Link
                  href="/explore"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topReports.map((report) => (
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
          )}

          {/* Grille de Catégories */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Par Catégorie
            </h2>
            
            {/* Tech */}
            {techReports.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">💻 Tech</h3>
                  <Link href="/explore?category=Électronique" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {techReports.map((report) => (
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
              </div>
            )}

            {/* Gaming */}
            {gamingReports.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">🎮 Gaming</h3>
                  <Link href="/explore?category=Gaming" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gamingReports.map((report) => (
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
              </div>
            )}

            {/* Services */}
            {servicesReports.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">🔧 Services</h3>
                  <Link href="/explore?category=Services" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {servicesReports.map((report) => (
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
              </div>
            )}

            {/* Divers */}
            {diversReports.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">📦 Divers</h3>
                  <Link href="/explore?category=Divers" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {diversReports.map((report) => (
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
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

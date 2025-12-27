'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CircularProgress from '@/components/CircularProgress';
import Navbar from '@/components/Navbar';
import Newsletter from '@/components/Newsletter';
import FeaturesSection from '@/components/FeaturesSection';
import RecentReportsGrid from '@/components/RecentReportsGrid';
import InterfaceTutorial from '@/components/InterfaceTutorial';
import { IABadge } from '@/components/IABadge';
import { Search } from 'lucide-react';

interface RecentReport {
  id: string;
  title: string;
  slug: string | null;
  score: number;
  url_image?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  product_name?: string;
  productName?: string;
}

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Charger les rapports récents
  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        const res = await fetch('/api/reports/recent?limit=6');
        const data = await res.json();
        if (res.ok && data.items) {
          setRecentReports(data.items);
        }
      } catch (e) {
        console.error('Erreur lors du chargement des rapports récents:', e);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchRecentReports();
  }, []);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);

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

      // Extraire le slug du rapport (nouveau ou existant)
      let slug: string | null = null;
      
      if (data.cached && data.report) {
        // Rapport existant (cache hit)
        slug = data.report.slug || 
          data.report.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 
          data.report.keyword?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      } else if (data.report) {
        // Nouveau rapport généré
        slug = data.report.slug || 
          data.report.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 
          data.report.keyword?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      // Rediriger vers la page dédiée du rapport avec transition
      if (slug) {
        // Le loader reste affiché pendant la redirection
        // Utiliser router.push pour une transition fluide avec framer-motion
        router.push(`/report/${slug}`);
        // Ne pas mettre setIsLoading(false) ici pour que le loader reste visible
        return;
      } else {
        throw new Error('Impossible de déterminer le slug du rapport');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
      setIsLoading(false); // Arrêter le loader seulement en cas d'erreur
    }
  };

  return (
    <main className="min-h-screen relative">
      <Navbar />
      
      {/* Hero Section - Style Crystal/Glassmorphism */}
      <section className="relative pt-32 pb-20" style={{ overflow: 'visible' }}>
        <div className="container mx-auto px-6" style={{ overflow: 'visible' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
            style={{ overflow: 'visible' }}
          >
            <IABadge text="Vérification en temps réel" />
            
            <h1 className="font-black mb-8 tracking-tighter italic uppercase text-slate-900" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: '1.8', paddingBottom: '3rem', paddingTop: '2rem', overflow: 'visible', display: 'block' }}>
              <span className="block" style={{ lineHeight: '1.8', paddingBottom: '2rem', paddingTop: '1rem', overflow: 'visible', display: 'block' }}>
                Ne vous faites plus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">avoir</span>
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Découvrez la vérité cachée dans les discussions Reddit. Obtenez en 30 secondes ce que les autres mettent 3 heures à trouver.
            </p>
            
            {/* Barre de recherche style Glassmorphism */}
            <div className="max-w-2xl mx-auto relative group mb-6">
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full group-hover:bg-blue-500/20 transition-all" />
              <div className="relative flex items-center bg-white/60 backdrop-blur-3xl border border-white p-2 rounded-2xl shadow-xl">
                <Search className="ml-4 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        placeholder="Quel produit ou sujet aimeriez-vous miner ?"
                        className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-900 font-medium placeholder:text-slate-400"
                      />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !keyword.trim()}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase italic tracking-wider hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyse...' : 'Analyser'}
                </button>
              </div>
            </div>

            {/* Interface "Analyse en cours" avec barre de progression animée */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 max-w-2xl mx-auto"
              >
                <div className="glass-card p-8">
                  <h3 className="text-xl font-black text-blue-600 mb-4 uppercase italic text-center">
                    Analyse en cours...
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 text-center font-medium">
                    Extraction des signaux Reddit pour <span className="text-blue-600 font-bold">{keyword}</span>
                  </p>
                  <CircularProgress isActive={isLoading} />
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Scan des discussions Reddit...</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Analyse des avis communautaires...</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Génération du rapport de vérité...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 glass-card border-red-200 text-red-600 max-w-2xl mx-auto"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tutorial interactif */}
      <section className="relative py-16 md:py-24 z-10">
        <InterfaceTutorial />
      </section>

      {/* Section Features - Explication de la méthode */}
      <section className="relative z-10">
        <FeaturesSection />
      </section>

      {/* Bibliothèque de pépites déjà minées */}
      {!isLoadingReports && recentReports.length > 0 && (
        <section className="relative py-16 md:py-24">
          <div className="container mx-auto px-6" style={{ overflow: 'visible' }}>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12 text-center uppercase italic tracking-tighter" style={{ lineHeight: '2', paddingBottom: '3rem', paddingTop: '2rem', overflow: 'visible', display: 'block' }}>
              Analyses <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500" style={{ display: 'inline-block', paddingBottom: '2rem', paddingTop: '1rem', lineHeight: '2.2', overflow: 'visible' }}>Déjà Minées</span>
            </h2>
            <RecentReportsGrid reports={recentReports} />
          </div>
        </section>
      )}

      {/* Newsletter / capture email */}
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl relative z-10">
        <Newsletter className="mt-4" />
      </div>
    </main>
  );
}

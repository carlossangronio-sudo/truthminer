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
import { NeuralBackground } from '@/components/NeuralBackground';
import { IABadge } from '@/components/IABadge';

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
    <main className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      
      <Navbar />
      
      {/* Hero Section - Style Cyber/Neural */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center"
          >
            <IABadge text="Extraction d'avis communautaires" />
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                DETERREZ LA VÉRITÉ
              </span>
              <br />
              <span className="text-white">BRUTE</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Moteur de recherche de vérité : On scanne Reddit pour vous éviter de le faire.
            </p>
            
            {/* Barre de recherche style Perplexity/ChatGPT - ÉLÉMENT CENTRAL */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="relative flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_50px_rgba(34,211,238,0.3)] hover:border-cyan-500/70 transition-all">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Entrez un produit ou un sujet précis (ex: iPhone 16, Dyson V15, Tesla Model 3)"
                  className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg md:text-xl font-medium"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !keyword.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-black text-base md:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.7)]"
                >
                  {isLoading ? 'Minage...' : 'Miner'}
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3 uppercase tracking-widest">
                Analysé en temps réel via Reddit
              </p>
            </div>

            {/* Interface "Minage en cours" avec barre de progression animée */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 max-w-2xl mx-auto"
              >
                <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                  <h3 className="text-xl font-black text-cyan-400 mb-4 uppercase tracking-tighter text-center">
                    Minage en cours...
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 text-center">
                    Extraction des signaux Reddit pour <span className="text-cyan-400 font-bold">{keyword}</span>
                  </p>
                  <CircularProgress isActive={isLoading} />
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span>Scan des discussions Reddit...</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span>Analyse des avis communautaires...</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
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
                className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 max-w-2xl mx-auto"
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
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-8 text-center uppercase tracking-tighter">
              Bibliothèque de pépites déjà minées
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

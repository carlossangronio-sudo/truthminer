'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CircularProgress from '@/components/CircularProgress';
import Navbar from '@/components/Navbar';
import Newsletter from '@/components/Newsletter';
import FeaturesSection from '@/components/FeaturesSection';
import RecentReportsGrid from '@/components/RecentReportsGrid';
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
            
            <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Nous analysons des milliers de discussions Reddit pour extraire l&apos;essence des opinions réelles. 
              <span className="text-cyan-400"> Pas de marketing, juste du vécu.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ex: iPhone 15, souris gaming, VPN..."
                className="flex-1 px-6 py-4 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !keyword.trim()}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
              >
                {isLoading ? 'Analyse en cours...' : 'Scanner'}
              </button>
            </div>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <CircularProgress isActive={isLoading} />
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

      {/* Section Features - Explication de la méthode */}
      <FeaturesSection />

      {/* Archives - Rapports récents */}
      {!isLoadingReports && recentReports.length > 0 && (
        <RecentReportsGrid reports={recentReports} />
      )}

      {/* Newsletter / capture email */}
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl relative z-10">
        <Newsletter className="mt-4" />
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '@/components/CircularProgress';
import Navbar from '@/components/Navbar';
import Newsletter from '@/components/Newsletter';
import FeaturesSection from '@/components/FeaturesSection';

export default function Home() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Rediriger vers la page dédiée du rapport
      if (slug) {
        // Le loader reste affiché pendant la redirection
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
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      
      {/* Barre de Recherche */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Vérifiez la vérité brute sur n'importe quel sujet
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Ne perdez plus des heures sur les forums. TruthMiner synthétise le Web pour vous sur n&apos;importe quel sujet.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ex: IA générative, impôts freelance, meilleure souris gaming, etc."
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !keyword.trim()}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Analyse en cours...' : 'Lancer une analyse'}
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

      {/* Section Features - Explication de la méthode */}
      <FeaturesSection />

      {/* Newsletter / capture email */}
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <Newsletter className="mt-4" />
      </div>
    </main>
  );
}

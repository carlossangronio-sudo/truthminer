'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError('Veuillez entrer un mot-clé');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du rapport');
      }

      // Rediriger vers la page du rapport
      router.push(`/report/${data.report.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              TruthMiner
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Comparaisons de produits ultra-honnêtes
            </p>
            <p className="text-gray-500">
              Basées sur l'analyse des discussions Reddit
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="keyword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rechercher un produit
                </label>
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: Meilleure souris gaming, Casque audio sans fil..."
                  className="w-full px-6 py-4 text-xl font-normal text-black bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !keyword.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg shadow-md hover:shadow-lg"
              >
                {isLoading ? 'Génération en cours...' : 'Générer avec l\'IA'}
              </button>
            </form>

            {isLoading && (
              <div className="mt-8">
                <Loader message="Analyse des discussions Reddit et génération de l'article..." />
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
            <ul className="space-y-2 text-gray-600">
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
      </div>
    </main>
  );
}



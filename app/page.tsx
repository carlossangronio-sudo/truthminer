'use client';

import { useState } from 'react';
import Loader from '@/components/Loader';
import ReactMarkdown from 'react-markdown';
import AffiliateLink from '@/components/AffiliateLink';

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
};

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ClientReport | null>(null);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du rapport');
      }

      setReport(data.report as ClientReport);
      setIsLoading(false);
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
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
              TruthMiner
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              Comparaisons de produits ultra-honnêtes
            </p>
            <p className="text-gray-500">
              Basées sur l'analyse des discussions Reddit
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl shadow-blue-100 p-8 mb-10 border border-blue-50">
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
                  className="w-full px-6 py-4 text-xl md:text-2xl font-medium text-black bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 shadow-inner"
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

          {/* Résultats / Info Section */}
          {report ? (
            <div className="mt-10 space-y-10">
              {/* Meta */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500">
                  {report.createdAt
                    ? `Rapport généré le ${new Date(report.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : `Rapport généré à partir des discussions Reddit`}
                </p>
                {report.keyword && (
                  <p className="text-sm text-gray-500 mt-1">
                    Mot-clé analysé : <span className="font-medium text-gray-700">{report.keyword}</span>
                  </p>
                )}
              </div>

              {/* Points forts (Choix de la communauté) */}
              <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mr-3">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Points forts (Choix de la communauté)
                    </h2>
                    <p className="text-sm text-emerald-700 mt-0.5">
                      Ce que la communauté Reddit apprécie vraiment
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed">
                  {report.choice}
                </p>
              </section>

              {/* Points faibles / Défauts rédhibitoires */}
              {report.defects && report.defects.length > 0 && (
                <section className="rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-100 shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 mr-3">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Points faibles (Défauts rédhibitoires)
                      </h2>
                      <p className="text-sm text-red-700 mt-0.5">
                        Ce que le marketing ne vous dit pas
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {report.defects.map((defect, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-600 mr-3 mt-1">•</span>
                        <span className="text-gray-800 leading-relaxed">{defect}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Article complet */}
              <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Analyse détaillée
                </h2>
                <div className="prose prose-lg max-w-none markdown-content">
                  <ReactMarkdown>{report.article}</ReactMarkdown>
                </div>
              </section>

              {/* Est-ce fait pour vous ? */}
              {report.userProfiles && report.userProfiles.trim().length > 0 && (
                <section className="rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    ✅ Est-ce fait pour vous ?
                  </h2>
                  <div className="prose prose-lg max-w-none markdown-content">
                    <ReactMarkdown>{report.userProfiles}</ReactMarkdown>
                  </div>
                </section>
              )}

              {/* Liens d'affiliation */}
              {report.products && report.products.length > 0 && (
                <section className="rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
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

              {/* Verdict de la communauté */}
              <section className="rounded-2xl bg-black text-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-3">
                  Verdict de la communauté
                </h2>
                <p className="text-lg font-semibold leading-relaxed">
                  Le consensus Reddit est sans appel :{' '}
                  <span className="font-extrabold">
                    {report.choice}
                  </span>
                </p>
              </section>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </main>
  );
}



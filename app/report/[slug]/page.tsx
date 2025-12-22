export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getReportBySlug } from '@/lib/supabase/client';
import AffiliateLink from '@/components/AffiliateLink';
import ShareButtons from '@/components/ShareButtons';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/Navbar';
import SimilarReports from '@/components/SimilarReports';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabaseReport = await getReportBySlug(slug);

  if (!supabaseReport) {
    return {
      title: 'Rapport introuvable',
    };
  }

  const content = typeof supabaseReport.content === 'object'
    ? supabaseReport.content
    : JSON.parse(supabaseReport.content || '{}');

  const report = {
    title: content.title || supabaseReport.product_name,
    choice: content.choice || 'Non spécifié',
    slug: content.slug || slug,
  };

  const url = `${siteUrl}/report/${slug}`;

  return {
    title: report.title,
    description: `Découvrez le choix de la communauté Reddit : ${report.choice.substring(0, 150)}...`,
    openGraph: {
      title: report.title,
      description: report.choice.substring(0, 200),
      url,
      siteName: 'TruthMiner',
      type: 'article',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: report.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: report.choice.substring(0, 200),
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;
  const supabaseReport = await getReportBySlug(slug);

  if (!supabaseReport) {
    notFound();
  }

  // Extraire le contenu du rapport depuis Supabase
  const content = typeof supabaseReport.content === 'object'
    ? supabaseReport.content
    : JSON.parse(supabaseReport.content || '{}');

  // DEBUG : Vérifier que image_url arrive bien depuis Supabase
  console.log('DEBUG IMAGE:', supabaseReport.image_url);
  console.log('DEBUG supabaseReport complet:', JSON.stringify(supabaseReport, null, 2));
  
  // Formater le rapport dans le format attendu par le composant
  const report = {
    title: content.title || supabaseReport.product_name,
    slug: content.slug || slug,
    choice: content.choice || 'Non identifié',
    defects: Array.isArray(content.defects) ? content.defects : [],
    article: content.article || '',
    products: Array.isArray(content.products) ? content.products.filter((p: any): p is string => typeof p === 'string') : [],
    userProfiles: content.userProfiles || '',
    confidenceScore: supabaseReport.score,
    createdAt: supabaseReport.created_at,
    amazonSearchQuery: content.amazonSearchQuery || content.amazon_search_query,
    amazonRecommendationReason: content.amazonRecommendationReason || content.amazon_recommendation_reason,
    image_url: supabaseReport.image_url || null, // Utiliser directement image_url de Supabase
  };

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-gray-200 dark:border-slate-800">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium"
          >
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mt-4 mb-3">
            {report.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Image principale du produit */}
        <img 
          src={report.image_url || '/placeholder-truthminer.png'} 
          alt="" 
          className="w-full h-auto rounded-xl shadow-lg mb-8" 
        />

        <div className="space-y-8 md:space-y-10 animate-fade-in">
          {/* Score de confiance TruthMiner */}
          <section className="rounded-2xl bg-white/90 border border-gray-100 shadow-sm p-4 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-center gap-4">
              {(() => {
                const score = report.confidenceScore ?? 50;
                const label =
                  score >= 80
                    ? 'Confiance très forte'
                    : score >= 60
                    ? 'Confiance élevée'
                    : score >= 40
                    ? 'Confiance mitigée'
                    : 'Confiance faible';
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

          {/* Points forts / Points faibles en grille (Bento) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points forts (Choix de la communauté) */}
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

            {/* Points faibles / Défauts rédhibitoires */}
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

          {/* Article complet */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-3 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Analyse détaillée
            </h2>
            <div className="prose prose-lg max-w-none markdown-content">
              <ReactMarkdown>{report.article}</ReactMarkdown>
            </div>
          </section>

          {/* Est-ce fait pour vous ? */}
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

          {/* Liens d'affiliation */}
          {(report.amazonSearchQuery || (report.products && report.products.length > 0)) && (
            <section className="rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-5 dark:bg-slate-900/80 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                Vérifier les prix
              </h2>
              <div className="space-y-3">
                {/* Afficher un seul bouton avec la requête optimisée si disponible */}
                {report.amazonSearchQuery ? (
                  <AffiliateLink
                    amazonSearchQuery={report.amazonSearchQuery}
                    recommendationReason={report.amazonRecommendationReason}
                  />
                ) : (
                  // Fallback : afficher les produits si amazonSearchQuery n'est pas disponible
                  (Array.from(new Set(report.products)) as string[]).map((product: string, index: number) => (
                    <div key={index}>
                      <AffiliateLink productName={product} />
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Verdict TruthMiner */}
          <section className="rounded-3xl bg-gray-50 border border-gray-200 shadow-sm p-6 md:p-7 animate-fade-in-delay-6 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-900 text-gray-50 uppercase tracking-[0.16em]">
                  Verdict TruthMiner
                </span>
              </div>
              <span className="text-xs text-gray-500">
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

          {/* Partage social */}
          <ShareButtons 
            title={report.title} 
            slug={report.slug} 
            score={report.confidenceScore}
          />

          {/* Analyses Similaires */}
          <SimilarReports 
            currentSlug={report.slug}
            currentCategory={content.category}
          />

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              Article généré par TruthMiner • Basé sur l'analyse des discussions Reddit
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


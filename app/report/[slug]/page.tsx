export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getReportBySlug } from '@/lib/supabase/client';
import AffiliateLink from '@/components/AffiliateLink';
import ShareButtons from '@/components/ShareButtons';
import ReactMarkdown from 'react-markdown';
import Navbar from '@/components/Navbar';
import SimilarReports from '@/components/SimilarReports';
import ImageCard from '@/components/ImageCard';
import ReportFreshnessChecker from '@/components/ReportFreshnessChecker';
import Newsletter from '@/components/Newsletter';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const supabaseReport = await getReportBySlug(slug);

    if (!supabaseReport) {
      // Retourner des métadonnées par défaut si le rapport n'est pas trouvé
      return {
        title: 'Rapport introuvable',
        description: 'Le rapport demandé n\'a pas été trouvé.',
        openGraph: {
          title: 'Rapport introuvable',
          description: 'Le rapport demandé n\'a pas été trouvé.',
          images: [
            {
              // Image de secours : chemin RELATIF, résolu via metadataBase
              url: '/og-image.png',
              width: 1200,
              height: 630,
              type: 'image/png',
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Rapport introuvable',
          description: 'Le rapport demandé n\'a pas été trouvé.',
          images: ['/og-image.png'],
        },
      };
    }

    let content = {};
    try {
      content = typeof supabaseReport.content === 'object'
        ? supabaseReport.content
        : JSON.parse(supabaseReport.content || '{}');
    } catch (e) {
      // Si le parsing échoue, utiliser un objet vide
      content = {};
    }

    // Extraire le title et summary depuis le contenu
    const reportTitle = (content as any).title || supabaseReport.product_name || 'Rapport';
    const reportSummary = (content as any).summary || (content as any).choice || 'Découvrez l\'analyse complète sur TruthMiner';
    const reportSlug = (content as any).slug || slug;
    
    // PRIORITÉ EXCLUSIVE : Utiliser url_image si elle existe (colonne manuelle, URL en ligne valide)
    // Sinon, fallback vers /og-image.png (image par défaut, chemin relatif)
    // On laisse Next.js transformer les chemins relatifs en URLs absolues via metadataBase.
    let imagePath = supabaseReport.url_image?.trim() || '/og-image.png';

    // Forcer HTTPS si l'URL commence par http:// (cas des URLs complètes)
    if (imagePath.startsWith('http://')) {
      imagePath = imagePath.replace('http://', 'https://');
    }

    // Nettoyer un éventuel slash final inutile
    if (imagePath.length > 1 && imagePath.endsWith('/')) {
      imagePath = imagePath.slice(0, -1);
    }

    // DEBUG TECHNIQUE : log temporaire pour vérifier l'URL réellement envoyée à Facebook/Twitter
    console.log('OG Image URL:', imagePath);
    
    const url = `${siteUrl}/report/${reportSlug}`;
    
    // Description optimisée pour SEO (150-160 caractères)
    const seoDescription = reportSummary.length > 150 
      ? `${reportSummary.substring(0, 147)}...`
      : reportSummary;
    
    // Description pour OG (200 caractères max)
    const ogDescription = reportSummary.length > 200
      ? `${reportSummary.substring(0, 197)}...`
      : reportSummary;

    return {
      title: reportTitle,
      description: seoDescription,
      openGraph: {
        title: reportTitle,
        description: ogDescription,
        url,
        siteName: 'TruthMiner',
        type: 'article',
        images: [
          {
            // IMPORTANT :
            // - Si imagePath commence par '/', Next.js utilisera metadataBase pour en faire une URL absolue.
            // - Si imagePath est déjà une URL complète (https://...), elle sera utilisée telle quelle.
            url: imagePath,
            width: 1200, // Explicitement défini pour Facebook
            height: 630, // Explicitement défini pour Facebook
            alt: reportTitle,
            type: 'image/png', // Type explicite pour Facebook
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: reportTitle,
        description: ogDescription,
        // Même logique que pour OpenGraph : chemin relatif ou URL complète
        images: [imagePath],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Erreur:', error);
    // Retourner des métadonnées par défaut en cas d'erreur
    return {
      title: 'Rapport introuvable',
      description: 'Une erreur est survenue lors du chargement du rapport.',
      openGraph: {
        title: 'Rapport introuvable',
        description: 'Une erreur est survenue lors du chargement du rapport.',
        images: [
          {
            // Image de secours : chemin RELATIF, résolu via metadataBase
            url: '/og-image.png',
            width: 1200,
            height: 630,
            type: 'image/png',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Rapport introuvable',
        description: 'Une erreur est survenue lors du chargement du rapport.',
        images: ['/og-image.png'],
      },
    };
  }
}

export default async function ReportPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    const supabaseReport = await getReportBySlug(slug);

    if (!supabaseReport) {
      notFound();
    }

    // Sécuriser l'extraction du contenu JSON
    let content: any = {};
    try {
      content = typeof supabaseReport.content === 'object'
        ? supabaseReport.content
        : JSON.parse(supabaseReport.content || '{}');
    } catch (parseError) {
      // Si le parsing échoue, utiliser un objet vide avec les valeurs de base
      content = {
        title: supabaseReport.product_name,
        choice: 'Contenu non disponible',
        article: '',
      };
    }

    // Formater le rapport avec des valeurs par défaut sécurisées
    const report = {
      id: supabaseReport.id,
      title: content.title || supabaseReport.product_name || 'Rapport',
      slug: content.slug || slug,
      choice: content.choice || 'Non identifié',
      defects: Array.isArray(content.defects) ? content.defects : [],
      article: content.article || '',
      products: Array.isArray(content.products)
        ? content.products.filter((p: any): p is string => typeof p === 'string')
        : [],
      userProfiles: content.userProfiles || '',
      confidenceScore: supabaseReport.score || 50,
      createdAt: supabaseReport.created_at || new Date().toISOString(),
      updatedAt: supabaseReport.updated_at || supabaseReport.created_at || new Date().toISOString(),
      amazonSearchQuery: content.amazonSearchQuery || content.amazon_search_query || null,
      amazonRecommendationReason:
        content.amazonRecommendationReason || content.amazon_recommendation_reason || null,
      image_url: supabaseReport.image_url || null, // Utiliser uniquement image_url de Supabase
      productName: supabaseReport.product_name || null,
    };

    return (
      <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
        <Navbar />
        {/* Vérification automatique de fraîcheur (30 jours) */}
        <ReportFreshnessChecker reportId={report.id} updatedAt={report.updatedAt} />
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

          {/* Image principale du produit - Utiliser ImageCard pour le fallback automatique */}
          <div className="mb-6">
            <ImageCard
              imageUrl={report.image_url || undefined}
              title={report.title}
              height="h-64 md:h-96"
              className="rounded-lg"
            />
          </div>

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

            {/* Points forts / Points faibles en grille */}
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
            {report.article && report.article.trim().length > 0 && (
              <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-3 dark:bg-slate-900/90 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Analyse détaillée
                </h2>
                <div className="prose prose-lg max-w-none markdown-content">
                  <ReactMarkdown>{report.article}</ReactMarkdown>
                </div>
              </section>
            )}

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

            {/* Lien d'affiliation Amazon (bouton unique, avec fallback) */}
            {(report.amazonSearchQuery || report.productName) && (
              <section className="rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-5 dark:bg-slate-900/80 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
                  Vérifier les prix
                </h2>
                <div className="space-y-3 flex flex-col items-center">
                  {/* Image produit spécifique (si disponible) au-dessus du bouton */}
                  {report.image_url && (
                    <img
                      src={report.image_url}
                      alt={report.title}
                      className="mb-3 max-h-52 w-auto rounded-xl object-contain shadow-sm"
                      loading="lazy"
                    />
                  )}
                  <AffiliateLink
                    amazonSearchQuery={
                      report.amazonSearchQuery || report.productName || undefined
                    }
                    recommendationReason={report.amazonRecommendationReason || undefined}
                    className="w-full sm:w-auto"
                  />
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
              currentCategory={content.category || undefined}
            />

            {/* Newsletter / capture email */}
            <Newsletter className="mt-4" />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    // En cas d'erreur, rediriger vers 404
    console.error('[ReportPage] Erreur lors du chargement du rapport:', error);
    notFound();
  }
}

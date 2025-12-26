export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getReportBySlug } from '@/lib/supabase/client';
import ReportDisplay from '@/components/ReportDisplay';
import ReportFreshnessChecker from '@/components/ReportFreshnessChecker';

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

    // Extraire le title et summary depuis le contenu (sécurisation pour éviter erreurs)
    const reportTitle = typeof (content as any).title === 'string' 
      ? (content as any).title 
      : supabaseReport.product_name || 'Rapport';
    
    // S'assurer que reportSummary est toujours une string
    const rawSummary = (content as any).summary || (content as any).choice || (content as any).consensus || '';
    const reportSummary = typeof rawSummary === 'string' 
      ? rawSummary 
      : (typeof rawSummary === 'object' ? JSON.stringify(rawSummary) : String(rawSummary)) || 'Découvrez l\'analyse complète sur TruthMiner';
    
    const reportSlug = typeof (content as any).slug === 'string'
      ? (content as any).slug
      : slug;
    
    // PRIORITÉ :
    // 1) url_image (colonne manuelle, URL en ligne valide si présente)
    // 2) image_url (URL générée automatiquement pour le produit)
    // 3) /og-image.png (image par défaut, chemin relatif)
    //
    // On laisse Next.js transformer les chemins relatifs en URLs absolues via metadataBase.
    let rawImage =
      (supabaseReport.url_image && supabaseReport.url_image.trim()) ||
      (supabaseReport.image_url && supabaseReport.image_url.trim()) ||
      '/og-image.png';

    // Forcer HTTPS si l'URL commence par http:// (cas des URLs complètes)
    if (rawImage.startsWith('http://')) {
      rawImage = rawImage.replace('http://', 'https://');
    }

    // Nettoyer un éventuel slash final inutile (sauf si c'est juste "/")
    if (rawImage.length > 1 && rawImage.endsWith('/')) {
      rawImage = rawImage.slice(0, -1);
    }

    // DEBUG TECHNIQUE (non sensible) : log temporaire pour vérifier l'URL réellement envoyée à Facebook/Twitter
    console.log('[SEO] OG Image URL générée pour le rapport:', rawImage);
    
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
            url: rawImage,
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
        images: [rawImage],
      },
      alternates: {
        canonical: url, // URL canonique absolue pour éviter le contenu dupliqué (Google)
        // S'assurer que l'URL canonique est toujours absolue et HTTPS
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
      // PRIORITÉ : url_image (colonne manuelle) > image_url
      url_image: supabaseReport.url_image || null,
      image_url: supabaseReport.url_image || supabaseReport.image_url || null,
      productName: supabaseReport.product_name || null,
      // Nouveaux champs JSON structurés (alignement avec le nouveau format)
      consensus: content.consensus || content.choice || null,
      pros: Array.isArray(content.pros) ? content.pros : [],
      cons: Array.isArray(content.cons) ? content.cons : (Array.isArray(content.defects) ? content.defects : []),
            deep_analysis: content.deep_analysis || null,
            reddit_quotes: Array.isArray(content.reddit_quotes) ? content.reddit_quotes : [],
            debate_summary: content.debate_summary || null,
            controversy_index: typeof content.controversy_index === 'number' ? content.controversy_index : null,
            punchline: content.punchline || null,
            final_verdict: content.final_verdict || null,
            target_audience: content.target_audience || null,
            recommendations: Array.isArray(content.recommendations) ? content.recommendations : [],
          };

    return (
      <>
        {/* Vérification automatique de fraîcheur (30 jours) */}
        <ReportFreshnessChecker reportId={report.id} updatedAt={report.updatedAt} />
        <ReportDisplay report={report} />
      </>
    );
  } catch (error) {
    // En cas d'erreur, rediriger vers 404
    console.error('[ReportPage] Erreur lors du chargement du rapport:', error);
    notFound();
  }
}

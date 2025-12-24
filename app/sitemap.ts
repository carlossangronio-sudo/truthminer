import type { MetadataRoute } from 'next';
import { getAllReports } from '@/lib/supabase/client';

// Forcer la génération dynamique à chaque requête (pas de cache)
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/explore`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Récupérer tous les rapports indexables depuis Supabase
    const reports = await getAllReports();

    for (const report of reports) {
      let slug: string | undefined;

      try {
        const content =
          typeof report.content === 'object'
            ? report.content
            : JSON.parse(report.content || '{}');

        slug = content.slug;

        // Fallback : générer un slug à partir du product_name si besoin
        if (!slug && report.product_name) {
          slug = report.product_name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
      } catch {
        // En cas d'erreur de parsing, on ignore simplement ce rapport pour le sitemap
        continue;
      }

      if (!slug) continue;

      urls.push({
        url: `${siteUrl}/report/${slug}`,
        lastModified: report.created_at,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('[Sitemap] Erreur lors de la récupération des rapports Supabase:', error);
  }

  return urls;
}

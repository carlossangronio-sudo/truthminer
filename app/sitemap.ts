import { MetadataRoute } from 'next';
import { getAllReports } from '@/lib/supabase/client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Récupérer tous les rapports depuis Supabase
    const reports = await getAllReports();
    
    // Créer une entrée sitemap pour chaque rapport
    const reportPages: MetadataRoute.Sitemap = reports.map((report) => {
      const content = typeof report.content === 'object' 
        ? report.content 
        : JSON.parse(report.content || '{}');
      
      const slug = content.slug || report.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      return {
        url: `${siteUrl}/report/${slug}`,
        lastModified: new Date(report.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

    return [...staticPages, ...reportPages];
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    // En cas d'erreur, retourner au moins les pages statiques
    return staticPages;
  }
}


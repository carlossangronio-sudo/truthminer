import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ReportsStorage } from '@/lib/storage/reports';
import AffiliateLink from '@/components/AffiliateLink';
import ShareButtons from '@/components/ShareButtons';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const storage = new ReportsStorage();
  const report = await storage.getReportBySlug(slug);

  if (!report) {
    return {
      title: 'Rapport introuvable',
    };
  }

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
  const storage = new ReportsStorage();
  const report = await storage.getReportBySlug(slug);

  if (!report) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">
            {report.title}
          </h1>
          <p className="text-gray-500 text-sm">
            Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Choix de la communauté */}
        <section className="mb-12 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏆 Choix de la communauté
          </h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            {report.choice}
          </p>
        </section>

        {/* Défauts rédhibitoires */}
        {report.defects && report.defects.length > 0 && (
          <section className="mb-12 bg-red-50 rounded-xl p-6 border-l-4 border-red-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⚠️ Défauts rédhibitoires
            </h2>
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
        <section className="mb-12">
          <div className="prose prose-lg max-w-none markdown-content">
            <ReactMarkdown>{report.article}</ReactMarkdown>
          </div>
        </section>

        {/* Est-ce fait pour vous ? */}
        {report.userProfiles && report.userProfiles.trim().length > 0 && (
          <section className="mb-12 bg-green-50 rounded-xl p-6 border-l-4 border-green-600">
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
          <section className="mb-12 bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vérifier les prix
            </h2>
            <div className="space-y-3">
              {report.products.map((product, index) => (
                <div key={index}>
                  <AffiliateLink productName={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Partage social */}
        <ShareButtons title={report.title} slug={report.slug} />

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Article généré par TruthMiner • Basé sur l'analyse des discussions Reddit
          </p>
        </div>
      </div>
    </main>
  );
}


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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium"
          >
            ← Retour à l'accueil
          </a>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-3">
            {report.title}
          </h1>
          <p className="text-sm text-gray-500">
            Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="space-y-8">
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
                {report.products.map((product, index) => (
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

          {/* Partage social */}
          <ShareButtons title={report.title} slug={report.slug} />

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Article généré par TruthMiner • Basé sur l'analyse des discussions Reddit
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


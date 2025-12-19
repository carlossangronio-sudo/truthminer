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
    <main className="min-h-screen bg-[#f9f9fb]">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 max-w-4xl">
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

        <div className="space-y-8 md:space-y-10 animate-fade-in">
          {/* Points forts / Points faibles en grille (Bento) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points forts (Choix de la communauté) */}
            <section className="rounded-3xl bg-white border border-emerald-100 shadow-[0_18px_50px_rgba(16,185,129,0.08)] p-6 md:p-8 animate-fade-in-delay-1">
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
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                    Points forts (Choix de la communauté)
                  </h2>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Ce que la communauté Reddit apprécie vraiment
                  </p>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                {report.choice}
              </p>
            </section>

            {/* Points faibles / Défauts rédhibitoires */}
            {report.defects && report.defects.length > 0 && (
              <section className="rounded-3xl bg-white border border-red-100 shadow-[0_18px_50px_rgba(248,113,113,0.08)] p-6 md:p-8 animate-fade-in-delay-2">
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
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                      Points faibles (Défauts rédhibitoires)
                    </h2>
                    <p className="text-xs text-red-700 mt-0.5">
                      Ce que le marketing ne vous dit pas
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {report.defects.map((defect, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 mr-3" />
                      <span className="text-sm md:text-base text-gray-800 leading-relaxed">
                        {defect}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Article complet */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analyse détaillée
            </h2>
            <div className="prose prose-lg max-w-none markdown-content">
              <ReactMarkdown>{report.article}</ReactMarkdown>
            </div>
          </section>

          {/* Est-ce fait pour vous ? */}
          {report.userProfiles && report.userProfiles.trim().length > 0 && (
            <section className="rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-md p-6 md:p-8 animate-fade-in-delay-4">
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
            <section className="rounded-2xl bg-gray-50 border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in-delay-5">
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

          {/* Verdict TruthMiner */}
          <section className="rounded-3xl bg-gray-50 border border-gray-200 shadow-sm p-6 md:p-7 animate-fade-in-delay-6">
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
            <p className="text-sm md:text-base text-gray-800 leading-relaxed font-semibold">
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


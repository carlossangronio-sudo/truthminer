'use client';

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface RecentReport {
  id: string;
  title: string;
  slug: string | null;
  score: number;
  url_image?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  product_name?: string;
  productName?: string;
}

interface RecentReportsGridProps {
  reports: RecentReport[];
}

/**
 * Grille des rapports récents avec style cyber/neural
 * Affiche impérativement url_image si disponible
 */
export default function RecentReportsGrid({ reports }: RecentReportsGridProps) {
  if (!reports || reports.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
            Archives <span className="text-cyan-400">Neural</span>
          </h2>
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Dernières analyses décodées
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => {
            // PRIORITÉ : url_image (colonne manuelle) > image_url > imageUrl
            const imageUrl = report.url_image || report.image_url || report.imageUrl || null;
            const slug = report.slug || report.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || report.id;
            const title = report.title || report.product_name || report.productName || 'Rapport';

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/report/${slug}`}
                  className="group relative block bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                {/* Image */}
                {imageUrl ? (
                  <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
                    <div className="text-4xl">📊</div>
                  </div>
                )}

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                      <span className="text-cyan-400 text-xs font-black uppercase tracking-wider">
                        {report.score}% confiance
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
                    <span>Analyse complète</span>
                    <span className="text-cyan-500">→</span>
                  </div>
                </div>
              </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


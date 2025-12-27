'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="group relative glass-card overflow-hidden flex flex-col hover:bg-white/40 transition-all border border-white/60"
            >
              {/* Image */}
              {imageUrl ? (
                <div className="h-48 w-full relative overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-blue-500/20 to-indigo-300/20 flex items-center justify-center">
                  <div className="text-4xl">📊</div>
                </div>
              )}

              {/* Contenu */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black uppercase italic text-slate-900 mb-2 leading-tight line-clamp-2">{title}</h4>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50">
                  <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group/btn">
                    Consulter <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ImageCard from './ImageCard';

type ArticleCardProps = {
  id: string;
  title: string;
  slug: string;
  score: number;
  choice: string;
  createdAt: string;
  category?: string;
  imageUrl?: string;
  // Pour le fallback : si imageUrl est vide, on cherche avec ces termes
  searchTerms?: string[];
};

function getConfidenceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  if (score >= 60) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  if (score >= 40) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
}

export default function ArticleCard({
  title,
  slug,
  score,
  choice,
  createdAt,
  category,
  imageUrl: initialImageUrl,
  searchTerms = [],
}: ArticleCardProps) {
  // ⚠️ RECHERCHE D'IMAGE DÉSACTIVÉE : Les images sont maintenant gérées uniquement dans generate-report
  // pour éviter la fuite de crédits API. Les images doivent être fournies via imageUrl depuis Supabase.
  const [imageUrl] = useState<string | null | undefined>(initialImageUrl);

  return (
    <Link
      href={`/report/${slug}`}
      className="group relative glass-card overflow-hidden flex flex-col hover:bg-white/40 transition-all border border-white/60"
    >
      {/* Image */}
      <div className="h-48 w-full relative overflow-hidden">
        <ImageCard
          imageUrl={imageUrl}
          title={title}
          height="h-full"
          className="group-hover:scale-110 transition-transform duration-700"
        />
        {category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600">{category}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xl font-black uppercase italic text-slate-900 mb-2 leading-tight line-clamp-2">{title}</h4>
          <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6">{choice || 'Analyse basée sur les discussions Reddit.'}</p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50">
          <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group/btn">
            Consulter <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </Link>
  );
}


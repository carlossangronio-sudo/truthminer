'use client';

import { ShieldCheck } from 'lucide-react';

interface TrustScoreProps {
  score: number;
  count: number;
  className?: string;
}

/**
 * Composant d'affichage du score de confiance avec style cyber/neural
 */
export const TrustScore = ({ score, count, className = '' }: TrustScoreProps) => {
  // Validation des props
  const validScore = Math.max(0, Math.min(100, score));
  const validCount = Math.max(0, count);

  return (
    <div className={`flex items-center gap-6 bg-cyan-500/5 p-6 rounded-[2.5rem] border border-cyan-500/10 ${className}`}>
      <div className="text-center px-6 border-r border-white/10">
        <div className="text-5xl font-black text-cyan-400 leading-none">{validScore}%</div>
        <div className="text-[9px] font-black uppercase text-slate-500 mt-2 tracking-widest">Confiance</div>
      </div>
      <div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {validCount} signaux analysés
        </div>
        <div className="flex items-center gap-1 mt-1 text-cyan-500/60 uppercase text-[8px] font-bold">
          <ShieldCheck size={12} /> Vérifié par Neural Core
        </div>
      </div>
    </div>
  );
};


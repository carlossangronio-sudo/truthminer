'use client';

import { Zap } from 'lucide-react';

interface IABadgeProps {
  text: string;
  className?: string;
}

/**
 * Badge IA avec style cyber/neural
 */
export const IABadge = ({ text, className = '' }: IABadgeProps) => (
  <div
    className={`inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_0_15px_rgba(34,211,238,0.1)] ${className}`}
  >
    <Zap size={14} className="fill-cyan-400" /> {text}
  </div>
);


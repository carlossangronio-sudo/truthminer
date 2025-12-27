'use client';

import { Cpu } from 'lucide-react';
import Link from 'next/link';

interface ScannerLogoProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Logo TruthMiner avec style cyber/neural
 */
export const ScannerLogo = ({ onClick, className = '' }: ScannerLogoProps) => {
  const content = (
    <div
      className={`flex items-center gap-3 group cursor-pointer ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="TruthMiner - Accueil"
    >
      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-all">
        T
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900 uppercase italic">
        Truth<span className="text-blue-600">Miner</span>
      </span>
    </div>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link href="/" aria-label="TruthMiner - Accueil">
      {content}
    </Link>
  );
};


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
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform">
        <Cpu size={22} />
      </div>
      <span className="text-xl font-black uppercase tracking-tighter italic text-white">
        Truth<span className="text-cyan-400">Miner</span>
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


'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScannerLogo } from './ScannerLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Gestion du style de la navigation au scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/40 backdrop-blur-2xl border-b border-white/50 py-3 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <ScannerLogo />
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/explore"
            className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
            aria-label="Voir toutes les analyses"
          >
            Analyses
          </Link>
        </div>
      </div>
    </nav>
  );
}



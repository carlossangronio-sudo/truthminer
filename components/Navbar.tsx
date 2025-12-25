'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { ScannerLogo } from './ScannerLogo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <ScannerLogo />
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:gap-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Voir toutes les analyses"
          >
            {/* Icône livre SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {/* Texte "Analyses" - toujours visible, taille adaptative */}
            <span className="whitespace-nowrap">Analyses</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}



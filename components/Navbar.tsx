'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-50">
            TruthMiner
          </span>
          <span className="hidden text-xs text-gray-500 md:inline dark:text-gray-400">
            L&apos;IA qui n&apos;a pas sa langue dans sa poche.
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="hidden sm:inline">Bibliothèque</span>
            <span className="sm:hidden">📚</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}



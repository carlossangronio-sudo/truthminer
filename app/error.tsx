'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur application:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 flex flex-col items-center justify-center">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Oups, une erreur est survenue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {error.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-50 font-semibold transition-colors text-center"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}









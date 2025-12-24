import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Navigation principale - Centrée et épurée */}
        <div className="flex flex-col items-center space-y-6">
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Toutes les Analyses
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              À propos
            </Link>
            <Link
              href="/mentions-legales"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Mentions Légales
            </Link>
          </nav>

          {/* Note Amazon */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-2xl">
            En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} TruthMiner. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Search, Users, ShoppingBag, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez TruthMiner et notre mission de transparence.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-gray-200 dark:border-slate-800">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            Bienvenue sur TruthMiner — La vérité brute de Reddit sur les produits, l&apos;actualité et les tendances de société.
          </h1>
        </div>

        {/* Contenu principal */}
        <div className="space-y-8">
          {/* Section 1 : Notre Mission */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Notre Mission
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  TruthMiner utilise l&apos;IA pour filtrer le bruit et extraire la synthèse des discussions Reddit sur les produits, l&apos;actualité et les tendances de société.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 : Comment ça marche ? */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Comment ça marche ?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Nous utilisons une technologie d&apos;intelligence artificielle avancée pour :
                </p>
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    </span>
                    <span className="leading-relaxed">
                      <strong className="text-gray-900 dark:text-gray-50">Écouter la communauté :</strong> Nous scannons les discussions authentiques sur Reddit pour identifier les problèmes récurrents et les points forts méconnus.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    </span>
                    <span className="leading-relaxed">
                      <strong className="text-gray-900 dark:text-gray-50">Synthétiser l&apos;essentiel :</strong> Au lieu de lire des centaines de commentaires, nous vous offrons un rapport structuré : verdict, points positifs, points négatifs et alternatives.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    </span>
                    <span className="leading-relaxed">
                      <strong className="text-gray-900 dark:text-gray-50">Rester Impartial :</strong> Contrairement aux tests classiques, nous ne recevons pas de produits gratuits de la part des marques. Notre analyse est basée sur l&apos;expérience collective.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 : Transparence et Affiliation */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Transparence et Affiliation
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Pour maintenir ce service gratuit et sans publicité intrusive, TruthMiner participe au Programme Partenaires d&apos;Amazon. Cela signifie que si vous achetez un produit via l&apos;un de nos liens &apos;Vérifier le prix&apos;, nous percevons une petite commission sans aucun coût supplémentaire pour vous. Cela nous aide à financer les serveurs et les outils nécessaires à la génération de ces rapports.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/80 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                  Contact
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Pour toute demande de partenariat ou question, contactez-nous à l&apos;adresse :
                </p>
                <Link
                  href="mailto:contact@tminer.io"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contact@tminer.io
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Mention légale Amazon */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
          <div className="rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              <strong className="text-gray-900 dark:text-gray-100">Mention légale :</strong>{' '}
              En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}


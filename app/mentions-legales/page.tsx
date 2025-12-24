import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales de TruthMiner - Informations sur l\'éditeur, les données personnelles et les liens d\'affiliation Amazon.',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tminer.io';

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#f9f9fb] text-gray-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block font-medium dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50 mt-4 mb-3">
            Mentions légales
          </h1>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              1. Éditeur du site
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Le site <strong>{siteUrl}</strong> est édité par TruthMiner.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Directeur de la publication :</strong> TruthMiner
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Hébergement :</strong> Vercel Inc.
              <br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              2. Objet du site
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TruthMiner est un site d'analyse et de comparaison de produits basé sur l'analyse de discussions Reddit. 
              Le site utilise l'intelligence artificielle pour synthétiser les avis et opinions exprimés par la communauté Reddit 
              concernant divers produits et services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Les analyses présentées sont générées automatiquement à partir de sources publiques (Reddit) et reflètent 
              les opinions exprimées par les utilisateurs de cette plateforme. TruthMiner ne garantit pas l'exactitude, 
              la complétude ou l'actualité des informations présentées.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              3. Liens d'affiliation Amazon
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TruthMiner participe au Programme Partenaires Amazon EU, un programme d'affiliation conçu pour permettre 
              à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises.</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Les liens d'affiliation présents sur le site permettent à TruthMiner de percevoir une commission sur les ventes 
              réalisées via ces liens, sans surcoût pour l'utilisateur. Cette rémunération permet de financer le développement 
              et la maintenance du site.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              La présence de liens d'affiliation n'influence en aucun cas le contenu des analyses, qui sont générées 
              exclusivement à partir des discussions Reddit analysées par l'intelligence artificielle.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              4. Propriété intellectuelle
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              L'ensemble du contenu du site (textes, images, logos, graphismes, etc.) est la propriété de TruthMiner 
              ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, 
              quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de TruthMiner.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              5. Données personnelles
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
              vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Données collectées :</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-2">
              <li>Adresse email (uniquement si vous vous abonnez à la newsletter)</li>
              <li>Données de navigation anonymisées via Vercel Analytics</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Utilisation des données :</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-2">
              <li>Envoi de la newsletter (avec possibilité de désinscription à tout moment)</li>
              <li>Amélioration de l'expérience utilisateur et analyse du trafic</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Les données collectées ne sont en aucun cas vendues ou cédées à des tiers. Pour exercer vos droits, 
              vous pouvez nous contacter via les moyens disponibles sur le site.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Le site utilise des cookies techniques nécessaires au fonctionnement du site et des cookies analytiques 
              (via Vercel Analytics) pour analyser le trafic et améliorer l'expérience utilisateur.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              En continuant à naviguer sur le site, vous acceptez l'utilisation de ces cookies. 
              Vous pouvez désactiver les cookies via les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              7. Responsabilité
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TruthMiner s'efforce de fournir des informations aussi précises que possible. Toutefois, le site ne peut 
              être tenu responsable des erreurs, omissions ou résultats qui pourraient être obtenus par l'utilisation de ces informations.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Les analyses présentées sont basées sur des sources publiques (Reddit) et ne constituent pas des conseils 
              personnalisés. Il est recommandé de vérifier les informations auprès de sources officielles avant toute décision d'achat.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              TruthMiner ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation 
              des informations présentes sur le site.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              8. Liens externes
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Le site contient des liens vers des sites externes (notamment Amazon.fr). TruthMiner n'exerce aucun contrôle 
              sur ces sites et décline toute responsabilité quant à leur contenu, leur accessibilité ou leur politique de confidentialité.
            </p>
          </section>

          <section className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              9. Modification des mentions légales
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              TruthMiner se réserve le droit de modifier les présentes mentions légales à tout moment. 
              Il est recommandé de consulter régulièrement cette page pour prendre connaissance des éventuelles modifications.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}


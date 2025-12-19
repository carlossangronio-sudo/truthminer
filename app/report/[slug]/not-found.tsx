import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rapport introuvable</h1>
        <p className="text-gray-600 mb-8">
          Le rapport que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}



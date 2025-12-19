'use client';

interface LoaderProps {
  message?: string;
}

/**
 * Composant de chargement stylé
 */
export default function Loader({ message = 'Génération en cours...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-600 text-lg font-medium">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Cela peut prendre quelques instants...</p>
    </div>
  );
}



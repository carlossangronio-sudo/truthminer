'use client';

interface AffiliateLinkProps {
  productName?: string; // Nom du produit (fallback si amazonSearchQuery n'est pas fourni)
  amazonSearchQuery?: string; // Requête de recherche Amazon optimisée
  recommendationReason?: string; // Raison pour laquelle ce lien est proposé
  className?: string;
}

/**
 * Composant pour générer un lien d'affiliation Amazon avec explication
 */
export default function AffiliateLink({ 
  productName, 
  amazonSearchQuery,
  recommendationReason,
  className = '' 
}: AffiliateLinkProps) {
  // ID d'affiliation Amazon : tminer-21
  const affiliateId = 'tminer-21';
  
  // Priorité : amazonSearchQuery (modèle précis) > productName (nom général) > fallback
  // Cela garantit qu'Amazon propose toujours des produits, même si le modèle précis n'est pas trouvé
  const searchQuery = amazonSearchQuery || productName || 'produit';
  
  // Construction de l'URL Amazon simplifiée et sécurisée :
  // - Pas de filtres complexes (évite les "0 résultat")
  // - Requête encodée avec encodeURIComponent pour gérer accents/espaces
  // - Tag d'affiliation placé directement après k= pour qu'Amazon le lise avant toute redirection
  const amazonUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(searchQuery)}&tag=${affiliateId}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        Voir le meilleur choix sur Amazon
      </a>
      {recommendationReason && (
        <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
          {recommendationReason}
        </p>
      )}
    </div>
  );
}


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
        className={`inline-flex items-center justify-center px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black uppercase text-base tracking-[0.2em] rounded-2xl transition-all duration-200 shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_rgba(249,115,22,0.7)] border-2 border-orange-400/50 active:scale-95 ${className}`}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Vérifier le prix sur Amazon
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
      {recommendationReason && (
        <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">
          {recommendationReason}
        </p>
      )}
    </div>
  );
}


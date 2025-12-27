'use client';

import { ShoppingCart } from 'lucide-react';

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

  // Fonction pour déterminer le style du bouton selon l'URL
  const getButtonStyle = (url: string): { bgColor: string; text: string } => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) {
      return { bgColor: 'bg-[#FF9900]', text: 'Vérifier sur Amazon' };
    } else if (urlLower.includes('fnac')) {
      return { bgColor: 'bg-[#E1000F]', text: 'Voir sur Fnac' };
    }
    return { bgColor: 'bg-slate-900', text: "Voir l'offre" };
  };

  const buttonStyle = getButtonStyle(amazonUrl);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-transform hover:scale-105 ${buttonStyle.bgColor} shadow-lg shadow-black/10 ${className}`}
      >
        <ShoppingCart size={14} />
        {buttonStyle.text}
      </a>
      {recommendationReason && (
        <p className="text-xs text-slate-500 italic leading-relaxed">
          {recommendationReason}
        </p>
      )}
    </div>
  );
}


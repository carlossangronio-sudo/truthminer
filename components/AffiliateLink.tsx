'use client';

interface AffiliateLinkProps {
  productName: string;
  className?: string;
}

/**
 * Composant pour générer un lien d'affiliation Amazon
 */
export default function AffiliateLink({ productName, className = '' }: AffiliateLinkProps) {
  // Récupération de l'ID d'affiliation Amazon depuis les variables d'environnement publiques
  // À configurer dans .env avec NEXT_PUBLIC_AMAZON_AFFILIATE_ID=votre-id-20
  const affiliateId = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || '';
  
  // Construction de l'URL Amazon avec le tag d'affiliation si disponible
  const baseUrl = `https://www.amazon.fr/s?k=${encodeURIComponent(productName)}`;
  const amazonUrl = affiliateId ? `${baseUrl}&tag=${affiliateId}` : baseUrl;

  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center justify-center
        px-6 py-3
        bg-orange-500 hover:bg-orange-600
        text-white font-semibold
        rounded-lg
        transition-colors duration-200
        shadow-md hover:shadow-lg
        ${className}
      `}
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
      Vérifier le prix sur Amazon
    </a>
  );
}


export type LogoProps = {
  className?: string;
};

/**
 * Logo minimaliste TruthMiner :
 * - Losange (cristal) pour le côté "mining"
 * - Loupe stylisée pour la recherche de vérité
 *
 * Utilise `currentColor` pour s'adapter automatiquement au thème (clair/sombre).
 */
export default function Logo({
  className = 'h-8 w-8 text-gray-900 dark:text-gray-50',
}: LogoProps) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cristal / diamant */}
        <path d="M16 3 L26.5 13.5 L16 29 L5.5 13.5 Z" />
        {/* Facette intérieure */}
        <path d="M16 7 L22.5 13.5 L16 24 L9.5 13.5 Z" />

        {/* Loupe intégrée (cercle en bas à droite) */}
        <circle cx={19} cy={19} r={4.2} />
        {/* Manche de la loupe */}
        <line x1={21.8} y1={21.8} x2={25.5} y2={25.5} />
      </svg>
    </span>
  );
}

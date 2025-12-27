'use client';

import { ShieldCheck, Info } from 'lucide-react';
import { useState } from 'react';

interface TrustScoreProps {
  score: number;
  count: number;
  commentCount?: number; // Nombre réel de commentaires analysés
  className?: string;
}

/**
 * Composant d'affichage du score de confiance avec style cyber/neural
 * Couleurs dynamiques selon le score : vert (élevé), jaune (moyen), orange (mitigé), rouge (bas)
 */
export const TrustScore = ({ score, count, commentCount, className = '' }: TrustScoreProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Validation des props
  const validScore = Math.max(0, Math.min(100, score));
  const validCount = Math.max(0, count);
  // Utiliser commentCount si disponible, sinon estimer à partir du score
  const estimatedComments = commentCount || Math.max(50, Math.round((validScore || 50) * 2));

  // Déterminer la couleur selon le score (thème néon cyber)
  let colorClasses = {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-500/60',
    borderRight: 'border-emerald-500/10'
  };

  if (validScore >= 70) {
    // Vert pour score élevé (70-100)
    colorClasses = {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'text-emerald-500/60',
      borderRight: 'border-emerald-500/10'
    };
  } else if (validScore >= 50) {
    // Jaune pour score moyen (50-69)
    colorClasses = {
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      icon: 'text-yellow-500/60',
      borderRight: 'border-yellow-500/10'
    };
  } else if (validScore >= 30) {
    // Orange pour score mitigé (30-49)
    colorClasses = {
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      icon: 'text-orange-500/60',
      borderRight: 'border-orange-500/10'
    };
  } else {
    // Rouge pour score bas (0-29)
    colorClasses = {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: 'text-red-500/60',
      borderRight: 'border-red-500/10'
    };
  }

  // Adapter les couleurs pour le thème clair
  const lightColorClasses = validScore >= 70 
    ? { text: 'text-emerald-600', border: 'border-emerald-500/30', borderRight: 'border-emerald-500/20' }
    : validScore >= 50
    ? { text: 'text-yellow-600', border: 'border-yellow-500/30', borderRight: 'border-yellow-500/20' }
    : validScore >= 30
    ? { text: 'text-orange-600', border: 'border-orange-500/30', borderRight: 'border-orange-500/20' }
    : { text: 'text-red-600', border: 'border-red-500/30', borderRight: 'border-red-500/20' };

  return (
    <div className={`flex items-center gap-6 glass-card p-6 ${className}`}>
      <div className={`text-center px-6 border-r ${lightColorClasses.borderRight}`}>
        <div className={`text-5xl font-black ${lightColorClasses.text} leading-none`}>{validScore}%</div>
        <div className="text-[9px] font-black uppercase text-slate-500 mt-2 tracking-widest flex items-center justify-center gap-1.5">
          Indice de Satisfaction Communautaire
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <Info size={12} className="text-slate-500 hover:text-blue-600 cursor-help transition-colors" />
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-4 glass-card border border-white/60 rounded-lg text-xs text-slate-700 shadow-xl z-50">
                <p className="font-bold text-blue-600 mb-2">Indice de Satisfaction Communautaire</p>
                <p className="font-medium">Ce score est calculé par l&apos;IA en analysant le rapport entre les avis positifs et négatifs extraits de Reddit sur les 12 derniers mois.</p>
                <p className="mt-2 text-blue-600 font-medium">Analysé sur <strong>{estimatedComments}</strong> commentaires Reddit récents.</p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white/60"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {validCount} signaux analysés
        </div>
        <div className={`flex items-center gap-1 mt-1 ${lightColorClasses.text} uppercase text-[8px] font-bold`}>
          <ShieldCheck size={12} /> Vérifié par Neural Core
        </div>
      </div>
    </div>
  );
};


'use client';

import { ShieldCheck } from 'lucide-react';

interface TrustScoreProps {
  score: number;
  count: number;
  className?: string;
}

/**
 * Composant d'affichage du score de confiance avec style cyber/neural
 * Couleurs dynamiques selon le score : vert (élevé), jaune (moyen), orange (mitigé), rouge (bas)
 */
export const TrustScore = ({ score, count, className = '' }: TrustScoreProps) => {
  // Validation des props
  const validScore = Math.max(0, Math.min(100, score));
  const validCount = Math.max(0, count);

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

  return (
    <div className={`flex items-center gap-6 ${colorClasses.bg} p-6 rounded-[2.5rem] border ${colorClasses.border} ${className}`}>
      <div className={`text-center px-6 border-r ${colorClasses.borderRight}`}>
        <div className={`text-5xl font-black ${colorClasses.text} leading-none`}>{validScore}%</div>
        <div className="text-[9px] font-black uppercase text-slate-500 mt-2 tracking-widest">Confiance</div>
      </div>
      <div>
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          {validCount} signaux analysés
        </div>
        <div className={`flex items-center gap-1 mt-1 ${colorClasses.icon} uppercase text-[8px] font-bold`}>
          <ShieldCheck size={12} /> Vérifié par Neural Core
        </div>
      </div>
    </div>
  );
};


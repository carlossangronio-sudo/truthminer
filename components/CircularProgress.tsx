'use client';

import { useState, useEffect, useRef } from 'react';

interface CircularProgressProps {
  isActive: boolean;
  completed?: boolean;
  onComplete?: () => void;
}

/**
 * Composant de progression circulaire avec pourcentage et messages dynamiques
 */
export default function CircularProgress({ isActive, completed = false, onComplete }: CircularProgressProps) {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const animatingRef = useRef(false);

  // Quand le rapport est terminé, passer à 100%
  useEffect(() => {
    if (completed && !completedRef.current && !animatingRef.current && progress < 100) {
      completedRef.current = true;
      animatingRef.current = true;
      
      // Si on est déjà à 95% ou plus, animer vers 100%
      if (progress >= 95) {
        const startProgress = progress;
        const duration = 500; // 500ms pour atteindre 100%
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const t = Math.min(elapsed / duration, 1);
          const newProgress = startProgress + (100 - startProgress) * t;
          setProgress(Math.round(newProgress));

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            animatingRef.current = false;
            if (onComplete) {
              setTimeout(onComplete, 300);
            }
          }
        };

        requestAnimationFrame(animate);
      } else {
        // Si on n'est pas encore à 95%, accélérer jusqu'à 95% puis passer à 100%
        const targetProgress = 95;
        const startProgress = progress;
        const duration = 300;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const t = Math.min(elapsed / duration, 1);
          const newProgress = startProgress + (targetProgress - startProgress) * t;
          setProgress(Math.round(newProgress));

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            // Une fois à 95%, passer immédiatement à 100%
            setProgress(100);
            animatingRef.current = false;
            if (onComplete) {
              setTimeout(onComplete, 300);
            }
          }
        };

        requestAnimationFrame(animate);
      }
    }
    
    // Réinitialiser quand completed redevient false
    if (!completed) {
      completedRef.current = false;
    }
  }, [completed, progress, onComplete]);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    let animationFrameId: number;
    let currentProgress = 0;
    const maxProgress = 95; // On s'arrête à 95% jusqu'à ce que le rapport soit prêt
    let lastTime = Date.now();

    const updateProgress = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Temps écoulé en secondes
      lastTime = now;

      if (currentProgress >= maxProgress) {
        return;
      }

      // Simulation intelligente avec timing basé sur le temps réel :
      // - 0-30% : rapide (phase de connexion) - ~2 secondes
      // - 30-80% : ralentit (phase d'analyse IA) - ~8 secondes
      // - 80-95% : très lent (phase de finalisation) - ~5 secondes
      let increment: number;
      if (currentProgress < 30) {
        increment = 15 * deltaTime; // Rapide au début
      } else if (currentProgress < 80) {
        increment = 6 * deltaTime; // Ralentit pendant l'analyse IA
      } else {
        increment = 2 * deltaTime; // Très lent à la fin
      }

      currentProgress = Math.min(currentProgress + increment, maxProgress);
      setProgress(Math.round(currentProgress));

      if (currentProgress < maxProgress) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    // Démarrer l'animation
    lastTime = Date.now();
    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  // Réinitialiser quand on devient inactif
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      completedRef.current = false;
      animatingRef.current = false;
    }
  }, [isActive]);

  // Calculer le message selon le pourcentage
  const getMessage = (): string => {
    if (progress < 20) return 'Connexion aux serveurs Reddit...';
    if (progress < 50) return 'Extraction des avis utilisateurs...';
    if (progress < 80) return "L'IA analyse les preuves...";
    return 'Finalisation de l\'article...';
  };

  // Calculer l'angle pour le cercle SVG (0-360 degrés)
  const circumference = 2 * Math.PI * 70; // rayon = 70
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Cercle de progression */}
      <div className="relative w-48 h-48 mb-6">
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 160 160"
        >
          {/* Cercle de fond */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-slate-800"
          />
          {/* Cercle de progression avec effet néon */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-blue-600 dark:text-blue-400 transition-all duration-100 ease-out"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.6))',
            }}
          />
          {/* Effet néon supplémentaire pour Dark Mode */}
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-blue-500 dark:text-blue-300 opacity-50 dark:opacity-70 transition-all duration-100 ease-out"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))',
            }}
          />
        </svg>
        {/* Pourcentage au centre avec effet néon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span 
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-blue-400 transition-all duration-300"
              style={{
                textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
              }}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Message dynamique */}
      <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2 text-center max-w-md">
        {getMessage()}
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
        Cela peut prendre quelques instants...
      </p>
    </div>
  );
}


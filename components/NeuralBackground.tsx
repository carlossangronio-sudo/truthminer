'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * Arrière-plan neural animé avec particules
 * Optimisé pour performance et gestion mémoire
 * @param intensity - Intensité de l'animation (0-1). Par défaut: 1.0 pour homepage, 0.25 pour pages d'analyse
 */
export const NeuralBackground = ({ intensity = 1.0 }: { intensity?: number } = {}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Détection de la visibilité pour optimiser les performances
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Détection mobile pour réduire le nombre de particules
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 60 : 120;

    // Couleurs fixes (ne s'adaptent plus au thème)
    const colors = ['#22d3ee', '#a855f7']; // Cyan et Purple
    
    // Capturer intensity dans la closure pour l'utiliser dans ParticleClass
    const currentIntensity = intensity;

    class ParticleClass {
      x: number = 0;
      y: number = 0;
      v: number = 0;
      s: number = 0;
      color: string = '';

      constructor() {
        this.init();
      }

      init() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.v = Math.random() * 0.4 + 0.15;
        this.s = Math.random() * 2.5 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.v;
        if (this.y < 0) {
          this.init();
        }
      }

      draw() {
        if (!ctx || !canvas) return;
        ctx.fillStyle = this.color;
        // Opacité fixe (ne s'adapte plus au thème), ajustée par l'intensité
        const baseOpacity = 0.4;
        ctx.globalAlpha = baseOpacity * currentIntensity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Réinitialiser les particules après resize
      particlesRef.current = Array.from({ length: particleCount }, () => new ParticleClass());
    };

    const setup = () => {
      resize();
      particlesRef.current = Array.from({ length: particleCount }, () => new ParticleClass());
    };

    const loop = () => {
      if (!canvas || !ctx || !isVisibleRef.current) {
        animationIdRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner les connexions entre particules proches
      const maxDistance = 150;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            ctx.strokeStyle = p1.color;
            // Opacité des connexions fixe (ne s'adapte plus au thème), ajustée par l'intensité
            const baseOpacity = 0.25;
            ctx.globalAlpha = (1 - distance / maxDistance) * baseOpacity * currentIntensity;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      // Dessiner les particules
      particlesRef.current.forEach((p) => {
        p.update();
        p.draw();
      });
      
      animationIdRef.current = requestAnimationFrame(loop);
    };

    // Throttle pour le resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    setup();
    loop();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      particlesRef.current = [];
    };
  }, [mounted, intensity]); // Re-démarrer l'animation quand l'intensité change

  // Fond fixe (ne s'adapte plus au thème)
  const bgColor = '#02010a';

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 transition-colors duration-300"
      style={{ 
        pointerEvents: 'none',
        backgroundColor: bgColor
      }}
      aria-hidden="true"
    />
  );
};


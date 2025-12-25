'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  v: number;
  s: number;
  color: string;
}

/**
 * Arrière-plan neural animé avec particules
 * Optimisé pour performance et gestion mémoire
 */
export const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Détection de la visibilité pour optimiser les performances
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Détection mobile pour réduire le nombre de particules
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80;

    class Particle {
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
        this.v = Math.random() * 0.3 + 0.1;
        this.s = Math.random() * 1.5;
        this.color = Math.random() > 0.5 ? '#22d3ee' : '#a855f7';
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
        ctx.globalAlpha = 0.15;
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
      particlesRef.current = Array.from({ length: particleCount }, () => new Particle());
    };

    const setup = () => {
      resize();
      particlesRef.current = Array.from({ length: particleCount }, () => new Particle());
    };

    const loop = () => {
      if (!canvas || !ctx || !isVisibleRef.current) {
        animationIdRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-[#02010a]"
      aria-hidden="true"
    />
  );
};


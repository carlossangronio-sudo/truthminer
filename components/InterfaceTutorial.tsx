'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  MousePointer2,
  CheckCircle2,
  Layers
} from 'lucide-react';

const InterfaceTutorial = () => {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const targetProduct = "iPhone 16 Pro";
  const sectionRef = React.useRef<HTMLDivElement>(null);

  // Détecter quand la section est visible dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Démarrer l'animation dès que la section est visible
          } else {
            // Optionnel : réinitialiser quand la section sort du viewport
            // setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.3, // Déclencher quand 30% de la section est visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Cycle de l'animation - ne démarre que si la section est visible
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setStep((prev) => (prev < 4 ? prev + 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, [isVisible]);

  // Effet de machine à écrire pour l'étape 1 - ne démarre que si visible
  useEffect(() => {
    if (step === 1 && isVisible) {
      setTypedText("");
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(targetProduct.slice(0, i));
        i++;
        if (i > targetProduct.length) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step, isVisible]);

  return (
    <div ref={sectionRef} className="w-full max-w-4xl mx-auto p-4 font-sans">
      <div className="relative glass-card-ultra overflow-hidden">
        
        {/* --- CONTENU DE L'ÉTAPE --- */}
        <div className="p-8 md:p-12 min-h-[450px] flex flex-col items-center justify-center relative z-10">
          
          {/* ÉTAPE 0 : INTRODUCTION */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <h2 className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 uppercase tracking-tighter mb-6 text-center leading-tight">
              Ne vous faites plus avoir
              <br />
              <span className="text-slate-900">par de faux avis</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-700 mb-8 text-center max-w-2xl font-medium">
              La vérité est cachée dans les discussions Reddit, pas dans les avis 5 étoiles.
            </p>
            <div className="flex gap-6 mt-4">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/30 glass-card">
                  <ShieldCheck className="text-red-600" size={32} />
                </div>
                <span className="text-xs uppercase font-black text-slate-600 tracking-widest">Avis Manipulés</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 glass-card">
                  <MessageSquare className="text-emerald-600" size={32} />
                </div>
                <span className="text-xs uppercase font-black text-slate-600 tracking-widest">Vérité Reddit</span>
              </div>
            </div>
          </div>

          {/* ÉTAPE 1 : LA RECHERCHE */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="bg-blue-500/10 p-4 rounded-full mb-6 glass-card">
              <Search className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-slate-900 mb-8 uppercase tracking-tighter">1. Nommez votre produit ou sujet</h2>
            <div className="w-full max-w-md relative">
              <div className="glass-card-ultra p-5 flex items-center gap-4">
                <span className="text-blue-500/50 font-mono">_</span>
                <span className="text-xl font-bold text-slate-900">{typedText}</span>
                <span className="w-0.5 h-6 bg-blue-500 animate-pulse"></span>
              </div>
              <MousePointer2 className="absolute -bottom-8 -right-4 text-blue-600 animate-bounce" size={30} />
            </div>
            <p className="mt-8 text-slate-600 text-sm font-medium">Entrez n'importe quel produit ou sujet d'actualité.</p>
          </div>

          {/* ÉTAPE 2 : LE MINAGE NEURAL */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="text-blue-600 animate-pulse" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-black italic text-slate-900 mb-4 uppercase tracking-tighter text-center">2. Extraction des avis Reddit</h2>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-lg text-[10px] text-blue-600 font-black uppercase text-center tracking-widest glass-card">Reddit Intel</div>
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-lg text-[10px] text-indigo-600 font-black uppercase text-center tracking-widest glass-card">Social Signals</div>
              <div className="bg-slate-500/10 border border-slate-500/20 p-2 rounded-lg text-[10px] text-slate-600 font-black uppercase text-center tracking-widest glass-card">Deep Web Scan</div>
              <div className="bg-slate-500/10 border border-slate-500/20 p-2 rounded-lg text-[10px] text-slate-600 font-black uppercase text-center tracking-widest glass-card">Bot Filter</div>
            </div>
            <p className="mt-8 text-slate-600 text-sm text-center font-medium">L'IA Truth Miner creuse là où le marketing s'arrête.</p>
          </div>

          {/* ÉTAPE 3 : LE RAPPORT DÉCRYPTÉ */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="bg-emerald-500/10 p-4 rounded-full mb-6 glass-card">
              <Zap className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-slate-900 mb-6 uppercase tracking-tighter">3. Rapport Décrypté</h2>
            <div className="w-full space-y-3">
              <div className="h-4 glass-card rounded-full w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500/60 w-[88%] animate-pulse rounded-full"></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-4 glass-card-ultra border-emerald-500/30">
                  <div className="h-2 bg-emerald-500/30 rounded mb-2 w-1/2"></div>
                  <div className="h-2 bg-emerald-500/20 rounded w-full"></div>
                </div>
                <div className="flex-1 p-4 glass-card-ultra border-red-500/30">
                  <div className="h-2 bg-red-500/30 rounded mb-2 w-1/2"></div>
                  <div className="h-2 bg-red-500/20 rounded w-full"></div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-slate-600 text-sm font-medium">Obtenez les points noirs cachés et le verdict final.</p>
          </div>

          {/* ÉTAPE 4 : CALL TO ACTION */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 uppercase tracking-tighter mb-4 text-center leading-tight">
              Verdict sans filtre
            </h2>
            <div className="flex gap-4 mt-6">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-blue-500/10 p-3 rounded-2xl glass-card border border-blue-500/30"><MessageSquare className="text-blue-600" size={24}/></div>
                <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Reddit Audio</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-indigo-500/10 p-3 rounded-2xl glass-card border border-indigo-500/30"><ShieldCheck className="text-indigo-600" size={24}/></div>
                <span className="text-[9px] uppercase font-black text-slate-600 tracking-widest">Pure Intel</span>
              </div>
            </div>
            <button className="mt-10 px-10 py-4 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-lg">
              Commencer à Miner
            </button>
          </div>

        </div>

        {/* --- BARRE DE PROGRESSION INFÉRIEURE --- */}
        <div className="flex border-t border-white/50">
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`flex-1 h-1.5 transition-all duration-300 ${i === step ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-transparent'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* --- LÉGENDES DES ÉTAPES --- */}
      <div className="grid grid-cols-5 gap-1 md:gap-2 mt-6 px-2">
        {["Intro", "Cible", "Mine", "Rapport", "Vérité"].map((text, i) => (
          <div key={i} className="text-center">
            <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-colors whitespace-nowrap ${i === step ? 'text-blue-600' : 'text-slate-500'}`}>
              {text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterfaceTutorial;

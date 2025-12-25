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
  const targetProduct = "iPhone 16 Pro";

  // Cycle de l'animation
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Effet de machine à écrire pour l'étape 0
  useEffect(() => {
    if (step === 0) {
      setTypedText("");
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(targetProduct.slice(0, i));
        i++;
        if (i > targetProduct.length) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 font-sans">
      <div className="relative bg-[#0a0525] border border-cyan-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cyan-500/10">
        
        {/* --- DÉCOR CYBER --- */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

        {/* --- CONTENU DE L'ÉTAPE --- */}
        <div className="p-8 md:p-12 min-h-[450px] flex flex-col items-center justify-center relative">
          
          {/* ÉTAPE 1 : LA RECHERCHE */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="bg-cyan-500/10 p-4 rounded-full mb-6">
              <Search className="text-cyan-400" size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-white mb-8 uppercase tracking-tighter">1. Nommez votre produit ou sujet</h2>
            <div className="w-full max-w-md relative">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-md">
                <span className="text-cyan-500/50 font-mono">_</span>
                <span className="text-xl font-bold text-white">{typedText}</span>
                <span className="w-0.5 h-6 bg-cyan-400 animate-pulse"></span>
              </div>
              <MousePointer2 className="absolute -bottom-8 -right-4 text-cyan-400 animate-bounce" size={30} />
            </div>
            <p className="mt-8 text-slate-500 text-sm font-medium">Entrez n'importe quel produit ou sujet d'actualité.</p>
          </div>

          {/* ÉTAPE 2 : LE MINAGE NEURAL */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="text-cyan-400 animate-pulse" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-black italic text-white mb-4 uppercase tracking-tighter text-center">2. Extraction des avis Reddit</h2>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              <div className="bg-cyan-500/5 border border-cyan-500/20 p-2 rounded-lg text-[10px] text-cyan-500 font-bold uppercase text-center tracking-widest">Reddit Intel</div>
              <div className="bg-purple-500/5 border border-purple-500/20 p-2 rounded-lg text-[10px] text-purple-500 font-bold uppercase text-center tracking-widest">Social Signals</div>
              <div className="bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Deep Web Scan</div>
              <div className="bg-white/5 border border-white/10 p-2 rounded-lg text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Bot Filter</div>
            </div>
            <p className="mt-8 text-slate-500 text-sm text-center">L'IA Truth Miner creuse là où le marketing s'arrête.</p>
          </div>

          {/* ÉTAPE 3 : LE RAPPORT DÉCRYPTÉ */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <div className="bg-green-500/10 p-4 rounded-full mb-6">
              <Zap className="text-green-400" size={32} />
            </div>
            <h2 className="text-2xl font-black italic text-white mb-6 uppercase tracking-tighter">3. Rapport Décrypté</h2>
            <div className="w-full space-y-3">
              <div className="h-4 bg-white/5 rounded-full w-full overflow-hidden relative">
                <div className="absolute inset-0 bg-green-500/40 w-[88%] animate-pulse"></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="h-2 bg-green-400/20 rounded mb-2 w-1/2"></div>
                  <div className="h-2 bg-green-400/10 rounded w-full"></div>
                </div>
                <div className="flex-1 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="h-2 bg-red-400/20 rounded mb-2 w-1/2"></div>
                  <div className="h-2 bg-red-400/10 rounded w-full"></div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-slate-500 text-sm">Obtenez les points noirs cachés et le verdict final.</p>
          </div>

          {/* ÉTAPE 4 : CALL TO ACTION */}
          <div className={`transition-all duration-700 flex flex-col items-center w-full ${step === 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
            <h2 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase tracking-tighter mb-4 text-center leading-tight">
              La Vérité est <br/> sous vos pieds.
            </h2>
            <div className="flex gap-4 mt-6">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-cyan-500/20 p-3 rounded-2xl"><MessageSquare className="text-cyan-400" size={24}/></div>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Reddit Audio</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-purple-500/20 p-3 rounded-2xl"><ShieldCheck className="text-purple-400" size={24}/></div>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Pure Intel</span>
              </div>
            </div>
            <button className="mt-10 px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              Commencer à Miner
            </button>
          </div>

        </div>

        {/* --- BARRE DE PROGRESSION INFÉRIEURE --- */}
        <div className="flex border-t border-white/5 bg-black/20">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`flex-1 h-1.5 transition-all duration-300 ${i === step ? 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]' : 'bg-transparent'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* --- LÉGENDES DES ÉTAPES --- */}
      <div className="grid grid-cols-4 gap-2 mt-6">
        {["Cible", "Extraction", "Synthèse", "Vérité"].map((text, i) => (
          <div key={i} className="text-center">
            <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${i === step ? 'text-cyan-400' : 'text-slate-600'}`}>
              {text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterfaceTutorial;

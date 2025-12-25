'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle,
  AlertTriangle, 
  Zap, 
  Quote, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Info
} from 'lucide-react';
import { NeuralBackground } from './NeuralBackground';
import { TrustScore } from './TrustScore';
import { ScannerLogo } from './ScannerLogo';
import AffiliateLink from './AffiliateLink';
import ShareButtons from './ShareButtons';
import SimilarReports from './SimilarReports';
import Newsletter from './Newsletter';

interface ReportDisplayProps {
  report: {
    id: string;
    title: string;
    slug: string;
    choice: string;
    defects: string[];
    article: string;
    products: string[];
    userProfiles?: string;
    createdAt: string;
    confidenceScore: number;
    amazonSearchQuery?: string | null;
    amazonRecommendationReason?: string | null;
    url_image?: string | null;
    image_url?: string | null;
    consensus?: string | null;
    pros?: string[];
    cons?: string[];
    punchline?: string | null;
    final_verdict?: string | null;
    deep_analysis?: string | null;
    reddit_quotes?: Array<{
      user: string;
      text: string;
      subreddit: string;
    }>;
    recommendations?: string[];
    target_audience?: {
      yes?: string;
      no?: string;
    };
  };
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  if (!report) return null;

  const { title, url_image, consensus, pros, cons, deep_analysis, reddit_quotes, target_audience, final_verdict, punchline, confidenceScore, amazonSearchQuery, amazonRecommendationReason, choice, article } = report;
  
  // Gestion de la rétro-compatibilité : on cherche le texte narratif ou le résumé
  const mainAnalysis = deep_analysis || consensus || choice || article || 'Analyse en cours...';
  
  // Compter les signaux analysés (approximation basée sur le score)
  const signalCount = Math.max(50, Math.round((confidenceScore || 50) * 10));
  
  // Construire le lien Amazon si disponible
  const amazonLink = amazonSearchQuery 
    ? `https://www.amazon.fr/s?k=${encodeURIComponent(amazonSearchQuery)}`
    : null;

  return (
    <main className="min-h-screen text-slate-100 font-sans bg-[#02010a] pb-20 relative overflow-hidden">
      <NeuralBackground />
      
      {/* Navigation / Logo */}
      <nav className="p-6 border-b border-white/5 bg-[#02010a]/60 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <ScannerLogo />
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 text-sm uppercase tracking-wider transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        
        {/* En-tête du Rapport */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-6">
            <Zap size={12} fill="currentColor" /> Analyse de Sentiment Réel
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-8 leading-tight">
            {title}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-t border-white/5 pt-8">
            <TrustScore 
              score={confidenceScore || 85} 
              count={signalCount} 
            />
            
            {punchline && (
              <div className="flex-1 max-w-md italic text-slate-400 text-lg border-l-2 border-purple-500 pl-6 py-2 bg-purple-500/5 rounded-r-xl">
                "{punchline}"
              </div>
            )}
          </div>
        </header>

        {/* Section Image et Résumé */}
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-4 aspect-square bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full opacity-50"></div>
            {url_image ? (
              <img 
                src={url_image} 
                alt={title}
                className="relative z-10 max-h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  (e.target as HTMLImageElement).src = '/placeholder-dark.png';
                }}
              />
            ) : (
              <div className="relative z-10 text-slate-500 text-sm">Image non disponible</div>
            )}
          </div>

          <div className="md:col-span-8 space-y-8">
            <div className="bg-[#0a0525]/80 border border-white/5 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-md">
              <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                <Info size={14} /> Analyse Narrative
              </h3>
              <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg italic">
                {/* On affiche l'analyse détaillée ou l'ancien résumé si pas encore migré */}
                {deep_analysis ? (
                  // Nouveau format : 3 paragraphes séparés
                  <div className="space-y-6">
                    {deep_analysis.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  // Ancien format : texte simple
                  <p className="whitespace-pre-line">{mainAnalysis}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signaux Alpha & Interférences (Affichés une seule fois) */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-[2.5rem] bg-cyan-500/[0.02] border border-cyan-500/20">
            <h3 className="flex items-center gap-3 text-cyan-400 font-black uppercase tracking-widest text-sm mb-8 italic">
              <CheckCircle size={18} /> Signaux Alpha
            </h3>
            <ul className="space-y-4">
              {(pros || []).map((pro, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_cyan]"></div>
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-purple-500/[0.02] border border-purple-500/20">
            <h3 className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm mb-8 italic">
              <XCircle size={18} /> Interférences
            </h3>
            <ul className="space-y-4">
              {(cons || []).map((con, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0 shadow-[0_0_8px_purple]"></div>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Preuves Reddit (Si disponibles dans le nouveau format) */}
        {reddit_quotes && reddit_quotes.length > 0 && (
          <div className="mb-16">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center">
              Extraits du Réseau Reddit
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {reddit_quotes.map((quote, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                  <Quote className="absolute -top-2 -left-2 text-white/5 group-hover:text-cyan-500/10 transition-colors" size={80} />
                  <p className="text-sm italic text-slate-300 relative z-10 mb-4 leading-relaxed">
                    "{quote.text}"
                  </p>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="text-cyan-500/60">{quote.user}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-md">{quote.subreddit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profils & Verdict */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2 bg-[#05011a] border border-white/5 p-10 rounded-[3rem]">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Users size={20} className="text-cyan-400" /> Profils Recommandés
            </h3>
            <div className="space-y-4">
              {target_audience ? (
                <>
                  {target_audience.yes && (
                    <div className="p-6 rounded-2xl bg-cyan-400/5 border border-cyan-400/20 flex justify-between items-center gap-4">
                      <p className="text-sm font-medium italic"><span className="text-cyan-400 font-black not-italic mr-2">POUR :</span> {target_audience.yes}</p>
                      <div className="px-4 py-1 bg-cyan-400 text-slate-950 text-[10px] font-black rounded-lg uppercase">OUI</div>
                    </div>
                  )}
                  {target_audience.no && (
                    <div className="p-6 rounded-2xl bg-purple-400/5 border border-purple-400/20 flex justify-between items-center gap-4">
                      <p className="text-sm font-medium italic"><span className="text-purple-400 font-black not-italic mr-2">CONTRE :</span> {target_audience.no}</p>
                      <div className="px-4 py-1 bg-purple-400 text-white text-[10px] font-black rounded-lg uppercase">NON</div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm italic">Informations de profil non disponibles.</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] rounded-[3rem]">
            <div className="bg-[#02010a] h-full w-full rounded-[3rem] p-10 flex flex-col justify-center text-center">
              <h3 className="text-lg font-black uppercase tracking-widest mb-4 italic">Verdict Final</h3>
              <p className="text-sm text-slate-300 italic mb-8 leading-relaxed">
                {final_verdict || "Consultez l'analyse complète ci-dessus."}
              </p>
              {amazonSearchQuery ? (
                <AffiliateLink
                  amazonSearchQuery={amazonSearchQuery}
                  recommendationReason={amazonRecommendationReason || 'Recommandation issue de la communauté Reddit'}
                />
              ) : (
                <a 
                  href={amazonLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-slate-950 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Amazon <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Boutons de partage */}
        <div className="mb-12">
          <ShareButtons
            title={title}
            slug={report.slug}
            score={confidenceScore}
          />
        </div>

        {/* Analyses similaires */}
        <div className="mb-12">
          <SimilarReports
            currentSlug={report.slug}
            currentCategory={undefined}
          />
        </div>

        {/* Newsletter */}
        <div className="mb-12">
          <Newsletter />
        </div>

      </div>
    </main>
  );
};

export default ReportDisplay;

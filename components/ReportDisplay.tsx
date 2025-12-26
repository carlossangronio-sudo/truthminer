'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Quote, 
  ExternalLink,
  Users,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
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
    purchase_url?: string | null; // URL d'achat prioritaire (Amazon, Fnac, etc.)
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
      source_url?: string;
    }>;
    debate_summary?: string | null;
    controversy_index?: number | null; // Index de controverse (0-100)
    recommendations?: string[];
    target_audience?: {
      yes?: string;
      no?: string;
    };
  };
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  
  // Debug pour vérifier les chemins de données dans la console (F12)
  useEffect(() => {
    if (report) {
      console.log("--- DEBUG TRUTHMINER ---");
      console.log("ID du rapport:", report.id);
      console.log("URL Image (Racine):", report.url_image); // Ton travail du 23/12
      console.log("Image URL (fallback):", report.image_url);
      console.log("Titre:", report.title);
    }
  }, [report]);

  if (!report) return null;

  // On extrait les données de base
  const { title, url_image, image_url, consensus, pros, cons, deep_analysis, reddit_quotes, debate_summary, controversy_index, target_audience, final_verdict, punchline, confidenceScore, amazonSearchQuery, amazonRecommendationReason, purchase_url, choice, article } = report;
  
  // --- LOGIQUE IMAGE "SÉCURITÉ MAXIMALE" ---
  // On priorise absolument 'url_image' (ton travail manuel du 23/12)
  // Si vide, on cherche dans image_url (fallback)
  // En dernier recours, placeholder
  const imageSource = url_image || image_url || "/placeholder-tech.png";

  // --- LOGIQUE TEXTE (Rétro-compatibilité) ---
  // Convertir deep_analysis en string si c'est un objet
  let deepAnalysisText = '';
  if (deep_analysis) {
    if (typeof deep_analysis === 'string') {
      deepAnalysisText = deep_analysis;
    } else if (typeof deep_analysis === 'object') {
      // Si c'est un objet avec des clés, les convertir en texte
      deepAnalysisText = Object.entries(deep_analysis)
        .map(([key, value]) => `${typeof value === 'string' ? value : ''}`)
        .filter(Boolean)
        .join('\n\n');
    }
  }
  
  const mainAnalysis = 
    deepAnalysisText || 
    consensus || 
    choice || 
    article || 
    "Analyse en cours de synchronisation...";

  const finalVerdict = final_verdict || "";
  const punchlineText = punchline || "";

  // Compter les signaux analysés (approximation basée sur le score)
  const signalCount = Math.max(50, Math.round((confidenceScore || 50) * 10));

  // ID d'affiliation Amazon
  const affiliateId = 'tminer-21';
  
  // Fonction pour déterminer le texte du bouton selon l'URL
  const getButtonText = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('amazon')) {
      return 'Vérifier sur Amazon';
    } else if (urlLower.includes('fnac')) {
      return 'Voir sur Fnac';
    }
    return 'Voir l\'offre';
  };
  
  // PRIORITÉ : purchase_url (colonne manuelle) > amazonSearchQuery > fallback
  const purchaseLink = purchase_url || null;
  
  // Construire le lien Amazon avec tag d'affiliation (fallback si pas de purchase_url)
  const amazonLink = purchaseLink 
    ? null 
    : (amazonSearchQuery 
      ? `https://www.amazon.fr/s?k=${encodeURIComponent(amazonSearchQuery)}&tag=${affiliateId}`
      : (report.title ? `https://www.amazon.fr/s?k=${encodeURIComponent(report.title)}&tag=${affiliateId}` : null));

  return (
    <main className="min-h-screen text-slate-100 font-sans bg-[#02010a] pb-20 relative overflow-hidden">
      <NeuralBackground />
      
      {/* Navigation */}
      <nav className="p-6 border-b border-white/5 bg-[#02010a]/60 backdrop-blur-xl sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <ScannerLogo />
          </div>
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 text-sm uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[9px] font-black uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Zap size={12} fill="currentColor" /> Intelligence Sociale Vérifiée
          </div>
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-8 leading-[1]">
            {title}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-t border-white/5 pt-8">
            <TrustScore 
              score={confidenceScore || 85} 
              count={signalCount} 
            />
            {punchlineText && (
              <div className="flex-1 max-w-md italic text-slate-400 text-lg border-l-2 border-cyan-500 pl-6 py-2 bg-cyan-500/5 rounded-r-xl shadow-inner">
                "{punchlineText}"
              </div>
            )}
          </div>
        </header>

        {/* Section Principale */}
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          {/* L'IMAGE CORRIGÉE ICI */}
          <div className="md:col-span-4 aspect-square bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full opacity-30"></div>
            <img 
              src={imageSource} 
              alt={title}
              onError={(e) => { 
                console.error('[ReportDisplay] Erreur chargement image:', imageSource);
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Non+Trouvée'; 
              }}
              className="relative z-10 max-h-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-700 group-hover:scale-110"
            />
          </div>

          <div className="md:col-span-8">
            <div className="bg-[#0a0525]/80 border border-white/5 p-8 md:p-10 rounded-[3rem] backdrop-blur-md h-full shadow-2xl">
              <h3 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <Info size={14} /> Analyse Détaillée
              </h3>
              <div className="prose prose-invert max-w-none">
                {deepAnalysisText ? (
                  // Nouveau format : 3 paragraphes séparés
                  <div className="space-y-6">
                    {deepAnalysisText.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-slate-300 leading-relaxed text-lg italic whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  // Ancien format : texte simple
                  <p className="text-slate-300 leading-relaxed text-lg italic whitespace-pre-line">
                    {mainAnalysis}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROS & CONS */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-[2.5rem] bg-cyan-500/[0.03] border border-cyan-500/20 shadow-xl">
            <h3 className="flex items-center gap-3 text-cyan-400 font-black uppercase tracking-widest text-sm mb-6 italic">
              <CheckCircle size={18} /> Points de Force
            </h3>
            <ul className="space-y-4">
              {(pros || []).map((pro, i) => (
                <li key={i} className="flex gap-4 text-sm text-slate-400 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_cyan]"></div>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-purple-500/[0.03] border border-purple-500/20 shadow-xl">
            <h3 className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm mb-6 italic">
              <AlertTriangle size={18} /> Zones de Friction
            </h3>
            <ul className="space-y-4">
              {(cons || []).map((con, i) => (
                <li key={i} className="flex gap-4 text-sm text-slate-400 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0 shadow-[0_0_8px_purple]"></div>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CITATIONS REDDIT */}
        {reddit_quotes && reddit_quotes.length > 0 && (
          <div className="mb-16">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 text-center italic">Signaux Bruts du Réseau</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {reddit_quotes.map((quote, i) => {
                // Construire l'URL Reddit : utiliser source_url si disponible, sinon construire une URL de recherche
                const redditUrl = quote.source_url || `https://www.reddit.com/r/${quote.subreddit.replace('r/', '')}/search/?q=${encodeURIComponent(quote.text.substring(0, 50))}`;
                
                return (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] relative group hover:border-cyan-500/30 transition-all shadow-xl">
                    <Quote className="text-cyan-500/10 absolute top-4 left-4" size={40} />
                    <p className="text-sm italic text-slate-300 mb-6 relative z-10 leading-relaxed">"{quote.text}"</p>
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-600 tracking-widest mb-3">
                      <span className="text-cyan-500/40">{quote.user}</span>
                      <span className="bg-white/5 px-2 py-1 rounded-md">{quote.subreddit}</span>
                    </div>
                    <a
                      href={redditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-[9px] font-bold uppercase tracking-widest transition-colors group/link"
                    >
                      <ExternalLink size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                      Voir la discussion
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LE DÉBAT - Heatmap des Opinions */}
        {debate_summary && (
          <div className="mb-16 p-8 rounded-[2.5rem] bg-purple-500/[0.03] border border-purple-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-3 text-purple-400 font-black uppercase tracking-widest text-sm italic">
                <Users size={18} /> Le Débat
              </h3>
              {controversy_index !== null && controversy_index !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase text-slate-500 tracking-widest">Index de Controverse</span>
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full">
                    <span className="text-purple-400 font-black text-sm">{controversy_index}%</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic mb-6">{debate_summary}</p>
            
            {/* Heatmap visuelle des points de friction */}
            {pros && cons && (pros.length > 0 || cons.length > 0) && (
              <div className="mt-6 pt-6 border-t border-purple-500/20">
                <p className="text-[9px] uppercase text-slate-500 tracking-widest mb-4">Points de Friction Identifiés</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pros.length > 0 && (
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase text-cyan-400 tracking-widest font-bold">Validation</span>
                        <span className="text-xs text-cyan-300 font-bold">~{Math.round((pros.length / (pros.length + cons.length)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-cyan-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((pros.length / (pros.length + cons.length)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {cons.length > 0 && (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase text-red-400 tracking-widest font-bold">Critiques</span>
                        <span className="text-xs text-red-300 font-bold">~{Math.round((cons.length / (pros.length + cons.length)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-red-500/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((cons.length / (pros.length + cons.length)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VERDICT FINAL */}
        <div className="bg-[#05011a] border border-white/5 p-8 md:p-14 rounded-[3.5rem] flex flex-col md:flex-row gap-12 items-center shadow-2xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
            <ExternalLink size={200} className="text-cyan-400" />
          </div>
          
          <div className="flex-1 z-10">
            <h3 className="text-3xl font-black italic uppercase mb-6 text-white tracking-tighter">Verdict TruthMiner</h3>
            <p className="text-slate-400 italic text-xl leading-relaxed mb-8">{finalVerdict || "Consultez l'analyse complète ci-dessus."}</p>
            {target_audience && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {target_audience.yes && (
                  <div className="p-5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                    <span className="text-cyan-400 block text-[9px] font-black uppercase mb-2 tracking-widest">Cible Idéale</span>
                    <span className="text-slate-200 text-sm italic">{target_audience.yes}</span>
                  </div>
                )}
                {target_audience.no && (
                  <div className="p-5 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                    <span className="text-purple-400 block text-[9px] font-black uppercase mb-2 tracking-widest">Profil à Risque</span>
                    <span className="text-slate-200 text-sm italic">{target_audience.no}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Bouton d'achat - Affiché uniquement si purchase_url existe */}
          {purchaseLink && (
            <div className="w-full md:w-auto z-10">
              <a 
                href={purchaseLink} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-80 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-8 rounded-2xl font-black uppercase text-sm tracking-[0.2em] text-center shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_rgba(249,115,22,0.7)] transition-all flex items-center justify-center gap-3 active:scale-95 border-2 border-orange-400/50"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {getButtonText(purchaseLink)}
                <ExternalLink size={18} />
              </a>
            </div>
          )}
          
          {/* Fallback : AffiliateLink ou lien Amazon généré si pas de purchase_url */}
          {!purchaseLink && (
            <div className="w-full md:w-auto z-10">
              {amazonSearchQuery || report.title ? (
                <AffiliateLink
                  amazonSearchQuery={amazonSearchQuery || report.title}
                  recommendationReason={amazonRecommendationReason || 'Recommandation issue de la communauté Reddit'}
                  className="w-full md:w-80"
                />
              ) : (
                amazonLink && (
                  <a 
                    href={amazonLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-80 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-8 rounded-2xl font-black uppercase text-sm tracking-[0.2em] text-center shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_rgba(249,115,22,0.7)] transition-all flex items-center justify-center gap-3 active:scale-95 border-2 border-orange-400/50"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Vérifier le prix sur Amazon
                    <ExternalLink size={18} />
                  </a>
                )
              )}
            </div>
          )}
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

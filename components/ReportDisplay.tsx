'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NeuralBackground } from './NeuralBackground';
import { TrustScore } from './TrustScore';
import { IABadge } from './IABadge';
import ImageCard from './ImageCard';
import AffiliateLink from './AffiliateLink';
import Image from 'next/image';
import ShareButtons from './ShareButtons';
import SimilarReports from './SimilarReports';
import Newsletter from './Newsletter';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
    recommendations?: string[];
    target_audience?: {
      yes?: string;
      no?: string;
    };
  };
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  const score = report.confidenceScore ?? 50;
  const consensus = report.consensus || report.choice || 'Analyse en cours...';
  const pros = report.pros || [];
  const cons = report.cons || report.defects || [];
  const punchline = report.punchline || null;
  const finalVerdict = report.final_verdict || null;
  const targetAudience = report.target_audience;
  
  // Construire recommendations à partir de target_audience si disponible
  let recommendations: string[] = [];
  if (targetAudience) {
    if (targetAudience.yes) {
      recommendations.push(`✅ ${targetAudience.yes}`);
    }
    if (targetAudience.no) {
      recommendations.push(`❌ ${targetAudience.no}`);
    }
  }
  // Fallback : utiliser recommendations existant si target_audience n'existe pas
  if (recommendations.length === 0 && report.recommendations) {
    recommendations = report.recommendations;
  }

  // Compter les signaux analysés (approximation basée sur le score)
  const signalCount = Math.max(50, Math.round(score * 10));

  return (
    <main className="min-h-screen relative overflow-hidden">
      <NeuralBackground />
      
      <div className="relative z-10">
        {/* Header avec transition */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-20 pb-12"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 text-sm uppercase tracking-wider transition-colors"
            >
              <span>←</span>
              <span>Retour</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <IABadge text="Extraction d'avis communautaires" />
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">
                {report.title}
              </h1>
              <p className="text-slate-200 text-sm uppercase tracking-widest">
                Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Image principale */}
        {(report.url_image || report.image_url) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="container mx-auto px-4 md:px-6 mb-12 max-w-6xl"
          >
            <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <ImageCard
                imageUrl={report.url_image || report.image_url || undefined}
                title={report.title}
                height="h-64 md:h-96"
                className="w-full"
              />
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-6xl pb-16">
          {/* Score de confiance avec TrustScore */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <TrustScore score={score} count={signalCount} />
          </motion.div>

          {/* Consensus / Verdict principal */}
          {consensus && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12 p-8 bg-slate-900/50 border border-cyan-500/20 rounded-2xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">
                Verdict Neural Core
              </h2>
              <p className="text-lg text-slate-100 leading-relaxed">{consensus}</p>
              {finalVerdict && (
                <div className="mt-6 p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-lg">
                  <p className="text-cyan-400 font-bold italic">{finalVerdict}</p>
                </div>
              )}
            </motion.section>
          )}

          {/* Points forts et faibles en grille */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Points forts */}
            {pros.length > 0 && (
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 bg-slate-900/50 border border-emerald-500/20 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Points Forts
                  </h3>
                </div>
                <ul className="space-y-3">
                  {pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-slate-100 leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Points faibles */}
            {cons.length > 0 && (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="p-6 bg-slate-900/50 border border-red-500/20 rounded-2xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    Points Faibles
                  </h3>
                </div>
                <ul className="space-y-3">
                  {cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      <span className="text-slate-100 leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </div>

          {/* Analyse détaillée (article) */}
          {report.article && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mb-12 p-8 bg-slate-900/50 border border-cyan-500/20 rounded-2xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
                Analyse Détaillée
              </h2>
              <div className="prose prose-lg max-w-none markdown-content prose-invert prose-headings:text-white prose-p:text-slate-100 prose-strong:text-white prose-li:text-slate-100 prose-a:text-cyan-400">
                <ReactMarkdown>{report.article}</ReactMarkdown>
              </div>
            </motion.section>
          )}

          {/* Est-ce fait pour vous ? */}
          {recommendations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mb-12 p-8 bg-slate-900/50 border border-purple-500/20 rounded-2xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  Est-ce fait pour vous ?
                </h2>
              </div>
              <ul className="space-y-4">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span className="text-slate-100 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Lien Amazon avec image url_image */}
          {report.amazonSearchQuery && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mb-12 p-8 bg-slate-900/50 border border-orange-500/20 rounded-2xl backdrop-blur-sm"
            >
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
                Vérifier les Prix
              </h2>
              
              {/* Image produit - PRIORITÉ : url_image (colonne manuelle) */}
              {(report.url_image || report.image_url) && (
                <div className="mb-6 flex justify-center">
                  <div className="relative w-full max-w-sm h-64 rounded-xl overflow-hidden border border-cyan-500/20">
                    <ImageCard
                      imageUrl={report.url_image || report.image_url || undefined}
                      title={report.title}
                      height="h-full"
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              <AffiliateLink
                amazonSearchQuery={report.amazonSearchQuery}
                recommendationReason={
                  report.amazonRecommendationReason ||
                  'Recommandation issue de la communauté Reddit'
                }
              />
            </motion.section>
          )}

          {/* Boutons de partage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <ShareButtons
              title={report.title}
              slug={report.slug}
              score={report.confidenceScore}
            />
          </motion.div>

          {/* Analyses similaires */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <SimilarReports
              currentSlug={report.slug}
              currentCategory={undefined}
            />
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Newsletter />
          </motion.div>
        </div>
      </div>
    </main>
  );
}


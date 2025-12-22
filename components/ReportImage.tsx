'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ReportImageProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
}

// Composant Placeholder TruthMiner réutilisable
function TruthMinerPlaceholder({ minHeight = '400px', size = 'large' }: { minHeight?: string; size?: 'large' | 'small' }) {
  const iconSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  const iconInnerSize = size === 'large' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'large' ? 'text-xl' : 'text-sm';
  
  return (
    <div 
      className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-800 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 flex items-center justify-center"
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center gap-4 text-white p-8">
        <div className={`${iconSize} bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg`}>
          <svg
            className={iconInnerSize}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="text-center">
          <div className={`${textSize} font-bold tracking-wider mb-1`}>TRUTHMINER</div>
          <div className="text-sm text-white/80">Analyse basée sur Reddit</div>
        </div>
      </div>
    </div>
  );
}

export default function ReportImage({ imageUrl, title, className = '' }: ReportImageProps) {
  const [imageError, setImageError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Afficher le placeholder UNIQUEMENT si pas d'image_url ou si erreur réelle
  if (!imageUrl || imageError) {
    return (
      <div className={className}>
        <TruthMinerPlaceholder minHeight="400px" size="large" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-800 ${className}`}>
      <div className="relative w-full" style={{ minHeight: '400px', maxHeight: '500px' }}>
        {!hasLoaded && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={title}
          fill
          className={`object-cover ${hasLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          unoptimized={true}
          onLoad={() => {
            setHasLoaded(true);
          }}
          onError={() => {
            // Seulement en cas d'erreur réelle (404, etc.)
            setImageError(true);
          }}
        />
      </div>
    </div>
  );
}


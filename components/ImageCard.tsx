'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCardProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
  height?: string;
}

// Composant Placeholder TruthMiner réutilisable
function TruthMinerPlaceholder({ height = 'h-48', size = 'small' }: { height?: string; size?: 'large' | 'small' }) {
  const iconSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  const iconInnerSize = size === 'large' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'large' ? 'text-xl' : 'text-sm';
  
  return (
    <div className={`relative w-full ${height} overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-2 text-white">
        <div className={`${iconSize} bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm`}>
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
          <span className={`${textSize} font-semibold tracking-wider`}>TRUTHMINER</span>
      </div>
    </div>
  );
}

export default function ImageCard({ imageUrl, title, className = '', height = 'h-48' }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [showPlaceholder, setShowPlaceholder] = useState(!imageUrl);

  useEffect(() => {
    if (!imageUrl) {
      setShowPlaceholder(true);
      setImageLoading(false);
      return;
    }

    // Timeout de 5 secondes pour afficher le placeholder si l'image ne charge pas
    const timeoutId = setTimeout(() => {
      if (imageLoading) {
        setShowPlaceholder(true);
        setImageLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [imageUrl, imageLoading]);

  // Afficher le placeholder si pas d'image, erreur, ou timeout
  if (showPlaceholder || imageError || !imageUrl) {
    return (
      <div className={className}>
        <TruthMinerPlaceholder height={height} size="small" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${height} overflow-hidden bg-gray-100 dark:bg-slate-800 ${className}`}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        unoptimized={true}
        loading="lazy"
        onLoad={() => {
          setImageLoading(false);
          setShowPlaceholder(false);
        }}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
          setShowPlaceholder(true);
        }}
      />
    </div>
  );
}


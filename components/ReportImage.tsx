'use client';

import { useState, useEffect } from 'react';

interface ReportImageProps {
  imageUrl: string | null | undefined;
  title: string;
  className?: string;
}

export default function ReportImage({ imageUrl, title, className = '' }: ReportImageProps) {
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

  if (showPlaceholder || imageError || !imageUrl) {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-800 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center gap-4 text-white p-8">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
            <svg
              className="w-14 h-14 text-white"
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
            <div className="text-xl font-bold tracking-wider mb-1">TRUTHMINER</div>
            <div className="text-sm text-white/80">Analyse basée sur Reddit</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-800 ${className}`}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-auto max-h-[500px] object-cover"
        loading="eager"
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


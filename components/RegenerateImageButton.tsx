'use client';

import { useState } from 'react';

interface RegenerateImageButtonProps {
  reportId: string;
}

export default function RegenerateImageButton({ reportId }: RegenerateImageButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleRegenerate = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const secretKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'truthminer-admin-2024';
      
      const response = await fetch('/api/admin/regenerate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
        },
        body: JSON.stringify({ reportId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        // Recharger la page après 1 seconde pour voir la nouvelle image
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setStatus('error');
        console.error('Erreur:', data.error);
      }
    } catch (error) {
      setStatus('error');
      console.error('Erreur lors de la régénération:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegenerate}
      disabled={isLoading}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        isLoading
          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
          : status === 'success'
          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          : status === 'error'
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
      }`}
      title="Régénérer l'image via Serper"
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ...
        </span>
      ) : status === 'success' ? (
        '✓'
      ) : status === 'error' ? (
        '✗'
      ) : (
        '🔄'
      )}
    </button>
  );
}




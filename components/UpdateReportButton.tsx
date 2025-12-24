'use client';

import { useState } from 'react';

interface UpdateReportButtonProps {
  reportId: string;
  reportTitle: string;
}

export default function UpdateReportButton({ reportId, reportTitle }: UpdateReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir mettre à jour le rapport "${reportTitle}" ?\n\nCela va consommer des crédits Serper et OpenAI.`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Note: En production, utiliser une vraie authentification (cookie, session, etc.)
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'truthminer-admin-2024';
      
      const res = await fetch('/api/admin/update-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          reportId,
          forceUpdateImage: false, // Ne pas forcer la mise à jour de l'image
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setMessage('✅ Rapport mis à jour avec succès !');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpdate}
        disabled={isLoading}
        className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
        title="Forcer la mise à jour du rapport"
      >
        {isLoading ? 'Mise à jour...' : '🔄 Forcer la mise à jour'}
      </button>
      {message && (
        <span className={`text-xs ${message.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </span>
      )}
    </div>
  );
}


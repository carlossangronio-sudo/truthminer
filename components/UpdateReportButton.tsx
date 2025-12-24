'use client';

import { useState, useEffect } from 'react';
import { updateQueue } from '@/lib/utils/update-queue';

interface UpdateReportButtonProps {
  reportId: string;
  reportTitle: string;
}

export default function UpdateReportButton({ reportId, reportTitle }: UpdateReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isQueueProcessing, setIsQueueProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // S'abonner à l'état de la file d'attente
  useEffect(() => {
    const unsubscribe = updateQueue.subscribe((processing) => {
      setIsQueueProcessing(processing);
    });
    return unsubscribe;
  }, []);

  const handleUpdate = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir rafraîchir le rapport "${reportTitle}" ?\n\nCela va consommer des crédits Serper et OpenAI.`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // Ajouter la mise à jour à la file d'attente
    await updateQueue.enqueue(async () => {
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
            forceUpdateImage: false, // Ne jamais écraser l'image manuelle
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors de la mise à jour');
        }

        setMessage('✅ Rapport rafraîchi avec succès !');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        setMessage(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
        throw error; // Re-lancer pour que la file d'attente continue
      } finally {
        setIsLoading(false);
      }
    });
  };

  const isDisabled = isLoading || isQueueProcessing;
  const queueLength = updateQueue.getQueueLength();

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpdate}
        disabled={isDisabled}
        className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
        title={isQueueProcessing ? `Mise à jour en cours... (${queueLength} en attente)` : 'Rafraîchir le rapport'}
      >
        {isLoading ? 'Rafraîchissement...' : isQueueProcessing ? `⏳ En file (${queueLength})` : '🔄 Rafraîchir'}
      </button>
      {message && (
        <span className={`text-xs ${message.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </span>
      )}
    </div>
  );
}


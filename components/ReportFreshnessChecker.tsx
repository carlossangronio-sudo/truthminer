'use client';

import { useEffect } from 'react';

interface ReportFreshnessCheckerProps {
  reportId: string;
  updatedAt: string | null | undefined;
}

export default function ReportFreshnessChecker({ reportId, updatedAt }: ReportFreshnessCheckerProps) {
  useEffect(() => {
    // Vérifier si le rapport a plus de 30 jours
    if (!updatedAt) return;

    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate > 30) {
      console.log(`[FreshnessChecker] Rapport ${reportId} a ${Math.floor(daysSinceUpdate)} jours - Déclenchement de la mise à jour en arrière-plan`);
      
      // Déclencher la mise à jour en arrière-plan (sans bloquer l'utilisateur)
      // Note: En production, utiliser une vraie authentification
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'truthminer-admin-2024';
      
      fetch('/api/admin/update-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          reportId,
          forceUpdateImage: false, // Ne pas remplacer l'image existante
        }),
      }).catch((error) => {
        // Erreur silencieuse - on ne bloque pas l'utilisateur
        console.warn('[FreshnessChecker] Erreur lors de la mise à jour en arrière-plan:', error);
      });
    }
  }, [reportId, updatedAt]);

  // Ce composant ne rend rien visuellement
  return null;
}


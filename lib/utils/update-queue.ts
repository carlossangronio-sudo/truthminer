/**
 * Système de file d'attente simple pour les mises à jour de rapports
 * Évite les mises à jour simultanées qui pourraient dépasser les quotas Vercel
 */

class UpdateQueue {
  private isProcessing = false;
  private queue: Array<() => Promise<void>> = [];
  private listeners: Set<(isProcessing: boolean) => void> = new Set();

  /**
   * Ajoute une mise à jour à la file d'attente
   */
  async enqueue(updateFn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await updateFn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.notifyListeners(true);
      this.processQueue();
    });
  }

  /**
   * Traite la file d'attente une par une
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.notifyListeners(true);

    while (this.queue.length > 0) {
      const updateFn = this.queue.shift();
      if (updateFn) {
        try {
          await updateFn();
          // Petite pause entre les mises à jour pour éviter le rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('[UpdateQueue] Erreur lors de la mise à jour:', error);
        }
      }
    }

    this.isProcessing = false;
    this.notifyListeners(false);
  }

  /**
   * Vérifie si une mise à jour est en cours
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * S'abonner aux changements d'état
   */
  subscribe(listener: (isProcessing: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifier tous les listeners
   */
  private notifyListeners(isProcessing: boolean) {
    this.listeners.forEach((listener) => listener(isProcessing));
  }

  /**
   * Obtenir le nombre de mises à jour en attente
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// Instance globale de la file d'attente
export const updateQueue = new UpdateQueue();


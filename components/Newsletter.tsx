'use client';

import { useState } from 'react';

interface NewsletterProps {
  className?: string;
}

export default function Newsletter({ className = '' }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStatus('idle');

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Merci de renseigner une adresse email.');
      return;
    }

    // Validation très basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus('error');
      setMessage('Adresse email invalide.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setMessage(
          data?.error ||
            "Une erreur est survenue lors de l'inscription. Merci de réessayer plus tard."
        );
        return;
      }

      setStatus('success');
      setMessage('Merci !');
      setEmail('');
    } catch (error) {
      console.error('[Newsletter] Erreur lors de la requête /api/subscribe :', error);
      setStatus('error');
      setMessage(
        "Impossible de contacter le serveur pour le moment. Merci de réessayer un peu plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className={`rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl p-6 md:p-8 text-center text-slate-50 ${className}`}
    >
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
        Ne manquez plus aucune vérité sur les produits.
      </h2>
      <p className="text-sm md:text-base text-slate-300 mb-6">
        Recevez nos meilleures analyses Reddit directement par mail.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base font-semibold transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Inscription...' : "S'abonner"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-xs md:text-sm ${
            status === 'success' ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}



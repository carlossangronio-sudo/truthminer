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
      className={`glass-card-ultra p-6 md:p-8 text-center relative z-10 ${className}`}
      style={{ overflow: 'visible' }}
    >
      <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-2 text-slate-900" style={{ lineHeight: '2', paddingBottom: '3rem', paddingTop: '2rem', overflow: 'visible', display: 'block' }}>
        Ne manquez plus aucune <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500" style={{ display: 'inline-block', paddingBottom: '2rem', paddingTop: '1rem', lineHeight: '2.2', overflow: 'visible' }}>vérité</span>
      </h2>
      <p className="text-sm md:text-base text-slate-600 mb-6 font-medium">
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
          className="flex-1 px-4 py-3 rounded-xl glass-card border border-white/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm md:text-base font-medium"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base font-black uppercase italic tracking-wider text-white transition-all whitespace-nowrap"
        >
          {isLoading ? 'Inscription...' : "S'abonner"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-xs md:text-sm font-medium ${
            status === 'success' ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}



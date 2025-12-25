'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScannerLogo } from '@/components/ScannerLogo';
import { NeuralBackground } from '@/components/NeuralBackground';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Rediriger vers le dashboard admin
        router.push('/admin-secret-dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans bg-[#02010a] relative overflow-hidden">
      <NeuralBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12 text-center">
            <ScannerLogo />
          </div>

          {/* Formulaire de connexion */}
          <div className="bg-[#0a0525]/80 border border-cyan-500/30 p-8 md:p-10 rounded-[3rem] backdrop-blur-md shadow-2xl">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-2 text-center">
              Accès Admin
            </h1>
            <p className="text-slate-400 text-sm text-center mb-8">
              Connexion sécurisée à la console d'administration
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="admin"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(34,211,238,0.4)]"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-xs text-slate-500 text-center">
              <p>Session valide 7 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


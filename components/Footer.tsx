import Link from 'next/link';
import { ScannerLogo } from './ScannerLogo';

export default function Footer() {
  return (
    <footer className="py-24 px-6 border-t border-white/50 bg-white/10 backdrop-blur-3xl relative z-20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <ScannerLogo />
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">Analyses</Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">À propos</Link>
            <Link href="/mentions-legales" className="hover:text-blue-600 transition-colors">Légal</Link>
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            © {new Date().getFullYear()} TruthMiner. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
}

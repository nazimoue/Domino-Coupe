'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authSignIn, authSignOut } from '@/lib/db';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, error } = await authSignIn(email, password);
    if (error) {
      setError('Email ou mot de passe incorrect');
      setIsLoading(false);
      return;
    }
    // Permet l'accès à tout utilisateur connecté
    const user = data.user;
    if (user) {
      router.push('/');
    } else {
      setError("Connexion impossible");
      await authSignOut();
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#041336] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-sky-500 selection:text-slate-900">

      {/* =========================================
          FOND ET AMBIANCE (Glows & Particules)
         ========================================= */}
      <div className="absolute inset-0 z-0">
        {/* Dégradé profond inspiré de l'image */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>

        {/* Particules / Étoiles (CSS pur) */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        {/* Halo lumineux central */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-125 h-100 bg-yellow-500/20 rounded-full blur-[120px]"></div>
      </div>

      {/* =========================================
          DÉCORATIONS DORÉES (Cadre & Coins)
         ========================================= */}
      {/* Coin Haut Gauche */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-10 opacity-80">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-transparent stroke-[#fbbf24] stroke-2">
          <path d="M0,0 L0,40 Q0,100 60,100 L100,100" strokeDasharray="4 2" />
          <path d="M10,10 L10,50 Q10,90 50,90 L90,90" className="opacity-50" />
          <circle cx="20" cy="20" r="4" fill="#fbbf24" className="animate-pulse" />
        </svg>
      </div>
      {/* Coin Haut Droit (Miroir) */}
      <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-10 opacity-80 rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-transparent stroke-[#fbbf24] stroke-2">
          <path d="M0,0 L0,40 Q0,100 60,100 L100,100" strokeDasharray="4 2" />
          <path d="M10,10 L10,50 Q10,90 50,90 L90,90" className="opacity-50" />
          <circle cx="20" cy="20" r="4" fill="#fbbf24" className="animate-pulse" />
        </svg>
      </div>

      {/* Lanternes suspendues */}
      <div className="absolute top-0 w-full flex justify-between px-8 z-20 pointer-events-none">
        <Lanterne delay="0s" height="h-24" />
        <Lanterne delay="1s" height="h-32" />
      </div>

      {/* =========================================
          CONTENU PRINCIPAL - FORMULAIRE LOGIN
         ========================================= */}
      <div className="relative z-30 flex flex-col items-center w-full px-4 max-w-md">

        {/* Logo Texte "Domino" Or */}
        <div className="text-center relative mb-12 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-linear-to-b from-[#fde68a] via-[#fbbf24] to-[#b45309] drop-shadow-sm font-serif">
            Domino
          </h1>
          <div className="text-xl font-bold text-[#fbbf24] tracking-[0.3em] -mt-1.25">2026</div>
        </div>

        {/* Formulaire de connexion */}
        <div className="w-full bg-[#064e3b]/40 backdrop-blur-md border border-[#fbbf24]/30 rounded-2xl shadow-2xl shadow-yellow-500/20 p-8">

          <h2 className="text-2xl font-bold text-[#fbbf24] text-center mb-8 tracking-wide">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Champ email */}
            <div>
              <label className="block text-sm font-semibold text-[#fbbf24] mb-3 tracking-wider">
                📧 EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Entrez l'email admin..."
                className="w-full px-4 py-3 bg-[#001e16]/80 border border-[#fbbf24]/40 rounded-lg text-white placeholder-emerald-200/50 focus:outline-none focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/30 transition-all"
                disabled={isLoading}
                required
              />
            </div>
            {/* Champ mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-[#fbbf24] mb-3 tracking-wider">
                🔐 MOT DE PASSE
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe..."
                className="w-full px-4 py-3 bg-[#001e16]/80 border border-[#fbbf24]/40 rounded-lg text-white placeholder-emerald-200/50 focus:outline-none focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/30 transition-all"
                disabled={isLoading}
                required
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-linear-to-r from-[#fbbf24] to-[#fcd34d] text-[#064e3b] font-bold rounded-lg shadow-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Vérification...
                </>
              ) : (
                <>
                  🔓 SE CONNECTER
                </>
              )}
            </button>
          </form>

          {/* Info supplémentaire */}
          <div className="mt-6 text-center text-xs text-emerald-300/70">
            Cette page est réservée à l&apos;administrateur
          </div>
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-8">
          <Link
            href="/home"
            className="text-[#fbbf24] hover:text-[#fcd34d] transition-colors text-sm font-semibold tracking-wide hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      {/* Silhouette Mosquée en bas */}
      <div className="absolute bottom-0 inset-x-0 h-40 z-[-1] flex items-end justify-center opacity-60 pointer-events-none">
        <div className="absolute bottom-0 w-full h-24 bg-linear-to-t from-[#f59e0b]/30 to-transparent blur-xl"></div>
        <div className="w-32 h-24 bg-linear-to-t from-[#fbbf24] to-[#fcd34d] rounded-t-[50%] shadow-[0_0_40px_rgba(251,191,36,0.4)] relative -mx-5 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#fbbf24] text-2xl">☪</div>
        </div>
      </div>

    </main>
  );
}

// 1. Composant Lanterne
function Lanterne({ height, delay }: { height: string, delay: string }) {
  return (
    <div className="flex flex-col items-center" style={{ animation: `bounce 3s infinite ease-in-out ${delay}` }}>
      <div className={`w-0.5 bg-linear-to-b from-[#fbbf24]/0 via-[#fbbf24] to-[#b45309] ${height}`}></div>
      <div className="w-10 h-14 bg-linear-to-br from-[#fbbf24] to-[#b45309] rounded-lg border-2 border-[#fde68a] shadow-[0_0_20px_rgba(251,191,36,0.6)] flex items-center justify-center relative">
        <div className="w-6 h-8 bg-[#fef3c7]/30 border border-[#fbbf24] rounded flex items-center justify-center">
          <div className="w-2 h-4 bg-yellow-100 rounded-full blur-[2px] animate-pulse"></div>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#b45309] rotate-45"></div>
      </div>
    </div>
  );
}

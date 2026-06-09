'use client';

import { useState, useEffect } from 'react';
import AdhanClock from '@/app/components/AdhanClock';
import Link from 'next/link';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    setIsConnected(!!auth);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignorer les erreurs de déconnexion
    }
    sessionStorage.removeItem('auth');
    setIsConnected(false);
    window.location.reload();
  };

  return (
    <main suppressHydrationWarning className="relative min-h-screen w-full bg-[#041336] overflow-hidden flex flex-col items-center justify-start sm:justify-between font-sans selection:bg-sky-500 selection:text-slate-900">

      {/* 1. BACKGROUND AMBIANCE */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* 2. CONTENU */}
      <div className="relative z-30 flex flex-col items-center w-full px-4">

        {/* EN-TÊTE */}
        <div className="flex flex-col items-center pt-10 mb-4 text-center">
          <h2 className="text-2xl sm:text-4xl text-sky-300 font-serif tracking-tighter drop-shadow-lg uppercase">
            Qualification
          </h2>
          <h3 className="text-[10px] sm:text-xs text-sky-200/60 tracking-[0.5em] uppercase font-light">
            Coupe du Monde Domino 2026
          </h3>
          <div className="mt-4 px-4 py-1 border border-sky-400/20 rounded-full bg-slate-900/50 backdrop-blur-sm text-[10px] sm:text-xs text-sky-100 font-bold uppercase tracking-widest">
            📍 Tlemcen • Café MONTECARLO
          </div>
        </div>

        {/* ZONE LOGO : TROPHÉE HAUTE PRÉCISION */}
        <div className="relative w-72 h-80 sm:w-96 sm:h-[400px] flex items-center justify-center my-4">
          {/* Éclat lumineux arrière dynamique */}
          <div className="absolute w-40 h-40 bg-sky-400/15 blur-[80px] rounded-full animate-pulse"></div>

          <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)]">
            <defs>
              {/* Or Blanc / Chrome Liquide */}
              <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#7dd3fc" />
                <stop offset="75%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              {/* Or Blanc Sombre pour les faces arrières / ombres */}
              <linearGradient id="chromeDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0c4a6e" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#075985" />
              </linearGradient>

              {/* Reflet Or de Prestige pour l'intérieur ou éclats */}
              <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>

              {/* Ombre portée pour détacher les couches */}
              <filter id="layerShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#020617" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* SOCLE ARCHITECTURAL (Effet Marbre Bleu & Platine) */}
            <g filter="url(#layerShadow)">
              {/* Base inférieure */}
              <path d="M50 215 L150 215 L165 232 L35 232 Z" fill="#03224c" stroke="#0ea5e9" strokeWidth="1" />
              {/* Corps central du socle */}
              <path d="M62 195 L138 195 L146 215 L54 215 Z" fill="url(#chromeDark)" stroke="#38bdf8" strokeWidth="0.5" />
              {/* Bague supérieure en platine */}
              <rect x="75" y="187" width="50" height="8" rx="1" fill="url(#chromeGrad)" />
            </g>

            {/* LE CORPS DE LA COUPE (Évasement géométrique 3D) */}
            <g filter="url(#layerShadow)">
              {/* Branche principale gauche */}
              <path d="M100 187 C78 187 50 155 45 110 C42 85 52 50 65 50 C65 50 60 85 72 115 C82 140 100 160 100 187 Z" fill="url(#chromeGrad)" />
              {/* Branche principale droite (Symétrie miroir avec dégradé inversé) */}
              <path d="M100 187 C122 187 150 155 155 110 C158 85 148 50 135 50 C135 50 140 85 128 115 C118 140 100 160 100 187 Z" fill="url(#chromeGrad)" />
              {/* Coeur de la coupe (Fond sombre pour donner de la profondeur) */}
              <path d="M65 50 C80 45 120 45 135 50 C125 90 120 130 100 165 C80 130 75 90 65 50 Z" fill="#041a40" opacity="0.9" />
            </g>

            {/* ANSES MAJESTUEUSES (Courbes profilées) */}
            <path d="M48 105 C22 95 24 58 58 52 C52 62 48 80 50 95" fill="none" stroke="url(#chromeGrad)" strokeWidth="3.5" strokeLinecap="round" filter="url(#layerShadow)" />
            <path d="M152 105 C178 95 176 58 142 52 C148 62 152 80 150 95" fill="none" stroke="url(#chromeGrad)" strokeWidth="3.5" strokeLinecap="round" filter="url(#layerShadow)" />

            {/* LE DOMINO SACRÉ (Trône majestueusement au centre) */}
            <g transform="translate(72, 45)" filter="url(#layerShadow)">
              {/* Face avant du Domino Or Blanc Premium */}
              <rect x="0" y="0" width="56" height="90" rx="5" fill="url(#chromeGrad)" stroke="#ffffff" strokeWidth="1" />

              {/* Biseau lumineux (Effet 3D sur le bord gauche/haut) */}
              <path d="M2 2 L54 2 L54 5 L2 5 Z" fill="#ffffff" opacity="0.4" />
              <path d="M2 2 L2 88 L5 88 L5 2 Z" fill="#ffffff" opacity="0.4" />

              {/* Ligne de division centrale métallique incrustée */}
              <rect x="6" y="43" width="44" height="4" rx="1" fill="#041336" />
              <rect x="6" y="44" width="44" height="1.5" rx="0.5" fill="#38bdf8" />

              {/* Points Haute Définition (Style nacre incrustée avec micro-ombre) */}
              <g fill="#041336">
                {/* Configuration Double 6 de compétition */}
                {/* Rang du haut */}
                <circle cx="15" cy="13" r="4.5" /> <circle cx="41" cy="13" r="4.5" />
                <circle cx="15" cy="24.5" r="4.5" /> <circle cx="41" cy="24.5" r="4.5" />
                <circle cx="15" cy="36" r="4.5" /> <circle cx="41" cy="36" r="4.5" />
                {/* Rang du bas */}
                <circle cx="15" cy="54" r="4.5" /> <circle cx="41" cy="54" r="4.5" />
                <circle cx="15" cy="65.5" r="4.5" /> <circle cx="41" cy="65.5" r="4.5" />
                <circle cx="15" cy="77" r="4.5" /> <circle cx="41" cy="77" r="4.5" />
              </g>

              {/* Points lumineux au centre de chaque point pour l'effet relief creux */}
              <g fill="#38bdf8" opacity="0.7">
                <circle cx="16" cy="14" r="1" /> <circle cx="42" cy="14" r="1" />
                <circle cx="16" cy="25.5" r="1" /> <circle cx="42" cy="25.5" r="1" />
                <circle cx="16" cy="37" r="1" /> <circle cx="42" cy="37" r="1" />
                <circle cx="16" cy="55" r="1" /> <circle cx="42" cy="55" r="1" />
                <circle cx="16" cy="66.5" r="1" /> <circle cx="42" cy="66.5" r="1" />
                <circle cx="16" cy="78" r="1" /> <circle cx="42" cy="78" r="1" />
              </g>
            </g>

            {/* VERRE DE PROTECTION AVANT / REFLET SATINÉ (L'astuce design ultime) */}
            <path d="M 68 55 Q 100 48 132 55 C 122 105 118 135 100 170 Z" fill="url(#goldGlow)" opacity="0.15" pointerEvents="none" />
            <path d="M 52 50 Q 100 42 148 50" fill="none" stroke="url(#goldGlow)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* HORLOGE */}
        <div className="my-6">
          <AdhanClock />
        </div>

      </div>

      {/* 3. FOOTER NAVIGATION */}
      <div className="relative z-40 w-full py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          <NavButton href="/classement" label="📊 Classement" />
          <NavButton href="/team" label="👥 Team" />
          <NavButton href="/explication" label="❓ Explication" />
          <NavButton href="/propos" label="ℹ️ À propos" />
          <NavButton href="/reglesarab" label="📋 Règles" />

          {isConnected ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 font-bold text-sm rounded-xl bg-gradient-to-r from-red-500 to-red-800 text-white shadow-xl hover:scale-105 transition-transform"
            >
              🚪 Logout
            </button>
          ) : (
            <NavButton href="/login" label="🔐 Login" />
          )}

          {isConnected && (
            <div className="w-full flex justify-center gap-3 mt-4 pt-4 border-t border-sky-400/20">
              <NavButton href="/creation" label="✨ Création" admin />
              <NavButton href="/attribution" label="🎁 Attribution" admin />
            </div>
          )}
        </div>
        <div className="mt-6 max-w-4xl mx-auto px-4">
          <div className="rounded-3xl border border-red-500/60 bg-red-950/95 text-center py-4 px-5 shadow-[0_0_30px_rgba(220,38,38,0.35)] animate-pulse text-red-100 font-extrabold uppercase tracking-wider text-sm md:text-base">
            ⚠️ Les 3 meilleurs joueurs de ces qualifications auront le droit de choisir leurs partenaires pour la Coupe de Domino Ramadan 2027.
          </div>
        </div>
      </div>
    </main>
  );
}

function NavButton({ href, label, admin }: { href: string, label: string, admin?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        px-6 py-2.5 font-bold text-sm rounded-xl shadow-lg transition-all border hover:scale-105 flex items-center gap-2
        ${admin
          ? 'bg-sky-600/20 border-sky-400/50 text-sky-100'
          : 'bg-white/10 border-white/10 text-sky-100 hover:bg-white/20'
        }
      `}
    >
      {label}
    </Link>
  );
}
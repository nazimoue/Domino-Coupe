'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

type Player = {
  id: number;
  prenom: string;
  nom: string;
  niveau?: string;
  photo?: Uint8Array | number[] | string;
  createdAt?: string;
};

type Score = {
  id: number;
  player_id: number;
  points: number;
  type: string;
  date: string;
  day?: number;
};

type PlayerInfo = {
  id: number;
  name: string;
  totalPoints: number;
  rank: number;
  niveau?: string;
  capotWins?: number;
  capotLosses?: number;
};
import Link from 'next/link';
import Image from 'next/image';

// Liste des jours du tournoi (Jeudis et vendredis du 11 juin au 31 décembre)
const TOURNAMENT_DAYS = (() => {
  const days = [] as Array<{ id: number; label: string; date: string }>;
  const start = new Date(2026, 5, 11); // 5 = juin
  const end = new Date(2026, 11, 31); // 11 = décembre
  let current = new Date(start);
  let index = 1;

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 4 || dayOfWeek === 5) {
      days.push({
        id: index,
        label: `J${index}`,
        date: current.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      });
      index += 1;
    }
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }

  return days;
})();

export default function Classement() {
  const [filter, setFilter] = useState<'jour' | 'mois'>('jour');
  const [selectedDay, setSelectedDay] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playerPhotos, setPlayerPhotos] = useState<Map<number, string>>(new Map());
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo | null>(null);
  const [rankingType, setRankingType] = useState<'normal' | 'capot'>('normal');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Charger les joueurs et scores au montage
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Re-fetch scores when day or filter changes (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    fetchScores();
  }, [filter, selectedDay]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [playersRes, scoresRes] = await Promise.all([
        fetch('/api/players?includePhotos=true'),
        fetch(filter === 'jour' ? `/api/scores?day=${selectedDay}` : '/api/scores'),
      ]);
      const playersData = await playersRes.json();
      const scoresData = await scoresRes.json();
      if (playersData.success) {
        setPlayers(playersData.data || []);
        const m = new Map<number, string>();
        (playersData.data || []).forEach((p: Player) => { if (p.photo && typeof p.photo === 'string') m.set(p.id, p.photo); });
        setPlayerPhotos(m);
      }
      if (scoresData.success) setScores(scoresData.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      const url = filter === 'jour' ? `/api/scores?day=${selectedDay}` : '/api/scores';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setScores(data.data || []);
    } catch (error) {
      console.error('Erreur chargement scores:', error);
    }
  };

  // Calculer le classement selon le filtre et le jour choisi
  // Helper: déterminer le niveau à partir des points avec le nouveau barème
  const mapPointsToLevel = (points: number) => {
    if (points >= 600) return 'Très fort';
    if (points >= 300) return 'Fort';
    if (points >= 100) return 'Moyen';
    if (points >= -99) return 'Faible';
    // anything <= -100 is 'Médiocre'
    return 'Médiocre';
  };

  const displayedPlayers = useMemo(() => {
    const playerScores: { [key: number]: { name: string; totalPoints: number; id: number } } = {};

    // Initialiser tous les joueurs avec 0 points
    players.forEach(player => {
      // On n'affiche que le prénom pour respecter la confidentialité sans toucher à la BDD
      playerScores[player.id] = {
        name: player.prenom,
        id: player.id,
        totalPoints: 0
      };
    });

    // Ajouter les scores selon le filtre
    if (filter === 'jour') {
      // Points du jour sélectionné
      scores
        .filter(score => score.day === selectedDay)
        .forEach(score => {
          if (playerScores[score.player_id]) {
            playerScores[score.player_id].totalPoints += score.points;
          }
        });
    } else if (filter === 'mois') {
      // Points totaux du tournoi
      scores.forEach(score => {
        if (playerScores[score.player_id]) {
          playerScores[score.player_id].totalPoints += score.points;
        }
      });
    }

    // Convertir en array, trier et ajouter le niveau calculé
    return Object.values(playerScores)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((p, index) => ({
        ...p,
        rank: index + 1,
        niveau: mapPointsToLevel(p.totalPoints)
      }));
  }, [players, scores, filter, selectedDay]);

  // Classement spécifique pour les capots : ne prend en compte que les scores dont le type contient 'capot'
  const capotDisplayedPlayers = useMemo(() => {
    const playerStats: { [key: number]: { name: string; id: number; capotWins: number; capotLosses: number; net: number } } = {};

    players.forEach(player => {
      playerStats[player.id] = { name: player.prenom, id: player.id, capotWins: 0, capotLosses: 0, net: 0 };
    });

    // Filtrer les scores selon le même filtre (jour/mois) puis garder seulement les 'capot'
    const filteredScores = (() => {
      if (filter === 'jour') return scores.filter(s => s.day === selectedDay);
      return scores;
    })();

    const isCapot = (t?: string) => (t || '').toLowerCase().includes('capot');

    filteredScores
      .filter(s => isCapot(s.type))
      .forEach(score => {
        const ps = playerStats[score.player_id];
        if (!ps) return;
        if (Number(score.points) > 0) ps.capotWins += 1;
        if (Number(score.points) < 0) ps.capotLosses += 1;
        ps.net = ps.capotWins - ps.capotLosses;
      });

    return Object.values(playerStats)
      .sort((a, b) => {
        if (b.net !== a.net) return b.net - a.net; // net desc
        if (b.capotWins !== a.capotWins) return b.capotWins - a.capotWins; // wins desc
        return a.name.localeCompare(b.name);
      })
      .map((p, index) => ({
        id: p.id,
        name: p.name,
        totalPoints: p.net, // reuse field for existing UI (net)
        capotWins: p.capotWins,
        capotLosses: p.capotLosses,
        rank: index + 1
      }));
  }, [players, scores, filter, selectedDay]);

  const currentList = rankingType === 'normal' ? displayedPlayers : capotDisplayedPlayers;
  const top3 = currentList.slice(0, 3);
  const restOfPlayers = currentList.slice(3);

  // Photo loading no longer needed — all photos are fetched upfront

  const getPlayerPhoto = (playerId: number): string | null => {
    return playerPhotos.get(playerId) ?? null;
  };

  // Return a small stylized SVG icon for a level
  const getLevelIcon = (niveau?: string) => {
    const size = 36;
    const common = { width: size, height: size };
    switch ((niveau || '').toLowerCase()) {
      case 'très fort':
      case 'tres fort':
      case 'tres_fort':
      case 'tres-fort':
        return (
          <svg {...common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#g1)" />
            <path d="M7 13l3 3 7-7" stroke="#08131a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'fort':
        return (
          <svg {...common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#34d399" />
            <path d="M7 13l3 3 7-7" stroke="#052e22" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'moyen':
        return (
          <svg {...common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#60a5fa" />
            <text x="12" y="15" fontSize="10" textAnchor="middle" fill="#052e22" fontWeight={700}>M</text>
          </svg>
        );
      case 'faible':
        return (
          <svg {...common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#fbbf24" />
            <text x="12" y="15" fontSize="10" textAnchor="middle" fill="#082018" fontWeight={700}>F</text>
          </svg>
        );
      default:
        return (
          <svg {...common} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#9ca3af" />
            <text x="12" y="15" fontSize="10" textAnchor="middle" fill="#08131a" fontWeight={700}>–</text>
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <main suppressHydrationWarning className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans flex flex-col items-center justify-center selection:bg-sky-500 selection:text-slate-900">
        {/* FOND */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
          <div className="absolute inset-0 opacity-20" style={mounted ? { backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' } : undefined}></div>
        </div>

        {/* Animation: dominos qui tombent */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="flex items-end gap-3 h-40 mb-6" style={{ perspective: '800px' }}>
            <div className="domino" style={{ animationDelay: '0s' }}>
              <div className="dot"></div>
            </div>
            <div className="domino" style={{ animationDelay: '0.12s' }}>
              <div className="dot"></div>
            </div>
            <div className="domino" style={{ animationDelay: '0.24s' }}>
              <div className="dot"></div>
            </div>
            <div className="domino" style={{ animationDelay: '0.36s' }}>
              <div className="dot"></div>
            </div>
            <div className="domino" style={{ animationDelay: '0.48s' }}>
              <div className="dot"></div>
            </div>
            <div className="domino" style={{ animationDelay: '0.6s' }}>
              <div className="dot"></div>
            </div>
          </div>
          {/* Level popover / modal */}
          {selectedPlayer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div onClick={() => setSelectedPlayer(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div className="relative z-60 w-80 max-w-xs p-4 bg-[#001e15]/95 border border-[#fbbf24]/20 rounded-2xl shadow-2xl text-center text-white">
                <div className="flex items-center justify-center -mt-6 mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#064e3b] to-[#072f26] flex items-center justify-center shadow-inner">
                    {rankingType === 'normal' ? getLevelIcon(selectedPlayer.niveau) : <span className="text-2xl">👑</span>}
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#fbbf24] mb-1">{selectedPlayer.name}</h4>
                <p className="text-xs text-emerald-300 mb-2">{selectedPlayer.totalPoints} {rankingType === 'normal' ? 'pts' : '(net capot)'}</p>
                {rankingType === 'normal' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064e3b]/20 rounded-full text-[12px] text-emerald-200 font-mono">
                    <span className="font-medium">Niveau :</span>
                    <span className="font-bold">{selectedPlayer.niveau || 'Médiocre'}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-3 py-1 bg-[#064e3b]/20 rounded-full text-[12px] text-emerald-200 font-mono">
                    <span className="font-medium">Capots V :</span>
                    <span className="font-bold">{selectedPlayer.capotWins ?? 0}</span>
                    <span className="font-medium">D :</span>
                    <span className="font-bold">{selectedPlayer.capotLosses ?? 0}</span>
                  </div>
                )}
                <div className="mt-4">
                  <button onClick={() => setSelectedPlayer(null)} className="px-4 py-2 bg-[#fbbf24] text-[#002a20] rounded-lg font-bold">Fermer</button>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-[#fbbf24] mb-2 font-serif">Chargement du Classement</h2>
          <p className="text-[#fde68a] text-sm opacity-70 text-center max-w-xs">Préparation des données du tournoi...</p>

          <style>{`\n            .domino {\n              width: 26px;\n              height: 44px;\n              background: #f5f5dC;\n              border: 2px solid #888888;\n              border-radius: 6px;\n              box-shadow: 0 6px 12px rgba(0,0,0,0.45);\n              display: flex;\n              align-items: center;\n              justify-content: center;\n              transform-origin: bottom left;\n              transform: rotate(0deg) translateY(0);\n              animation: knock 0.8s cubic-bezier(.2,.8,.2,1) forwards;\n            }\n            .dot {\n              width: 6px;\n              height: 6px;\n              background: #002a20;\n              border-radius: 999px;\n            }\n            @keyframes knock {\n              0% { transform: rotate(0deg) translateY(0); }\n              55% { transform: rotate(80deg) translateY(8px); }\n              100% { transform: rotate(80deg) translateY(8px); }\n            }\n            /* répéter l'animation en boucle doucement */\n            .domino { animation-iteration-count: infinite; animation-direction: normal; }\n          `}</style>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-slate-900">

      {/* FOND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
        <div className="absolute inset-0 opacity-20" style={mounted ? { backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' } : undefined}></div>
      </div>

      {/* CONTENU */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col min-h-screen pb-6">

        {/* EN-TÊTE */}
        <div className="px-5 pt-8 pb-2">
          <div className="flex items-center justify-between mb-6">
            <Link href="/home" className="text-[#fbbf24] hover:text-[#fde68a] transition-colors p-2 bg-[#064e3b]/50 rounded-full backdrop-blur-md">
              <span>←</span>
            </Link>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-b from-[#fde68a] via-[#fbbf24] to-[#b45309] font-serif">
              Classement
            </h1>
            <div className="w-8"></div>
          </div>

          {/* FILTRES PRINCIPAUX */}
          <div className="flex p-1 bg-[#001e15]/60 backdrop-blur rounded-xl border border-[#fbbf24]/20 mb-4">
            {['jour', 'mois'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as 'jour' | 'mois')}
                className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${filter === f
                  ? 'bg-[#fbbf24] text-[#002a20] shadow-lg'
                  : 'text-emerald-400 hover:text-[#fbbf24]'
                  }`}
              >
                {f === 'jour' ? 'Par Jour' : 'Général'}
              </button>
            ))}
          </div>

          {/* Sélecteur de type de classement : Normal / Capot */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRankingType('normal')}
              className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${rankingType === 'normal' ? 'bg-[#fbbf24] text-[#002a20] shadow-lg' : 'text-emerald-400 hover:text-[#fbbf24]'}`}
            >
              Classement Normal
            </button>
            <button
              onClick={() => setRankingType('capot')}
              className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${rankingType === 'capot' ? 'bg-[#fbbf24] text-[#002a20] shadow-lg' : 'text-emerald-400 hover:text-[#fbbf24]'}`}
            >
              Classement Capot
            </button>
          </div>


          {/* --- SÉLECTEUR DE JOUR (Visible seulement si filtre = 'jour') --- */}
          {filter === 'jour' && (
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 w-max px-1">
                {TOURNAMENT_DAYS.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`
                    flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all active:scale-95
                    ${selectedDay === day.id
                        ? 'bg-[#064e3b] border-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                        : 'bg-[#001e15]/50 border-[#fbbf24]/10 hover:bg-[#064e3b]/30'
                      }
                  `}
                  >
                    <span className={`text-sm font-bold ${selectedDay === day.id ? 'text-[#fbbf24]' : 'text-emerald-400'}`}>
                      {day.label}
                    </span>
                    <span className="text-[10px] text-emerald-500/80 font-mono leading-none mt-1">
                      {day.date}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* --- PODIUM (TOP 3) --- */}
          <div className="flex justify-center items-end gap-2 md:gap-4 mb-2 animate-fade-in-up">

            {/* 2ème */}
            <div onClick={() => { if (top3[1]) { setSelectedPlayer(top3[1]); } }} className="cursor-pointer flex flex-col items-center w-1/3">
              <div className="relative w-16 h-16 rounded-full border-2 border-gray-400 shadow-lg bg-[#064e3b] flex items-center justify-center mb-1 overflow-hidden">
                {top3[1] && getPlayerPhoto(top3[1].id) ? (
                  <Image src={getPlayerPhoto(top3[1].id) as string} alt={top3[1].name} className="w-16 h-16 object-cover rounded-full" width={64} height={64} unoptimized />
                ) : (
                  <span className="text-xl">🥈</span>
                )}
              </div>
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-bold text-gray-300 truncate px-1">{top3[1]?.name || 'N/A'}</p>
                  {top3[1] && 'niveau' in top3[1] && top3[1].niveau && (
                    <span className="text-[10px] bg-gray-700/20 text-gray-200 px-2 py-1 rounded-full font-mono">{top3[1].niveau}</span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-400 font-mono">{top3[1]?.totalPoints || 0}</p>
              </div>
              <div className="mt-1 w-full h-16 bg-linear-to-t from-gray-500/20 to-transparent rounded-t-lg border-t border-gray-400/30 flex items-end justify-center pb-2 text-2xl font-bold text-gray-500/50">2</div>
            </div>

            {/* 1er */}
            <div onClick={() => { if (top3[0]) { setSelectedPlayer(currentList[0]); } }} className="cursor-pointer flex flex-col items-center w-1/3 -mt-4">
              <div className="relative w-24 h-24 rounded-full border-4 border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.5)] bg-[#064e3b] flex items-center justify-center mb-1 z-10 overflow-hidden">
                {top3[0] && getPlayerPhoto(top3[0].id) ? (
                  <Image src={getPlayerPhoto(top3[0].id) as string} alt={top3[0].name} className="w-24 h-24 object-cover rounded-full" width={96} height={96} unoptimized />
                ) : (
                  <span className="text-3xl font-bold text-[#fbbf24]">{top3[0]?.name?.charAt(0) ?? ''}</span>
                )}
              </div>
              <div className="text-center w-full relative z-10">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-bold text-[#fbbf24] truncate px-1">{top3[0]?.name || 'N/A'}</p>
                  {top3[0] && 'niveau' in top3[0] && top3[0].niveau && (
                    <span className="text-[10px] bg-[#fbbf24]/20 text-[#f7c948] px-2 py-1 rounded-full font-mono">{top3[0].niveau}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-300 font-bold font-mono">{top3[0]?.totalPoints || 0} pts</p>
              </div>
              <div className="mt-1 w-full h-24 bg-linear-to-t from-[#fbbf24]/20 to-transparent rounded-t-lg border-t border-[#fbbf24]/50 flex items-end justify-center pb-2 text-4xl font-bold text-[#fbbf24]/50">1</div>
            </div>

            {/* 3ème */}
            <div onClick={() => { if (top3[2]) { setSelectedPlayer(currentList[2]); } }} className="cursor-pointer flex flex-col items-center w-1/3">
              <div className="relative w-16 h-16 rounded-full border-2 border-[#b45309] shadow-lg bg-[#064e3b] flex items-center justify-center mb-1 overflow-hidden">
                {top3[2] && getPlayerPhoto(top3[2].id) ? (
                  <Image src={getPlayerPhoto(top3[2].id) as string} alt={top3[2].name} className="w-16 h-16 object-cover rounded-full" width={64} height={64} unoptimized />
                ) : (
                  <span className="text-xl">🥉</span>
                )}
              </div>
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-bold text-[#d97706] truncate px-1">{top3[2]?.name || 'N/A'}</p>
                  {top3[2] && 'niveau' in top3[2] && top3[2].niveau && (
                    <span className="text-[10px] bg-[#b45309]/20 text-[#ffd7a1] px-2 py-1 rounded-full font-mono">{top3[2].niveau}</span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-400 font-mono">{top3[2]?.totalPoints || 0}</p>
              </div>
              <div className="mt-1 w-full h-12 bg-linear-to-t from-[#b45309]/20 to-transparent rounded-t-lg border-t border-[#b45309]/30 flex items-end justify-center pb-2 text-2xl font-bold text-[#b45309]/50">3</div>
            </div>
          </div>
        </div>

        {/* Modal joueur sélectionné (photo, prénom, niveau) */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={() => setSelectedPlayer(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-60 w-80 max-w-xs p-4 bg-[#001e15]/95 border border-[#fbbf24]/20 rounded-2xl shadow-2xl text-center text-white">
              <div className="flex items-center justify-center mt-0 mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#064e3b] to-[#072f26] flex items-center justify-center shadow-inner overflow-hidden">
                  {getPlayerPhoto(selectedPlayer.id) ? (
                    <Image src={getPlayerPhoto(selectedPlayer.id) as string} alt={selectedPlayer.name} className="w-20 h-20 object-cover rounded-full" width={80} height={80} unoptimized />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center text-lg font-bold text-emerald-200">{selectedPlayer.name?.charAt(0)}</div>
                  )}
                </div>
              </div>
              <h4 className="text-lg font-bold text-[#fbbf24] mb-1">{selectedPlayer.name}</h4>
              <p className="text-sm text-emerald-300 mb-2">{selectedPlayer.totalPoints} {rankingType === 'normal' ? 'pts' : '(net capot)'}</p>
              {rankingType === 'normal' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#064e3b]/20 rounded-full text-[12px] text-emerald-200 font-mono">
                  <span className="font-medium">Niveau :</span>
                  <span className="font-bold">{selectedPlayer.niveau || 'Médiocre'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-[#064e3b]/20 rounded-full text-[12px] text-emerald-200 font-mono">
                  <span className="font-medium">Capots V :</span>
                  <span className="font-bold">{selectedPlayer.capotWins ?? 0}</span>
                  <span className="font-medium">D :</span>
                  <span className="font-bold">{selectedPlayer.capotLosses ?? 0}</span>
                </div>
              )}
              <div className="mt-4">
                <button onClick={() => setSelectedPlayer(null)} className="px-4 py-2 bg-[#fbbf24] text-[#002a20] rounded-lg font-bold">Fermer</button>
              </div>
            </div>
          </div>
        )}

        {/* --- LISTE DU RESTE --- */}
        <div className="bg-[#001e15] rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] grow px-5 pt-6 pb-20 border-t border-[#fbbf24]/10 min-h-75">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Le Peloton</h3>
            <span className="text-[10px] text-emerald-700 font-mono">
              {filter === 'jour' ? `Classement du ${TOURNAMENT_DAYS[selectedDay - 1].date}` : 'Classement Global'}
            </span>
          </div>

          <div className="space-y-2">
            {restOfPlayers.map((player) => (
              <div key={player.id} onClick={() => { setSelectedPlayer(player); }} className="cursor-pointer flex items-center gap-4 p-3 rounded-xl bg-[#064e3b]/20 border border-[#fbbf24]/5 transition-all hover:shadow-lg">
                <div className="w-6 text-center font-bold text-emerald-500/50 font-serif text-base">
                  #{player.rank}
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                    {getPlayerPhoto(player.id) ? (
                      // Use a regular <img> so we don't need to add domains to next.config
                      <Image src={getPlayerPhoto(player.id) as string} alt={player.name} className="w-12 h-12 object-cover rounded-full" width={48} height={48} unoptimized />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#002a20] border border-emerald-500/20 flex items-center justify-center text-base font-bold text-emerald-300">{player.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-emerald-100 text-base">{player.name}</p>
                    {'niveau' in player && player.niveau && (
                      <span className="text-[10px] bg-[#064e3b]/20 text-emerald-200 px-2 py-1 rounded-full font-mono">{player.niveau}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#fbbf24] text-sm font-mono">{player.totalPoints}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}


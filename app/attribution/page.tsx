'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
const TOURNAMENT_DAYS = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 1, 19 + i);
    return {
        id: i + 1,
        label: `J${i + 1}`,
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };
});

export default function Attribution() {
    const [players, setPlayers] = useState<{ id: string; prenom?: string }[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState(1);
    const [customPoints, setCustomPoints] = useState<string>('');
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [pendingAttribution, setPendingAttribution] = useState<{type: string, points: number} | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    
    const [accumulatedPoints, setAccumulatedPoints] = useState(0);
    const [accumulationActionType, setAccumulationActionType] = useState<string | null>(null);
    const [accumulationList, setAccumulationList] = useState<Array<{type: string, points: number}>>([]);

    // Charger les joueurs depuis Supabase au montage
    useEffect(() => {
        const fetchPlayers = async () => {
            // On récupère le prénom pour n'afficher que le prénom côté UI
            const { data, error } = await supabase.from('players').select('id, prenom');
            if (!error && data) setPlayers(data);
        };
        fetchPlayers();
    }, []);

    // Préparer l'attribution, à confirmer ensuite - AVEC CUMUL POUR TOUTES LES ACTIONS
    const handlePrepareAttribution = (type: string, points: number) => {
        if (!selectedPlayer) return;
        
        // Ajouter les points au total cumulé
        const newTotal = accumulatedPoints + points;
        setAccumulatedPoints(newTotal);
        
        // Garder track de toutes les actions
        setAccumulationList([...accumulationList, { type, points }]);
        
        // Mettre à jour la préparation
        const displayType = accumulationList.length > 0 ? 'Cumul d\'actions' : type;
        setPendingAttribution({ type: displayType, points: newTotal });
        setCustomPoints('');
    };

    // Préparer une attribution avec points personnalisés
    const handlePrepareCustomAttribution = () => {
        if (!selectedPlayer || !customPoints) return;
        const points = Number(customPoints);
        if (isNaN(points)) {
            setLastAction('❌ Veuillez entrer un nombre valide');
            setTimeout(() => setLastAction(null), 3000);
            return;
        }
        setPendingAttribution({ type: 'Attribution personnalisée', points });
    };

    // Confirmer l'attribution
    const handleConfirmAttribution = async () => {
        if (!selectedPlayer || !pendingAttribution) return;
        setIsConfirming(true);
        const { type, points } = pendingAttribution;
    const playerName = players.find(p => p.id === selectedPlayer)?.prenom;
        
        try {
                // If there is an accumulation list, send the individual actions so the server
                // can insert one row per action (important for capot counting).
                const payload: any = { playerId: selectedPlayer, day: selectedDay };
                if (accumulationList.length > 0) {
                    payload.actions = accumulationList;
                } else {
                    payload.points = points;
                    payload.type = type;
                }

                const response = await fetch('/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

            const result = await response.json();

            if (result.success) {
                setLastAction(`✅ ${points > 0 ? '+' : ''}${points} pts attribués à ${playerName}`);
                setCustomPoints('');
            } else {
                setLastAction(`❌ ${result.error}`);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setLastAction('❌ Erreur lors de l\'attribution');
        } finally {
            setTimeout(() => setLastAction(null), 3000);
            setPendingAttribution(null);
            setIsConfirming(false);
            setAccumulatedPoints(0);
            setAccumulationList([]);
        }
    };

    

    return (
    <main className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-slate-900">
        
        {/* FOND (Identique) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        </div>

        {/* CONTENU */}
        <div className="relative z-10 px-5 py-8 max-w-md mx-auto flex flex-col min-h-screen">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/home" className="text-[#fbbf24] hover:text-[#fde68a] transition-colors flex items-center gap-2">
                    <span>←</span> <span className="uppercase text-xs tracking-widest font-bold">Retour</span>
                </Link>

                <h1 className="text-xl font-bold text-[#fbbf24] font-serif">Arbitrage</h1>

                <div className="flex items-center gap-2">
                    {/* Buttons moved to bottom — link removed */}
                </div>
            </div>

            {/* SÉLECTEUR DE JOUR */}
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

            {/* 1. SÉLECTION DU JOUEUR */}
            <div className="mb-8">
                <label className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2 block pl-1">Sélectionner un Joueur</label>
                <select 
                    className="w-full bg-[#064e3b]/50 border border-[#fbbf24]/30 rounded-xl p-4 text-[#fff7ed] outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] transition-all appearance-none cursor-pointer"
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    defaultValue=""
                >
                    <option value="" disabled>-- Choisir dans la liste --</option>
                    {players.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#002a20]">{p.prenom}</option>
                    ))}
                </select>
            </div>

            {/* MESSAGE DE CONFIRMATION (Feedback) */}
            {lastAction && (
                <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-center text-sm font-bold animate-pulse">
                    {lastAction}
                </div>
            )}

            {/* 2. BOUTONS D'ACTION (Grille 2x2) */}
            <div className={`grid grid-cols-2 gap-4 transition-opacity duration-300 mb-8 ${!selectedPlayer ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                
                {/* VICTOIRE CAPOT (+6) */}
                <button 
                    onClick={() => handlePrepareAttribution('Victoire Capotée', 6)}
                    className="bg-linear-to-br from-[#fbbf24] to-[#b45309] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.2)] active:scale-95 transition-transform border border-[#fde68a]/20 group"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">👑</span>
                    <div className="text-center">
                        <p className="font-bold text-[#2a1805] leading-tight">VICTOIRE<br/>CAPOT</p>
                        <p className="text-xl font-black text-[#2a1805] mt-1">+6</p>
                    </div>
                </button>

                {/* VICTOIRE SIMPLE (+3) */}
                <button 
                    onClick={() => handlePrepareAttribution('Victoire Simple', 3)}
                    className="bg-[#064e3b] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg border border-emerald-500/30 active:scale-95 transition-transform group hover:bg-[#065f46]"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">✅</span>
                    <div className="text-center">
                        <p className="font-bold text-emerald-100 leading-tight">VICTOIRE<br/>SIMPLE</p>
                        <p className="text-xl font-black text-[#fbbf24] mt-1">+3</p>
                    </div>
                </button>

                {/* DÉFAITE CAPOT (-5) */}
                <button 
                    onClick={() => handlePrepareAttribution('Défaite Capotée', -6)}
                    className="bg-[#7f1d1d] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg border border-red-500/30 active:scale-95 transition-transform group hover:bg-[#991b1b]"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">💀</span>
                    <div className="text-center">
                        <p className="font-bold text-red-100 leading-tight">DÉFAITE<br/>CAPOT</p>
                        <p className="text-xl font-black text-red-200 mt-1">-6</p>
                    </div>
                </button>

                {/* DÉFAITE SIMPLE (0) */}
                <button 
                    onClick={() => handlePrepareAttribution('Défaite Simple', 0)}
                    className="bg-[#374151] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg border border-gray-500/30 active:scale-95 transition-transform group hover:bg-[#4b5563]"
                >
                    <span className="text-3xl group-hover:scale-110 transition-transform">❌</span>
                    <div className="text-center">
                        <p className="font-bold text-gray-200 leading-tight">DÉFAITE<br/>SIMPLE</p>
                        <p className="text-xl font-black text-gray-400 mt-1">0</p>
                    </div>
                </button>

            </div>

            {/* 3. ATTRIBUTION PERSONNALISÉE */}
            <div className={`bg-[#064e3b]/30 backdrop-blur-md p-6 rounded-2xl border border-[#fbbf24]/20 mb-8 transition-opacity duration-300 ${!selectedPlayer ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/30 pb-2 mb-4">
                    ⚙️ Attribution Personnalisée
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#fbbf24] font-bold mb-2 block">Nombre de Points</label>
                        <input 
                            type="number" 
                            placeholder="Ex: 15, -7, 0..." 
                            value={customPoints}
                            onChange={(e) => setCustomPoints(e.target.value)}
                            disabled={isConfirming}
                            className="w-full bg-[#001e15] border border-[#fbbf24]/30 rounded-lg p-3 text-sm text-emerald-100 focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                    
                    <button
                        onClick={handlePrepareCustomAttribution}
                        disabled={isConfirming || !customPoints}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all
                            ${customPoints && !isConfirming
                                ? 'bg-linear-to-r from-emerald-500 to-emerald-700 text-white shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95' 
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                        `}
                    >
                        Préparer l'attribution
                    </button>
                </div>
            </div>

            {/* BOUTON DE CONFIRMATION */}
            {pendingAttribution && (
                <div className="mt-8 flex flex-col items-center">
                    {/* AFFICHAGE DU CUMUL DE POINTS */}
                    {accumulatedPoints !== 0 && (
                        <div className="mb-4 p-4 bg-[#fbbf24]/20 border border-[#fbbf24]/50 rounded-xl text-center w-full">
                            <p className="text-emerald-300 font-semibold text-sm mb-3">Cumul d'actions:</p>
                            
                            {/* Liste des actions cumulées */}
                            <div className="space-y-2 mb-3 text-left text-xs">
                                {accumulationList.map((action, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-[#001e15]/50 p-2 rounded-lg">
                                        <span className="text-emerald-300">{action.type}</span>
                                        <span className={`font-bold ${action.points > 0 ? 'text-emerald-400' : action.points < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {action.points > 0 ? '+' : ''}{action.points}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Total */}
                            <div className="border-t border-[#fbbf24]/30 pt-3">
                                <p className="text-2xl font-black text-[#fbbf24]">
                                    {accumulatedPoints > 0 ? '+' : ''}{accumulatedPoints}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={handleConfirmAttribution}
                        disabled={isConfirming}
                        className="px-8 py-3 font-bold rounded-lg shadow-lg bg-linear-to-r from-emerald-500 to-emerald-700 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 tracking-wider mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isConfirming ? 'Attribution en cours...' : `Confirmer l'attribution : ${pendingAttribution.points > 0 ? '+' : ''}${pendingAttribution.points} pts`}
                    </button>

                    {/* bouton d'annonce déplacé vers le header (disponible indépendamment) */}
                    
                    {/* Bouton Réinitialiser le cumul */}
                    {accumulationList.length > 0 && (
                        <button
                            onClick={() => {
                                setAccumulatedPoints(0);
                                setAccumulationList([]);
                                setPendingAttribution(null);
                            }}
                            className="px-6 py-2 font-bold rounded-lg text-sm text-[#fbbf24] border border-[#fbbf24]/30 hover:bg-[#fbbf24]/10 transition-all mt-3"
                        >
                            ✕ Réinitialiser le cumul
                        </button>
                    )}
                </div>
            )}

            {/* Note en bas */}
            <div className="mt-8 text-center px-8">
                <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest leading-relaxed">
                    Sélectionnez un joueur, un jour, puis l'action souhaitée.
                </p>
            </div>



        </div>
    </main>
  );
}
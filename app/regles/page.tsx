'use client';
import Link from 'next/link';

export default function Rules() {

    return (
        <main suppressHydrationWarning className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-slate-900 overflow-x-hidden">

            {/* =========================================
            1. FOND (Identique à l'accueil pour la cohérence)
           ========================================= */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Dégradé de fond */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
                {/* Motif subtil */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
            </div>

            {/* =========================================
            2. CONTENU
           ========================================= */}
            <div className="relative z-10 px-5 py-8 max-w-md mx-auto flex flex-col min-h-screen">

                {/* Boutons Retour et Suivant */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="group flex items-center gap-2 text-[#fbbf24] hover:text-[#fde68a] transition-colors pl-1">
                        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
                        <span className="font-bold uppercase tracking-wider text-xs">Retour</span>
                    </Link>
                    <Link href="/home" className="group flex items-center gap-2 text-[#fbbf24] hover:text-[#fde68a] transition-colors pr-1">
                        <span className="font-bold uppercase tracking-wider text-xs">Suivant</span>
                        <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                {/* Titre de la page */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-b from-[#fde68a] via-[#fbbf24] to-[#b45309] drop-shadow-sm font-serif mb-2">
                        Règles du Jeu
                    </h1>
                    <div className="h-1 w-24 bg-linear-to-r from-transparent via-[#fbbf24] to-transparent mx-auto opacity-50 rounded-full"></div>
                </div>

                {/* Liste des règles */}
                <div className="space-y-4 grow pb-10">

                    <RuleItem
                        icon="👥"
                        title="Format de Jeu"
                        text="Le jeu se joue en 2 équipes de 2 joueurs. Les équipiers sont assis face à face pour communiquer et coordonner leur stratégie."
                    />

                    <RuleItem
                        icon="🎯"
                        title="Objectif"
                        text="Chaque équipe doit accumuler 150 points pour remporter la partie. Le premier à atteindre ce score remporte la victoire !"
                    />

                    <RuleItem
                        icon="📊"
                        title="Les Manches"
                        text="La partie se joue en plusieurs manches. À chaque manche, l'équipe qui remporte des points se rapproche des 150 points nécessaires pour gagner la partie."
                    />

                    <RuleItem
                        icon="👥"
                        title="Distribution"
                        text="Chaque joueur reçoit 7 dominos au début de chaque manche. Gardez votre jeu secret pour surprendre l'équipe adverse !"
                    />

                    <RuleItem
                        icon="🎲"
                        title="Le Départ"
                        text="C'est le joueur possédant le double le plus élevé (ex: Double 6) qui pose la première tuile de la manche."
                    />

                    <RuleItem
                        icon="🏁"
                        title="Fin de Manche"
                        text="Une manche s'arrête quand un joueur n'a plus de tuiles, ou si le jeu est bloqué et que plus personne ne peut jouer."
                    />

                </div>

                {/* Petit footer décoratif */}
                <div className="mt-auto text-center opacity-30 text-[#fbbf24] text-xs uppercase tracking-[0.2em] font-serif">
                    ~ Domino 2026 ~
                </div>
            </div>
        </main>
    );
}

// =======================
// COMPOSANT CARTE RÈGLE
// =======================
function RuleItem({ icon, title, text }: { icon: string, title: string, text: string }) {
    return (
        <div className="group bg-[#064e3b]/40 backdrop-blur-md border border-[#fbbf24]/20 rounded-2xl p-5 flex gap-5 items-start shadow-lg hover:bg-[#064e3b]/60 transition-all duration-300">
            {/* Icône encerclée */}
            <div className="text-2xl bg-[#002a20]/60 w-12 h-12 flex items-center justify-center rounded-full border border-[#fbbf24]/30 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            {/* Texte */}
            <div>
                <h3 className="text-[#fbbf24] font-bold text-lg mb-1 font-serif tracking-wide group-hover:text-[#fde68a] transition-colors">{title}</h3>
                <p className="text-emerald-100/80 text-sm leading-relaxed font-light">{text}</p>
            </div>
        </div>
    );
}
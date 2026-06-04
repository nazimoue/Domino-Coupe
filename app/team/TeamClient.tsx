"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type Props = {
  playerFiles: string[];
  teamPhotoName?: string | null;
};

const displayName = (filename: string) => filename.replace(/\.[^/.]+$/, '');

export default function TeamClient({ playerFiles, teamPhotoName }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
        {playerFiles.map((file) => {
          const src = encodeURI(`/images/joueurs vrai/${file}`);
          return (
            <button
              key={file}
              onClick={() => setSelected(file)}
              className="bg-[#07372d] rounded-xl p-4 flex flex-col items-center text-center shadow-lg focus:outline-none"
            >
              <div className="w-28 h-28 sm:w-32 md:w-36 mb-3 rounded-full overflow-hidden border-2 border-[#fbbf24]/30">
                <Image src={src} alt={displayName(file)} className="w-full h-full object-cover" width={100} height={100} unoptimized />
              </div>
              <div className="text-sm font-semibold text-emerald-100">{displayName(file)}</div>
            </button>
          );
        })}
      </section>

      {teamPhotoName && (
        <section className="mt-12 bg-[#021d17]/40 p-6 rounded-2xl border border-[#fbbf24]/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-lg overflow-hidden flex-shrink-0 border-2 border-[#fbbf24]/30">
              <Image src={encodeURI(`/images/joueurs vrai/${teamPhotoName}`)} alt="Photo de la team" className="w-full h-full object-cover" width={200} height={200} unoptimized />
            </div>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              <p className="text-lg font-semibold text-[#fbbf24] mb-2">Durant ce mois sacré, des joueurs… mais surtout des amis</p>
              <p>
                Durant ce mois sacré, des joueurs… mais surtout des amis, des frères de longue date, aux niveaux de jeu et
                aux compétences différents, vont se retrouver pour une aventure unique. Chaque soir, pendant 30 jours, ils
                s’affronteront deux contre deux, dans un esprit de compétition saine, de passion et de respect. À la fin,
                les 5 meilleurs seront récompensés, et un seul portera la couronne :
              </p>
              <p className="font-bold text-2xl mt-3">👑 le roi du capot, qui aura droit à une surprise spéciale.</p>
              <p className="mt-3">
                Donnez le meilleur de vous‑mêmes, jouez avec le cœur, ayez la grinta, la rage de vaincre et l’envie de vous
                dépasser, comme le duo de choc RR 🔥 Que le meilleur gagne, mais n’oubliez jamais : ce n’est qu’un jeu.
              </p>
              <p className="mt-3">Et surtout, au‑delà des scores et des victoires, que cette compétition reste un moment de partage, car l’amitié sincère et la fraternité vraie sont les seules victoires qui durent pour toujours 🤍🤝</p>
            </div>
          </div>
        </section>
      )}

      {/* Modal / Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative bg-[#001e15] rounded-lg p-6 max-w-lg w-full shadow-xl border border-[#fbbf24]/20">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-2xl">✕</button>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-lg overflow-hidden border-2 border-[#fbbf24]/30">
                <Image src={encodeURI(`/images/joueurs vrai/${selected}`)} alt={displayName(selected)} className="w-full h-full object-cover" width={200} height={200} unoptimized />
              </div>
              <div className="text-xl font-bold text-emerald-100">{displayName(selected)}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

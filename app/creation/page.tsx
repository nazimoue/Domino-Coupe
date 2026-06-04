"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

type Player = {
  id: number;
  prenom?: string;
  name?: string;
  photo?: string | null;
  niveau?: string;
};

export default function CreationJoueur() {
  // --- ÉTATS (STATES) ---
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [niveau, setNiveau] = useState('médiocre');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Gestion de la liste des joueurs (Ajout/Suppression)
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Charger les joueurs au montage
  useEffect(() => {
    fetchPlayers();
  }, []);

  // Récupérer la liste des joueurs
  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players');
      const result = await response.json();
      if (result.success) {
        setPlayers(result.data || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
    }
  };

  // --- FONCTIONS ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation simple côté client : type et taille
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5 MB

      if (!allowedTypes.includes(file.type)) {
        setFeedback('❌ Type d\'image non supporté. Utilisez PNG / JPEG / WEBP.');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      if (file.size > maxSize) {
        setFeedback('❌ Image trop lourde. Maximum 5 MB.');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Nom n'est plus requis côté UI — on valide seulement le prénom
    if (!prenom) {
      setFeedback('❌ Veuillez remplir le prénom');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl: string | null = null;

      // Si un fichier est sélectionné, on tente d'uploader vers Supabase Storage
      if (photoFile) {
        try {
          // Nom de bucket attendu : 'player-photos' (créé dans Supabase Storage)
          const fileExt = photoFile.name.split('.').pop();
          const filePath = `players/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('player-photos')
            .upload(filePath, photoFile as File);

          if (uploadError) {
            console.error('Upload Supabase error:', uploadError);
            // fallback : envoyer data URL au serveur (déjà géré côté API)
            const reader = new FileReader();
            photoUrl = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(photoFile as File);
            });
          } else {
            // Récupérer l'URL publique
            const { data: publicData } = supabase.storage.from('player-photos').getPublicUrl(filePath);
            photoUrl = publicData?.publicUrl || null;
          }
        } catch (error: unknown) {
          console.error('Erreur upload supabase:', error);
          // fallback to data URL
          const reader = new FileReader();
          photoUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photoFile as File);
          });
        }
      }

      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // On envoie toujours `name` au serveur pour garder la compatibilité
          // mais on le remplit automatiquement avec le prénom si vide.
          name: nom.trim() || prenom.trim(),
          prenom: prenom.trim(),
          photo: photoUrl,
          niveau,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFeedback(`✅ ${prenom} a été ajouté avec succès!`);
        setNom('');
        setPrenom('');
        setNiveau('médiocre');
        setPhotoPreview(null);
        setPhotoFile(null);
        fetchPlayers(); // Rafraîchir la liste
      } else {
        setFeedback(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFeedback('❌ Erreur lors de la création du joueur');
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    const playerToDelete = players.find(p => String(p.id) === String(selectedDeleteId));
    if (!playerToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedDeleteId }),
      });

      const result = await response.json();

      if (result.success) {
        setPlayers(players.filter(p => String(p.id) !== String(selectedDeleteId)));
        // Afficher seulement le prénom dans le feedback
        setFeedback(`🗑️ ${playerToDelete.prenom} a été supprimé.`);
        setSelectedDeleteId('');
        setTimeout(() => fetchPlayers(), 500); // Rafraîchir la liste
      } else {
        setFeedback(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFeedback('❌ Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <main suppressHydrationWarning className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-slate-900 pb-20">

      {/* FOND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
        <div className="absolute inset-0 opacity-20" style={mounted ? { backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' } : undefined}></div>
      </div>

      {/* CONTENU */}
      <div className="relative z-10 px-5 py-8 max-w-md mx-auto flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/home" className="text-[#fbbf24] hover:text-[#fde68a] transition-colors flex items-center gap-2">
            <span>←</span> <span className="uppercase text-xs tracking-widest font-bold">Retour</span>
          </Link>
          <h1 className="text-xl font-bold text-[#fbbf24] font-serif">Gestion Joueurs</h1>
        </div>

        {/* FEEDBACK GÉNÉRAL */}
        {feedback && (
          <div className="mb-6 p-4 bg-[#fbbf24]/20 border border-[#fbbf24] rounded-xl text-[#fbbf24] text-center text-sm font-bold animate-pulse">
            {feedback}
          </div>
        )}

        {/* =========================================
                SECTION 1 : AJOUTER (Formulaire Vert/Or)
               ========================================= */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#064e3b]/30 backdrop-blur-md p-6 rounded-2xl border border-[#fbbf24]/20 shadow-xl mb-12">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-emerald-500/30 pb-2 mb-4">
            ✨ Créer un nouveau joueur
          </h2>

          {/* Photo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-[#fbbf24]/50 flex items-center justify-center overflow-hidden bg-[#002a20]/50 group hover:border-[#fbbf24] transition-colors cursor-pointer">
              {photoPreview ? (
                <Image src={photoPreview} alt="Aperçu" fill className="object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-3xl">📷</span>
                  <p className="text-[9px] text-emerald-300 mt-1 uppercase">Photo</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isLoading} />
            </div>
          </div>

          {/* Champs Texte (seulement Prénom) */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-[#fbbf24] font-bold">Prénom</label>
              <input
                type="text"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#001e15] border border-[#fbbf24]/30 rounded-lg p-3 text-sm text-emerald-100 focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] outline-none transition-all disabled:opacity-50" />
            </div>
          </div>

          {/* Niveau (attribué automatiquement) */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#fbbf24] font-bold">Niveau</label>
            <div className="p-3 bg-[#001e15] rounded-lg border border-[#fbbf24]/20 text-sm text-emerald-300">
              <span className="capitalize font-bold">médiocre</span>
              <p className="text-xs text-emerald-400 mt-1">Attribué automatiquement à la création</p>
            </div>
            {/* Valeur envoyée en dur au backend */}
            <input type="hidden" name="niveau" value={niveau} />
          </div>

          <button
            type="submit"
            disabled={isLoading || !prenom}
            className="w-full bg-linear-to-r from-[#b45309] via-[#fbbf24] to-[#b45309] text-[#2a1805] font-bold py-3 rounded-xl shadow-lg mt-2 hover:scale-[1.02] active:scale-95 transition-transform uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>


        {/* =========================================
                SECTION 2 : SUPPRIMER (Zone Rouge)
               ========================================= */}
        <div className="bg-[#450a0a]/40 backdrop-blur-md p-6 rounded-2xl border border-red-500/30 shadow-xl">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest border-b border-red-500/30 pb-2 mb-4 flex items-center gap-2">
            💀 Zone de Suppression
          </h2>

          <p className="text-xs text-red-200/60 mb-4 leading-relaxed">
            Attention, cette action est irréversible. Le joueur sera retiré du tournoi.
          </p>

          <div className="space-y-4">
            <select
              className="w-full bg-[#1a0505] border border-red-500/30 rounded-xl p-3 text-red-100 outline-none focus:border-red-500 transition-all appearance-none cursor-pointer text-sm"
              value={selectedDeleteId}
              onChange={(e) => setSelectedDeleteId(e.target.value)}
            >
              <option value="" disabled>-- Choisir le joueur à supprimer --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.prenom}</option>
              ))}
            </select>

            <button
              onClick={handleDelete}
              disabled={!selectedDeleteId || isLoading}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all
                            ${selectedDeleteId && !isLoading
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-500 cursor-pointer active:scale-95'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}
                        `}
            >
              <span>🗑️</span> {isLoading ? 'Suppression...' : 'Supprimer Définitivement'}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
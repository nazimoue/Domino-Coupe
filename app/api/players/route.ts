import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, prenom, photo, niveau } = body;

    // Validation basique
    if (!name || !prenom) {
      return NextResponse.json(
        { error: 'Le nom et le prénom sont requis' },
        { status: 400 }
      );
    }

    // Normaliser le niveau reçu (UI peut envoyer 'médiocre' en français)
    const normalizeNiveau = (n?: string) => {
      if (!n) return 'MEDIOCRE';
      const s = String(n).trim().toLowerCase();
      if (['mediocre', 'médiocre'].includes(s)) return 'MEDIOCRE';
      if (s === 'faible') return 'FAIBLE';
      if (s === 'moyen') return 'MOYEN';
      if (s === 'fort') return 'FORT';
      if (['très fort', 'tres fort', 'tres_fort', 'tres-fort'].includes(s)) return 'TRES_FORT';
      // fallback
      return 'MEDIOCRE';
    };

    // Préparer les données à insérer
    const playerData: any = {
      name,
      prenom,
      photo: null,
      niveau: normalizeNiveau(niveau),
    };

    // Validation serveur simple : éviter les data URLs trop volumineuses
    if (photo && typeof photo === 'string') {
      // Si c'est une data URL, limiter sa longueur (approx pour 5MB d'image encodée en base64)
      // 5 MB raw -> ~7 MB base64, donc on met une limite sûre à 7_000_000 caractères
      if (photo.startsWith('data:') && photo.length > 7_000_000) {
        return NextResponse.json(
          { error: 'Image trop volumineuse. Réduisez la taille avant envoi (max 5 MB).' },
          { status: 413 }
        );
      }
      // Si c'est une URL publique, vérifier une longueur raisonnable
      if ((photo.startsWith('http://') || photo.startsWith('https://')) && photo.length > 2000) {
        return NextResponse.json(
          { error: 'URL de l\'image invalide ou trop longue.' },
          { status: 400 }
        );
      }
    }

    // Stocker la photo comme chaîne (data URL) si elle existe.
    // La table `players` utilise actuellement une colonne TEXT pour `photo`.
    // Nous enregistrons donc une data URL complète (ex: "data:image/png;base64,....")
    // qui s'affichera directement dans les balises <img> ou <Image> côté client.
    if (photo) {
      try {
        if (typeof photo === 'string') {
          // Accept data URLs (data:...), public URLs (http:// or https://) or filesystem-relative paths (/...)
          if (photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('/')) {
            playerData.photo = photo;
          } else {
            // Si le client envoie uniquement du base64, on préfixe avec un type par défaut JPEG
            playerData.photo = `data:image/jpeg;base64,${photo}`;
          }
        } else {
          // Si le payload n'est pas une chaîne, ignorer la photo
          playerData.photo = null;
        }
      } catch (error) {
        console.error('Erreur traitement photo:', error);
        playerData.photo = null;
      }
    }

    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: `Erreur lors de la création du joueur: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase GET:', error);
      return NextResponse.json(
        { error: `Erreur lors de la récupération des joueurs: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'L\'ID du joueur est requis' },
        { status: 400 }
      );
    }

    // Récupérer le joueur pour éventuellement supprimer la photo du storage
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('photo')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erreur fetch joueur avant suppression:', fetchError);
      return NextResponse.json({ error: `Erreur: ${fetchError.message}` }, { status: 500 });
    }

    // Si la photo est une URL publique Supabase Storage, tenter de supprimer l'objet
    try {
      const photoVal = existingPlayer?.photo;
      if (photoVal && typeof photoVal === 'string') {
        // Détecter un chemin public Supabase contenant le bucket 'player-photos'
        // Exemple d'URL: https://xyz.supabase.co/storage/v1/object/public/player-photos/players/xxx.jpg
        const match = photoVal.match(/player-photos\/(.+)$/);
        if (match && match[1]) {
          const objectPath = match[1];
          const { error: removeError } = await supabase.storage.from('player-photos').remove([objectPath]);
          if (removeError) {
            console.warn('Impossible de supprimer l\'objet storage (non bloquant):', removeError);
          }
        }
      }
    } catch (err) {
      console.warn('Erreur lors suppression photo storage (non bloquant):', err);
    }

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur Supabase DELETE:', error);
      return NextResponse.json(
        { error: `Erreur lors de la suppression: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

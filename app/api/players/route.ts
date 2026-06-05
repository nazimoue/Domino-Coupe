import { createPlayer, deletePhoto, deletePlayer, fetchAllPlayers, getPlayerById } from '@/lib/db.server';
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
    const playerData: Record<string, unknown> = {
      name,
      nom: String(name ?? '').trim() || String(prenom ?? '').trim(),
      prenom: String(prenom ?? '').trim(),
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
    const data = await createPlayer(playerData);


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
    const data = await fetchAllPlayers();
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

    const playerToDelete = (await getPlayerById(Number(id))) as { photo?: string } | null;

    if (playerToDelete?.photo) {
      try {
        await deletePhoto(String(playerToDelete.photo));
      } catch (err) {
        console.warn('Erreur lors de la suppression de la photo (non bloquante):', err);
      }
    }

    await deletePlayer(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

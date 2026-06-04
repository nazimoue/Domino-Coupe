import { getPlayerById, updatePlayerPhoto } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// PUT: update player's photo (and delete old storage object if present)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolved = await params;
    const id = Number(resolved.id);
    if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

    const body = await request.json();
    const { photo } = body;

    // Récupérer le joueur existant
    const existingPlayer = await getPlayerById(id);


    let newPhotoValue: string | null = null;

    // Si le client envoie une data URL, on upload vers storage
    if (photo && typeof photo === 'string') {
      if (photo.startsWith('data:')) {
        // extraire mime & base64
        const matches = photo.match(/^data:(.+);base64,(.+)$/);
        if (!matches) return NextResponse.json({ error: 'Data URL invalide' }, { status: 400 });
        const mime = matches[1];
        const base64 = matches[2];
        const buffer = Buffer.from(base64, 'base64');
        const ext = mime.split('/')[1] || 'jpg';
        const filePath = `players/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from('player-photos').upload(filePath, buffer, { contentType: mime });
        if (uploadError) {
          console.error('Upload error:', uploadError);
          return NextResponse.json({ error: 'Erreur upload image' }, { status: 500 });
        }
        const { data: publicData } = supabase.storage.from('player-photos').getPublicUrl(filePath);
        newPhotoValue = publicData?.publicUrl || null;
      } else if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('/')) {
        // public URL already
        newPhotoValue = photo;
      } else {
        // base64 pur
        newPhotoValue = `data:image/jpeg;base64,${photo}`;
      }
    }

    // Supprimer l'ancien objet Storage si présent (pattern player-photos/...)
    try {
      const oldPhoto = existingPlayer?.photo;
      if (oldPhoto && typeof oldPhoto === 'string') {
        const match = oldPhoto.match(/player-photos\/(.+)$/);
        if (match && match[1]) {
          const objectPath = match[1];
          const { error: removeError } = await supabase.storage.from('player-photos').remove([objectPath]);
          if (removeError) console.warn('Suppression ancien objet storage non critique:', removeError.message);
        }
      }
    } catch (err) {
      console.warn('Erreur suppression ancien objet (non bloquant):', err);
    }

    // Mettre à jour la DB
    await updatePlayerPhoto(id, newPhotoValue);

    return NextResponse.json({ success: true, photo: newPhotoValue });
  } catch (error: unknown) {
    console.error('Erreur PUT player photo:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // simple helper: retourner le player
  try {
    const resolved = await params;
    const id = Number(resolved.id);
    if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    try {
      const data = await getPlayerById(id);
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

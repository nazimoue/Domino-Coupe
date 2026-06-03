import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

// Endpoint server-side pour migrer les photos stockées en data URLs vers Supabase Storage.
// Sécurisé par une clef simple à fournir dans le body: { secret: process.env.MIGRATE_PHOTOS_SECRET }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secret = body?.secret;

    if (!process.env.MIGRATE_PHOTOS_SECRET) {
      return NextResponse.json({ error: 'Migration disabled: MIGRATE_PHOTOS_SECRET not set' }, { status: 403 });
    }

    if (secret !== process.env.MIGRATE_PHOTOS_SECRET) {
      return NextResponse.json({ error: 'Secret invalide' }, { status: 403 });
    }

    // Récupérer tous les joueurs
    const { data: players, error: fetchError } = await supabase.from('players').select('id, photo');
    if (fetchError) {
      console.error('Erreur fetch players:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const migrated: Array<{ id: number; url?: string; error?: string }> = [];

    for (const p of players || []) {
      try {
        const photo = p.photo as any;
        if (!photo || typeof photo !== 'string') {
          continue; // rien à migrer
        }

        // Si c'est déjà une URL publique, on skip
        if (photo.startsWith('http://') || photo.startsWith('https://')) {
          migrated.push({ id: p.id, url: photo });
          continue;
        }

        // Si ce n'est pas une data URL, mais probablement base64, traiter aussi
        let mime = 'image/jpeg';
        let base64Data: string | null = null;

        if (photo.startsWith('data:')) {
          // data:<mime>;base64,<data>
          const matches = photo.match(/^data:(.+);base64,(.+)$/);
          if (!matches) {
            migrated.push({ id: p.id, error: 'Data URL non reconnue' });
            continue;
          }
          mime = matches[1];
          base64Data = matches[2];
        } else {
          // supposer base64 pur
          base64Data = photo;
        }

        if (!base64Data) {
          migrated.push({ id: p.id, error: 'Pas de base64 détecté' });
          continue;
        }

        const buffer = Buffer.from(base64Data, 'base64');
        // Détection extension basique
        const ext = mime.split('/')[1] || 'jpg';
        const filePath = `players/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from('player-photos').upload(filePath, buffer, { contentType: mime });
        if (uploadError) {
          console.error('Erreur upload:', uploadError);
          migrated.push({ id: p.id, error: uploadError.message });
          continue;
        }

        const { data: publicData } = supabase.storage.from('player-photos').getPublicUrl(filePath);
        const publicUrl = publicData?.publicUrl || null;

        if (!publicUrl) {
          migrated.push({ id: p.id, error: 'Impossible d\'obtenir publicUrl' });
          continue;
        }

        // Mettre à jour le joueur
        const { error: updateError } = await supabase.from('players').update({ photo: publicUrl }).eq('id', p.id);
        if (updateError) {
          migrated.push({ id: p.id, error: updateError.message });
          continue;
        }

        migrated.push({ id: p.id, url: publicUrl });
      } catch (err: any) {
        migrated.push({ id: p.id, error: err?.message || String(err) });
      }
    }

    return NextResponse.json({ success: true, migrated });
  } catch (error: any) {
    console.error('Erreur migration:', error);
    return NextResponse.json({ error: error?.message || 'Erreur inconnue' }, { status: 500 });
  }
}

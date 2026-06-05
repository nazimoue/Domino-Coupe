import { NextRequest, NextResponse } from 'next/server';
import { fetchAllPlayers, updatePlayerPhoto, uploadPhoto } from '@/lib/db.server';

// Endpoint server-side pour migrer les photos stockées en data URLs vers Supabase Storage.
// Sécurisé par une clef simple à fournir dans le body: { secret: process.env.MIGRATE_PHOTOS_SECRET }

function getMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  try {
    return String(e);
  } catch {
    return 'Unknown error';
  }
}

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

    const players = await fetchAllPlayers();
    const playerList = Array.isArray(players) ? players : [];

    const migrated: Array<{ id: number; url?: string; error?: string }> = [];

    for (const p of playerList) {
      try {
        const photo = p.photo as unknown;
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
        const ext = mime.split('/')[1] || 'jpg';
        const filePath = `players/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const publicUrl = await uploadPhoto(buffer, mime, filePath);
        if (!publicUrl) {
          migrated.push({ id: p.id, error: 'Impossible d\'uploader la photo' });
          continue;
        }

        if (!publicUrl) {
          migrated.push({ id: p.id, error: 'Impossible d\'obtenir publicUrl' });
          continue;
        }

        await updatePlayerPhoto(Number(p.id), publicUrl);

        migrated.push({ id: p.id, url: publicUrl });
      } catch (err: unknown) {
        migrated.push({ id: p.id, error: getMessage(err) });
      }
    }

    return NextResponse.json({ success: true, migrated });
  } catch (error: unknown) {
    console.error('Erreur migration:', error);
    return NextResponse.json({ error: getMessage(error) || 'Erreur inconnue' }, { status: 500 });
  }
}

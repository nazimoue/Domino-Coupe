import { getPlayerById, updatePlayerPhoto } from '@/lib/dbFacade.server';
import { NextRequest, NextResponse } from 'next/server';

// PUT: update player's photo (and delete old storage object if present)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolved = await params;
    const id = Number(resolved.id);
    if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

    const body = await request.json();
    const { photo } = body;

    let newPhotoValue: string | null = null;
    if (photo && typeof photo === 'string') {
      newPhotoValue = photo;
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

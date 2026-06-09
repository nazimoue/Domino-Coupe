import { createPlayer, deletePlayer, fetchAllPlayers, getPlayerById, uploadPhoto } from '@/lib/dbFacade.server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const prenom = formData.get('prenom') as string | null;
    const niveau = formData.get('niveau') as string | null;
    const photoFile = formData.get('photo') as File | null;

    if (!name || !prenom) {
      return NextResponse.json(
        { error: 'Le nom et le prénom sont requis' },
        { status: 400 }
      );
    }

    const normalizeNiveau = (n?: string) => {
      if (!n) return 'MEDIOCRE';
      const s = n.trim().toLowerCase();
      if (['mediocre', 'médiocre'].includes(s)) return 'MEDIOCRE';
      if (s === 'faible') return 'FAIBLE';
      if (s === 'moyen') return 'MOYEN';
      if (s === 'fort') return 'FORT';
      if (['très fort', 'tres fort', 'tres_fort', 'tres-fort'].includes(s)) return 'TRES_FORT';
      return 'MEDIOCRE';
    };

    const playerData: Record<string, unknown> = {
      name,
      nom: (name ?? '').trim() || (prenom ?? '').trim(),
      prenom: (prenom ?? '').trim(),
      photo: null,
      niveau: normalizeNiveau(niveau ?? undefined),
    };

    if (photoFile && photoFile.size > 0) {
      try {
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const filePath = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadPhoto(buffer, photoFile.type, filePath);
        if (url) playerData.photo = url;
      } catch (err) {
        console.error('Erreur upload photo:', err);
      }
    }

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

export async function GET(request: NextRequest) {
  try {
    const includePhotos = request.nextUrl.searchParams.get('includePhotos') === 'true';
    const data = await fetchAllPlayers();
    const list = Array.isArray(data) ? data : [];
    if (!includePhotos) {
      return NextResponse.json({
        success: true,
        data: list.map((p: Record<string, unknown>) => {
          const { photo, ...rest } = p;
          return rest;
        }),
      });
    }
    return NextResponse.json({ success: true, data: list });
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

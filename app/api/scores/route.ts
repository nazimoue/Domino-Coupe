import { NextRequest, NextResponse } from 'next/server';
import { createScore, getScores } from '@/lib/dbFacade.server';

// POST: add a score or batch of scores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, points, type, day, actions } = body;

    // Validation
    if (!playerId || ((points === undefined || points === null) && !Array.isArray(actions))) {
      return NextResponse.json({ error: 'Le joueur et les points (ou actions) sont requis' }, { status: 400 });
    }

    // Normaliser l'ID du joueur
    const tryAsNumber = (v: unknown): string | number => {
      if (typeof v === 'string' && v.trim() !== '' && /^-?\d+$/.test(v)) {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
      return v as string | number;
    };
    const normalizedPlayerId = tryAsNumber(playerId) as string | number;

    type ScoreEntry = {
      player_id: number | string;
      points: number;
      type: string;
      day: number;
      date: string;
    };
    const toInsert: ScoreEntry[] = [];

    if (Array.isArray(actions) && actions.length > 0) {
      for (const a of actions) {
        const obj: ScoreEntry = {
          player_id: normalizedPlayerId,
          points: Number(a.points),
          type: a.type,
          day: day || 1,
          date: new Date().toISOString(),
        };
        toInsert.push(obj);
      }
    } else {
      const obj: ScoreEntry = {
        player_id: normalizedPlayerId,
        points: Number(points),
        type,
        day: day || 1,
        date: new Date().toISOString(),
      };
      toInsert.push(obj);
    }

    const inserted = [];
    for (const entry of toInsert) {
      const res = await createScore(entry);
      inserted.push(res);
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    const msg = error instanceof Error ? error.message : typeof error === 'object' && error ? JSON.stringify(error) : String(error);
    console.error('Erreur serveur:', msg);
    return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 });
  }
}

// GET: fetch scores, optionally filtered by playerId and/or day
export async function GET(request: NextRequest) {
    try {
      const playerId = request.nextUrl.searchParams.get('playerId');
      const day = request.nextUrl.searchParams.get('day');
      const filters: { playerId?: string | number; day?: number } = {};
      if (playerId) filters.playerId = playerId;
      if (day) filters.day = Number(day);
      const data = await getScores(filters);
      return NextResponse.json({ success: true, data });
    } catch (error) {
      const msg = error instanceof Error ? error.message : typeof error === 'object' && error ? JSON.stringify(error) : String(error);
      console.error('Erreur serveur:', msg);
      return NextResponse.json({ error: `Erreur serveur: ${msg}` }, { status: 500 });
    }
  }

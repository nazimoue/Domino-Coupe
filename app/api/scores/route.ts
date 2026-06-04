import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a server-side Supabase client using the service role key when available.
// This client must NEVER be exposed to the browser. Keep service key only on server env (Vercel).
const _supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const _serviceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseServer = _serviceKey && _supabaseUrl ? createClient(_supabaseUrl, _serviceKey) : supabase;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, points, type, day, actions } = body;

    // Validation
    if (!playerId || ((points === undefined || points === null) && !Array.isArray(actions))) {
      return NextResponse.json(
        { error: 'Le joueur et les points (ou actions) sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le joueur existe (diagnostic pour éviter violation FK)
    // Normaliser l'ID: si l'ID client est une string numérique, convertir en nombre
    let normalizedPlayerId: any = playerId;
    const tryAsNumber = (v: any) => {
      if (typeof v === 'string' && v.trim() !== '' && /^-?\d+$/.test(v)) {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
      return v;
    };

    normalizedPlayerId = tryAsNumber(playerId);

    try {
      // Première tentative avec la valeur telle quelle
      const { data: playerCheck, error: playerCheckError } = await supabase
        .from('players')
        .select('id')
        .eq('id', normalizedPlayerId)
        .limit(1);

      if (playerCheckError) {
        console.error('Erreur Supabase (player check):', playerCheckError);
        return NextResponse.json({ error: `Erreur vérification joueur: ${playerCheckError.message}` }, { status: 500 });
      }

      // Si non trouvé et que la version string/number diffère, réessayer avec l'autre forme
      const found = Array.isArray(playerCheck) && playerCheck.length > 0;
      if (!found) {
        const altId = typeof normalizedPlayerId === 'number' ? String(normalizedPlayerId) : tryAsNumber(String(normalizedPlayerId));
        if (altId !== normalizedPlayerId) {
          const { data: altCheck, error: altError } = await supabase
            .from('players')
            .select('id')
            .eq('id', altId)
            .limit(1);

          if (altError) {
            console.error('Erreur Supabase (player alt check):', altError);
            return NextResponse.json({ error: `Erreur vérification joueur: ${altError.message}` }, { status: 500 });
          }

          if (Array.isArray(altCheck) && altCheck.length > 0) {
            // utiliser altId si trouvé
            normalizedPlayerId = altId;
          } else {
            return NextResponse.json({ error: `Joueur introuvable (id=${playerId}). Vérifiez que la création a bien persisté en base.` }, { status: 400 });
          }
        } else {
          return NextResponse.json({ error: `Joueur introuvable (id=${playerId}). Vérifiez que la création a bien persisté en base.` }, { status: 400 });
        }
      }
    } catch (err) {
      console.error('Erreur check joueur:', err);
      return NextResponse.json({ error: `Erreur check joueur: ${err instanceof Error ? err.message : 'Erreur inconnue'}` }, { status: 500 });
    }

    // Vérifier et mettre à jour le compteur de matchs si la colonne existe
    let matchesPlayed: number | null = null;
    let hasMatchCountColumn = true;

    try {
      const { data: playerMatchData, error: playerMatchError } = await supabaseServer
        .from('players')
        .select('matches_played')
        .eq('id', normalizedPlayerId)
        .single();

      if (playerMatchError) {
        if (String(playerMatchError.message).toLowerCase().includes('matches_played')) {
          hasMatchCountColumn = false;
        } else {
          console.error('Erreur Supabase matches_played:', playerMatchError);
          return NextResponse.json({ error: `Erreur vérification compteur de matchs: ${playerMatchError.message}` }, { status: 500 });
        }
      } else {
        matchesPlayed = Number(playerMatchData?.matches_played ?? 0);
      }
    } catch (err) {
      // Si la colonne n'existe pas encore, on continue sans compteur
      if (err instanceof Error && err.message.toLowerCase().includes('matches_played')) {
        hasMatchCountColumn = false;
      } else {
        console.error('Erreur fetch matches_played:', err);
        return NextResponse.json({ error: `Erreur vérification compteur de matchs: ${err instanceof Error ? err.message : 'Erreur inconnue'}` }, { status: 500 });
      }
    }

    if (hasMatchCountColumn && matchesPlayed !== null && matchesPlayed >= 180) {
      return NextResponse.json({ error: 'Ce joueur a déjà joué ses 180 matchs.' }, { status: 400 });
    }

    // Détecter noms de colonnes (snake_case ou camelCase)
    const detect = await supabaseServer.from('score').select('*').limit(1);
    const sampleRow = Array.isArray(detect.data) ? detect.data[0] : null;
    const has = (k: string) => sampleRow && Object.prototype.hasOwnProperty.call(sampleRow, k);

    const playerCol = has('playerId') ? 'playerId' : has('player_id') ? 'player_id' : 'player_id';
    const pointsCol = has('points') ? 'points' : has('score') ? 'score' : 'points';
    const typeCol = has('type') ? 'type' : has('type') ? 'type' : 'type';
    const dayCol = has('day') ? 'day' : has('game_id') ? 'game_id' : 'day';
    const dateCol = has('date') ? 'date' : has('created_at') ? 'created_at' : 'date';

    // Construire les objets d'insertion selon le mapping détecté
    const toInsert: any[] = [];

    if (Array.isArray(actions) && actions.length > 0) {
      for (const a of actions) {
        const obj: any = {};
        obj[playerCol] = normalizedPlayerId;
        obj[pointsCol] = Number(a.points);
        if (a.type) obj[typeCol] = a.type;
        obj[dayCol] = day || 1;
        obj[dateCol] = new Date().toISOString();
        toInsert.push(obj);
      }
    } else {
      const insertObj: any = {};
      insertObj[playerCol] = normalizedPlayerId;
      insertObj[pointsCol] = Number(points);
      if (type) insertObj[typeCol] = type;
      insertObj[dayCol] = day || 1;
      insertObj[dateCol] = new Date().toISOString();
      toInsert.push(insertObj);
    }

    const { data, error } = await supabaseServer.from('score').insert(toInsert).select();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: `Erreur lors de l'attribution: ${error.message}` },
        { status: 500 }
      );
    }

    if (hasMatchCountColumn && matchesPlayed !== null) {
      try {
        const newMatchCount = Math.min(180, matchesPlayed + 1);
        await supabaseServer
          .from('players')
          .update({ matches_played: newMatchCount })
          .eq('id', normalizedPlayerId);
      } catch (updateError) {
        console.error('Erreur mise à jour matches_played:', updateError);
      }
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

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');
    const day = request.nextUrl.searchParams.get('day');

    // Détecter mapping de colonnes pour les requêtes
    const detectQ = await supabaseServer.from('score').select('*').limit(1);
    const sample = Array.isArray(detectQ.data) ? detectQ.data[0] : null;
    const hasQ = (k: string) => sample && Object.prototype.hasOwnProperty.call(sample, k);
    const playerColQ = hasQ('playerId') ? 'playerId' : hasQ('player_id') ? 'player_id' : 'player_id';
    const pointsColQ = hasQ('points') ? 'points' : hasQ('score') ? 'score' : 'score';
    const dayColQ = hasQ('day') ? 'day' : hasQ('game_id') ? 'game_id' : 'game_id';
    const dateColQ = hasQ('date') ? 'date' : hasQ('created_at') ? 'created_at' : 'date';

    let query = supabaseServer.from('score').select('*');

    if (playerId) {
      query = query.eq(playerColQ, playerId);
    }

    if (day) {
      query = query.eq(dayColQ, Number(day));
    }

    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await query
        .order(dateColQ, { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error('Erreur Supabase:', error);
        return NextResponse.json(
          { error: `Erreur: ${error.message}` },
          { status: 500 }
        );
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
      }

      if (!data || data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    }

    return NextResponse.json({ success: true, data: allData });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    );
  }
}

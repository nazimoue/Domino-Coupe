// Supabase-specific DB implementation
// All functions match the generic DBProvider interface.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    client = createClient(url, anonKey);
  }
  return client;
}

export async function authSignIn(email: string, password: string) {
  return getClient().auth.signInWithPassword({ email, password });
}

export async function authGetUser() {
  return getClient().auth.getUser();
}

export async function authSignOut() {
  return getClient().auth.signOut();
}

export async function uploadPhoto(buffer: Buffer, mime: string, filePath: string) {
  const bucket = process.env.SUPABASE_BUCKET || 'players';
  const { error } = await getClient().storage.from(bucket).upload(filePath, buffer, { contentType: mime });
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  const { data } = getClient().storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl ?? null;
}

export async function deletePhoto(publicUrl: string) {
  const match = publicUrl.match(/players\/(.+)$/);
  if (match?.[1]) {
    const bucket = process.env.SUPABASE_BUCKET || 'players';
    const { error } = await getClient().storage.from(bucket).remove([match[1]]);
    if (error) console.warn('Failed to delete storage object:', error);
  }
}

export async function createPlayer(entry: Record<string, unknown>) {
  const { data, error } = await getClient().from('players').insert([entry]).select();
  if (error) throw error;
  return data;
}

export async function deletePlayer(id: number) {
  const { error } = await getClient().from('players').delete().eq('id', id);
  if (error) throw error;
}

export async function getPlayerById(id: number) {
  const { data, error } = await getClient().from('players').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function updatePlayerPhoto(id: number, photoUrl: string | null) {
  const { data, error } = await getClient().from('players').update({ photo: photoUrl }).eq('id', id).select();
  if (error) throw error;
  return data;
}

export async function createScore(entry: Record<string, unknown>) {
  const { data, error } = await getClient().from('score').insert([entry as any]).select();
  if (error) throw error;
  return data;
}

export async function getScores(filters: { playerId?: string | number; day?: number }) {
  let query = getClient().from('score').select('*');
  if (filters.playerId !== undefined) query = query.eq('player_id', filters.playerId);
  if (filters.day !== undefined) query = query.eq('day', filters.day);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function setUserRole(userId: string, role: string) {
  // Admin client required for role updates – use service key if available
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', serviceKey);
  const { error } = await admin.auth.admin.updateUserById(userId, { user_metadata: { role } });
  if (error) throw error;
  return { success: true };
}

export async function fetchAllPlayers() {
  const { data, error } = await getClient().from('players').select('id, prenom, matches_played, nom, photo, niveau');
  if (error) throw error;
  return data;
}

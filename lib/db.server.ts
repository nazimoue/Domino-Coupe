// Server-side database abstraction layer – provider-agnostic DB/storage access.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/app/generated/prisma/client';

interface DBProvider {
  authSignIn(email: string, password: string): Promise<unknown>;
  authGetUser(): Promise<unknown>;
  authSignOut(): Promise<unknown>;
  uploadPhoto(buffer: Buffer, mime: string, filePath: string): Promise<string | null>;
  deletePhoto(publicUrl: string): Promise<void>;
  createPlayer(entry: Record<string, unknown>): Promise<unknown>;
  deletePlayer(id: number): Promise<void>;
  getPlayerById(id: number): Promise<unknown>;
  updatePlayerPhoto(id: number, photoUrl: string | null): Promise<unknown>;
  createScore(entry: Record<string, unknown>): Promise<unknown>;
  getScores(filters: { playerId?: string | number; day?: number }): Promise<unknown>;
  setUserRole(userId: string, role: string): Promise<unknown>;
  fetchAllPlayers(): Promise<unknown>;
}

class SupabaseProvider implements DBProvider {
  private client: SupabaseClient;
  private adminClient: SupabaseClient | null = null;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    this.client = createClient(url, anonKey);
  }

  async authSignIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async authGetUser() {
    return this.client.auth.getUser();
  }

  async authSignOut() {
    return this.client.auth.signOut();
  }

  async uploadPhoto(buffer: Buffer, mime: string, filePath: string) {
    const { error } = await this.client.storage.from('player-photos').upload(filePath, buffer, { contentType: mime });
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data } = this.client.storage.from('player-photos').getPublicUrl(filePath);
    return data?.publicUrl || null;
  }

  async deletePhoto(publicUrl: string) {
    const match = publicUrl.match(/player-photos\/(.+)$/);
    if (match?.[1]) {
      const { error } = await this.client.storage.from('player-photos').remove([match[1]]);
      if (error) console.warn('Failed to delete storage object:', error);
    }
  }

  private getAdmin(): SupabaseClient {
    if (!this.adminClient) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
      this.adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', serviceKey);
    }
    return this.adminClient;
  }

  async createPlayer(entry: Record<string, unknown>) {
    const { data, error } = await this.client.from('players').insert([entry]).select();
    if (error) throw error;
    return data;
  }

  async deletePlayer(id: number) {
    const { error } = await this.client.from('players').delete().eq('id', id);
    if (error) throw error;
  }

  async getPlayerById(id: number) {
    const { data, error } = await this.client.from('players').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async updatePlayerPhoto(id: number, photoUrl: string | null) {
    const { data, error } = await this.client.from('players').update({ photo: photoUrl }).eq('id', id).select();
    if (error) throw error;
    return data;
  }

  async createScore(entry: Record<string, unknown>) {
    const { data, error } = await this.client.from('score').insert([entry as Record<string, unknown>]).select();
    if (error) throw error;
    return data;
  }

  async getScores(filters: { playerId?: string | number; day?: number }) {
    let query = this.client.from('score').select('*');
    if (filters.playerId !== undefined) query = query.eq('player_id', filters.playerId);
    if (filters.day !== undefined) query = query.eq('day', filters.day);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async setUserRole(userId: string, role: string) {
    const { error } = await this.getAdmin().auth.admin.updateUserById(userId, { user_metadata: { role } });
    if (error) throw error;
    return { success: true };
  }

  async fetchAllPlayers() {
    const { data, error } = await this.client.from('players').select('id, prenom, matches_played, nom, photo, niveau');
    if (error) throw error;
    return data;
  }
}

class SQLiteProvider implements DBProvider {
  private prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
    } as ConstructorParameters<typeof PrismaBetterSqlite3>[0]),
  });

  private getLocalAuthCredentials() {
    return {
      email: process.env.LOCAL_AUTH_EMAIL?.trim().toLowerCase() ?? '',
      password: process.env.LOCAL_AUTH_PASSWORD ?? '',
    };
  }

  async authSignIn(email: string, password: string) {
    const expected = this.getLocalAuthCredentials();
    if (email.trim().toLowerCase() === expected.email && password === expected.password) {
      return { data: { user: { email: expected.email, role: 'admin' } }, error: null };
    }
    return { data: { user: null }, error: { message: 'Email ou mot de passe incorrect' } };
  }

  async authGetUser() { return { data: { user: null }, error: null }; }
  async authSignOut() { return { error: null }; }
  async uploadPhoto() { return null; }
  async deletePhoto() { }

  async createPlayer(entry: Record<string, unknown>) {
    const payload = {
      nom: String((entry.nom ?? entry.name ?? '').toString().trim() || 'Inconnu'),
      prenom: String((entry.prenom ?? '').toString().trim() || 'Inconnu'),
      niveau: String((entry.niveau ?? 'MEDIOCRE').toString()),
      photo: typeof entry.photo === 'string' ? entry.photo : null,
      matches_played: Number((entry.matches_played ?? 0) || 0),
    };
    return this.prisma.player.create({ data: payload });
  }

  async deletePlayer(id: number) {
    await this.prisma.score.deleteMany({ where: { player_id: id } });
    await this.prisma.player.delete({ where: { id } });
  }

  async getPlayerById(id: number) { return this.prisma.player.findUnique({ where: { id } }); }
  async updatePlayerPhoto(id: number, photoUrl: string | null) { return this.prisma.player.update({ where: { id }, data: { photo: photoUrl } }); }
  async createScore(entry: Record<string, unknown>) {
    return this.prisma.score.create({ data: {
      player_id: Number((entry.player_id ?? entry.playerId ?? 0)),
      points: Number((entry.points ?? 0)),
      type: String((entry.type ?? 'score')),
      day: entry.day !== undefined ? Number(entry.day) : null,
      date: entry.date ? new Date(String(entry.date)) : new Date(),
    } });
  }
  async getScores(filters: { playerId?: string | number; day?: number }) {
    const where: Record<string, unknown> = {};
    if (filters.playerId !== undefined) where.player_id = Number(filters.playerId);
    if (filters.day !== undefined) where.day = Number(filters.day);
    return this.prisma.score.findMany({ where, orderBy: { date: 'desc' } });
  }
  async setUserRole() { return { success: true }; }
  async fetchAllPlayers() {
    return this.prisma.player.findMany({
      select: { id: true, prenom: true, nom: true, matches_played: true, photo: true, niveau: true },
    });
  }
}

function getProvider(): DBProvider {
  const provider = (process.env.DB_PROVIDER ?? (process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'supabase')).toLowerCase();
  return provider === 'sqlite' ? new SQLiteProvider() : new SupabaseProvider();
}

const dbProvider = getProvider();

export async function createPlayer(entry: Record<string, unknown>) { return dbProvider.createPlayer(entry); }
export async function deletePlayer(id: number) { return dbProvider.deletePlayer(id); }
export async function getPlayerById(id: number) { return dbProvider.getPlayerById(id); }
export async function updatePlayerPhoto(id: number, photoUrl: string | null) { return dbProvider.updatePlayerPhoto(id, photoUrl); }
export async function createScore(entry: Record<string, unknown>) { return dbProvider.createScore(entry); }
export async function getScores(filters: { playerId?: string | number; day?: number }) { return dbProvider.getScores(filters); }
export async function setUserRole(userId: string, role: string) { return dbProvider.setUserRole(userId, role); }
export async function fetchAllPlayers() { return dbProvider.fetchAllPlayers(); }
export async function uploadPhoto(buffer: Buffer, mime: string, filePath: string) { return dbProvider.uploadPhoto(buffer, mime, filePath); }
export async function deletePhoto(publicUrl: string) { return dbProvider.deletePhoto(publicUrl); }

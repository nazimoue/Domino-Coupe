// SQLite-specific DB implementation using Prisma
// All functions match the generic DBProvider interface.

import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  } as ConstructorParameters<typeof PrismaBetterSqlite3>[0]),
});

// Auth – local static credentials
function getLocalCreds() {
  return {
    email: process.env.LOCAL_AUTH_EMAIL?.trim().toLowerCase() ?? '',
    password: process.env.LOCAL_AUTH_PASSWORD ?? '',
  };
}

export async function authSignIn(email: string, password: string) {
  const creds = getLocalCreds();
  if (email.trim().toLowerCase() === creds.email && password === creds.password) {
    return { data: { user: { email: creds.email, role: 'admin' } }, error: null };
  }
  return { data: { user: null }, error: { message: 'Email ou mot de passe incorrect' } };
}

export async function authGetUser() {
  // No session handling on SQLite; always null
  return { data: { user: null }, error: null };
}

export async function authSignOut() {
  return { error: null };
}

export async function uploadPhoto(buffer: Buffer, mime: string, filePath: string) {
  // Local image upload – write file under public/<LOCAL_IMAGE_DIR>
  const publicDir = process.env.LOCAL_IMAGE_DIR || 'uploads';
  const fullPath = path.join(process.cwd(), 'public', publicDir, filePath);
  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    // Return URL relative to site root (served from /public)
    return `/${publicDir}/${filePath}`.replace(/\\/g, '/');
  } catch (e) {
    console.error('Local image upload error (SQLite provider):', e);
    return null;
  }
}

export async function deletePhoto(publicUrl: string) {
  // Expected URL format: /<publicDir>/<filePath>
  const match = publicUrl.match(/^\/[^\/]+\/(.+)$/);
  if (!match?.[1]) return;
  const publicDir = process.env.LOCAL_IMAGE_DIR || 'uploads';
  const fullPath = path.join(process.cwd(), 'public', publicDir, match[1]);
  try {
    await fs.unlink(fullPath);
  } catch (e) {
    console.warn('Failed to delete local image:', e);
  }
}

export async function createPlayer(entry: Record<string, unknown>) {
  const payload = {
    nom: String((entry.nom ?? entry.name ?? '').toString().trim() || 'Inconnu'),
    prenom: String((entry.prenom ?? '').toString().trim() || 'Inconnu'),
    niveau: String((entry.niveau ?? 'MEDIOCRE').toString()),
    photo: typeof entry.photo === 'string' ? entry.photo : null,
    matches_played: Number((entry.matches_played ?? 0) || 0),
  };
  return prisma.player.create({ data: payload });
}

export async function deletePlayer(id: number) {
  await prisma.score.deleteMany({ where: { player_id: id } });
  await prisma.player.delete({ where: { id } });
}

export async function getPlayerById(id: number) {
  return prisma.player.findUnique({ where: { id } });
}

export async function updatePlayerPhoto(id: number, photoUrl: string | null) {
  return prisma.player.update({ where: { id }, data: { photo: photoUrl } });
}

export async function createScore(entry: Record<string, unknown>) {
  return prisma.score.create({
    data: {
      player_id: Number((entry.player_id ?? entry.playerId ?? 0)),
      points: Number((entry.points ?? 0)),
      type: String((entry.type ?? 'score')),
      day: entry.day !== undefined ? Number(entry.day) : null,
      date: entry.date ? new Date(String(entry.date)) : new Date(),
    },
  });
}

export async function getScores(filters: { playerId?: string | number; day?: number }) {
  const where: any = {};
  if (filters.playerId !== undefined) where.player_id = Number(filters.playerId);
  if (filters.day !== undefined) where.day = Number(filters.day);
  return prisma.score.findMany({ where, orderBy: { date: 'desc' } });
}

export async function setUserRole() {
  // No role management in local SQLite mode
  return { success: true };
}

export async function fetchAllPlayers() {
  return prisma.player.findMany({
    select: { id: true, prenom: true, nom: true, matches_played: true, photo: true, niveau: true },
  });
}

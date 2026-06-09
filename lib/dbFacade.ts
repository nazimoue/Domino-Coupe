// Generic DB façade – routes all DB calls to appropriate provider (SQLite or Supabase)
// Provider chosen via PRISMA_PROVIDER env var (default auto‑detect).

import * as supabase from './dbSupabase';
import * as sqlite from './dbSQLite';

// Choose implementation based on env var (default to supabase if not sqlite)
const provider = process.env.PRISMA_PROVIDER?.toLowerCase() === 'sqlite' ? sqlite : supabase;

// Helper to expose useful env‑derived config (optional, for other modules)
export const DB_CONFIG = {
  localImageDir: process.env.LOCAL_IMAGE_DIR || 'uploads',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'players',
};

export const dbFacade = {
  // Auth
  authSignIn: (email: string, password: string) => provider.authSignIn(email, password),
  authGetUser: () => provider.authGetUser(),
  authSignOut: () => provider.authSignOut(),

  // Upload / delete photo
  uploadPhoto: (buffer: Buffer, mime: string, filePath: string) => provider.uploadPhoto(buffer, mime, filePath),
  deletePhoto: (publicUrl: string) => provider.deletePhoto(publicUrl),

  // Player CRUD
  createPlayer: (entry: Record<string, unknown>) => provider.createPlayer(entry),
  deletePlayer: (id: number) => provider.deletePlayer(id),
  getPlayerById: (id: number) => provider.getPlayerById(id),
  updatePlayerPhoto: (id: number, photoUrl: string | null) => provider.updatePlayerPhoto(id, photoUrl),
  fetchAllPlayers: () => provider.fetchAllPlayers(),

  // Scores
  createScore: (entry: Record<string, unknown>) => provider.createScore(entry),
  getScores: (filters: { playerId?: string | number; day?: number }) => provider.getScores(filters),

  // Users / roles
  setUserRole: (userId: string, role: string) => provider.setUserRole(userId, role),
};

// Export each function individually for convenient imports
export const {
  authSignIn,
  authGetUser,
  authSignOut,
  uploadPhoto,
  deletePhoto,
  createPlayer,
  deletePlayer,
  getPlayerById,
  updatePlayerPhoto,
  fetchAllPlayers,
  createScore,
  getScores,
  setUserRole,
} = dbFacade;

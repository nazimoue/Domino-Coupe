// ceci est une tentative
import 'server-only';

import * as supabase from './dbSupabase';
import * as sqlite from './dbSQLite';

// Provider choisi UNIQUEMENT côté serveur
const provider =
  process.env.PRISMA_PROVIDER?.toLowerCase() === 'sqlite'
    ? sqlite
    : supabase;

/**
 * CONFIG globale partagée serveur
 */
export const DB_CONFIG = {
  localImageDir: process.env.LOCAL_IMAGE_DIR || 'uploads',
  supabaseBucket: process.env.SUPABASE_BUCKET || 'players',
};

/* =========================================================
   AUTH
========================================================= */

export const authSignIn = (email: string, password: string) =>
  provider.authSignIn(email, password);

export const authGetUser = () => provider.authGetUser();

export const authSignOut = () => provider.authSignOut();

/* =========================================================
   FILES (IMAGES)
========================================================= */

export const uploadPhoto = (
  buffer: Buffer,
  mime: string,
  filePath: string
) => provider.uploadPhoto(buffer, mime, filePath);

export const deletePhoto = (publicUrl: string) =>
  provider.deletePhoto(publicUrl);

/* =========================================================
   PLAYERS
========================================================= */

export const createPlayer = (entry: Record<string, unknown>) =>
  provider.createPlayer(entry);

export const deletePlayer = (id: number) =>
  provider.deletePlayer(id);

export const getPlayerById = (id: number) =>
  provider.getPlayerById(id);

export const updatePlayerPhoto = (id: number, photoUrl: string | null) =>
  provider.updatePlayerPhoto(id, photoUrl);

export const fetchAllPlayers = () =>
  provider.fetchAllPlayers();

/* =========================================================
   SCORES
========================================================= */

export const createScore = (entry: Record<string, unknown>) =>
  provider.createScore(entry);

export const getScores = (filters: { playerId?: string | number; day?: number }) =>
  provider.getScores(filters);

/* =========================================================
   USERS / ROLES
========================================================= */

export const setUserRole = (userId: string, role: string) =>
  provider.setUserRole(userId, role);
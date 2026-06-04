// Database abstraction layer – choose between local Prisma DB or remote Supabase
// The selection is driven by the environment variable `USE_SUPABASE`.
// If `USE_SUPABASE` is set to "true" (default in production), the Supabase client from
// `supabaseClient.ts` will be used. Otherwise a Prisma client pointing at `DATABASE_URL`
// (usually a local PostgreSQL instance) is employed.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
// supabase client not needed here; service client is created lazily
import { PrismaClient } from "@prisma/client";

// Initialise Prisma – will be instantiated lazily so that the module can be imported in
// environments where the DB is not available (e.g. during static generation).
let prisma: PrismaClient | null = null;
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

// Initialise a Supabase service‑role client if the secret is available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseService(): SupabaseClient<unknown> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (url && key) return createClient(url, key);
  return null;
}

const useSupabase = process.env.USE_SUPABASE?.toLowerCase() === "true";
const supabaseService = getSupabaseService();

/**
 * Utility helpers – they return plain JS objects that mimic the shape used in the API
 * routes. The callers can decide whether to use them directly (Supabase) or via Prisma.
 */
export async function getPlayerById(id: number) {
  if (useSupabase && supabaseService) {
    const { data, error } = await supabaseService
      .from("players")
      .select("*, photo")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }
  // Prisma path
  return await getPrisma().player.findUnique({ where: { id } });
}

export async function updatePlayerPhoto(id: number, photoUrl: string | null) {
  if (useSupabase && supabaseService) {
    const { data, error } = await supabaseService
      .from("players")
            .update({ photo: photoUrl })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data;
  }
  return await getPrisma().player.update({ where: { id }, data: { photo: photoUrl as unknown as string } });
}

export async function createScore(entry: Record<string, unknown>) {
  if (useSupabase && supabaseService) {
    const { data, error } = await supabaseService.from("score")
      .insert(entry as unknown).select();
    if (error) throw error;
    return data;
  }
  return await getPrisma().score.create({ data: entry });
}

export async function getScores(filters: {
  playerId?: string | number;
  day?: number;
}) {
  if (useSupabase && supabaseService) {
    let q = supabaseService.from("score").select("*");
    if (filters.playerId !== undefined) q = q.eq("player_id", filters.playerId);
    if (filters.day !== undefined) q = q.eq("day", filters.day);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }
  const where: Record<string, unknown> = {};
  if (filters.playerId !== undefined) where.player_id = Number(filters.playerId);
  if (filters.day !== undefined) where.day = filters.day;
  return await getPrisma().score.findMany({ where, orderBy: { date: "desc" } });
}

export async function setUserRole(userId: string, role: string) {
  // This operation must always use the service‑role client – never expose the admin key to the browser.
  if (!supabaseService) throw new Error("Supabase service client not configured");
  const { error } = await supabaseService.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  if (error) throw error;
  return { success: true };
}

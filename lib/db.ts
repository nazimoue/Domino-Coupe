import { createClient } from '@supabase/supabase-js';

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}

function getLocalSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('domino-local-auth');
    return raw ? (JSON.parse(raw) as { email: string; role: string }) : null;
  } catch {
    return null;
  }
}

export async function authSignIn(email: string, password: string) {
  const localResponse = await fetch('/api/auth/local-signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const localResult = await localResponse.json();

  if (localResponse.ok && localResult?.success) {
    const user = localResult?.data?.user;
    if (user && typeof window !== 'undefined') {
      window.localStorage.setItem('domino-local-auth', JSON.stringify(user));
    }

    return { data: { user }, error: null };
  }

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    return {
      data: { user: null },
      error: localResult?.error ?? { message: 'Email ou mot de passe incorrect' },
    };
  }

  return supabaseClient.auth.signInWithPassword({ email, password });
}

export async function authGetUser() {
  const localUser = getLocalSession();
  if (localUser) {
    return { data: { user: localUser }, error: null };
  }

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    return { data: { user: null }, error: null };
  }

  return supabaseClient.auth.getUser();
}

export async function authSignOut() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('domino-local-auth');
  }

  const supabaseClient = getSupabaseClient();
  if (!supabaseClient) {
    return { error: null };
  }

  return supabaseClient.auth.signOut();
}

export async function uploadPhoto(buffer: Buffer, mime: string, filePath: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error('Supabase config missing - cannot upload photo');
    return null;
  }
  try {
    const { data, error: uploadError } = await supabase.storage
      .from('player-photos')
      .upload(filePath, buffer, { contentType: mime, upsert: false });
    if (uploadError) {
      console.error('Supabase upload error:', uploadError.message);
      return null;
    }
    if (data?.path) {
      const { data: publicData } = supabase.storage
        .from('player-photos')
        .getPublicUrl(data.path);
      return publicData?.publicUrl ?? null;
    }
    return null;
  } catch (e) {
    console.error('Unexpected upload error:', e);
    return null;
  }
}

export async function deletePhoto(publicUrl: string) {
  void publicUrl;
  return;
}

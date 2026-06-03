import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://guimsmbzfucvaviohipt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aW1zbWJ6ZnVjdmF2aW9oaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzM4NzAsImV4cCI6MjA5NjA0OTg3MH0.akUUsv--8zJRFgpgvPSO3CNxJ3Damvu7CFTvczMuxeU';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are missing. Please check your .env.local file and restart the Next.js development server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Do NOT create a service-role client at module import time — that can leak secrets
// into the client bundle. Provide a factory that server-only code can call.
export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in server environment');
  }
  return createClient(supabaseUrl, serviceKey);
}

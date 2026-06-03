import { supabaseAdmin as supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const { userId } = await request.json();

  // Nécessite une clé service_role pour fonctionner côté serveur
  const serviceSupabase = supabase;

  const { error } = await serviceSupabase.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin' }
  });

  if (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

import { authGetUser } from '@/lib/db';
import { setUserRole } from '@/lib/db.server';

export async function POST(request: Request) {
  // Verify that the caller is authenticated and has admin role
  const { data: authData, error: authError } = await authGetUser();
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { status: 401 });
  }
  const currentUser = authData.user;
  const metadata = (currentUser as { user_metadata?: Record<string, unknown> } | undefined)?.user_metadata;
  const role = (metadata?.role as string | undefined) ?? (currentUser as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    return new Response(JSON.stringify({ success: false, error: 'Admin privileges required' }), { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'userId missing' }), { status: 400 });
  }
  try {
    await setUserRole(userId, 'admin');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error setting role';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), { status: 500 });
  }
}

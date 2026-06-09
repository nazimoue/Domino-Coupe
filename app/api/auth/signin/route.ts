import { NextResponse } from 'next/server';
import { authSignIn } from '@/lib/dbFacade.server';

function checkLocalCreds(email: string, password: string) {
  const expectedEmail = process.env.LOCAL_AUTH_EMAIL?.trim().toLowerCase() ?? '';
  const expectedPassword = process.env.LOCAL_AUTH_PASSWORD ?? '';
  if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
    return { user: { id: 'local-admin', email: expectedEmail, role: 'admin' } };
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Toujours autoriser l'admin local (quel que soit le provider)
    const localUser = checkLocalCreds(email, password);
    if (localUser) {
      return NextResponse.json({
        success: true,
        data: { user: localUser },
        error: null,
      });
    }

    // Fallback : délègue au provider (Supabase Auth, etc.)
    const { data, error } = await authSignIn(email, password);

    if (error || !data?.user) {
      return NextResponse.json({
        success: false,
        data: { user: null },
        error: { message: error?.message || 'Email ou mot de passe incorrect' },
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: { user: data.user },
      error: null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: { user: null },
      error: { message: error instanceof Error ? error.message : 'Erreur inconnue' },
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.LOCAL_AUTH_EMAIL?.trim().toLowerCase() ?? '';
    const expectedPassword = process.env.LOCAL_AUTH_PASSWORD ?? '';

    if (String(email ?? '').trim().toLowerCase() === expectedEmail && String(password ?? '') === expectedPassword) {
      return NextResponse.json({
        success: true,
        data: {
          user: { id: 'local-admin', email: expectedEmail, role: 'admin' },
        },
        error: null,
      });
    }

    return NextResponse.json({
      success: false,
      data: { user: null },
      error: { message: 'Email ou mot de passe incorrect' },
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: { user: null },
      error: { message: error instanceof Error ? error.message : 'Erreur inconnue' },
    }, { status: 500 });
  }
}

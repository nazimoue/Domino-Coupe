import { NextResponse } from 'next/server';
import { authGetUser } from '@/lib/dbFacade.server';

export async function GET() {
  try {
    const { data: { user }, error } = await authGetUser();

    if (error || !user) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    return NextResponse.json({ success: true, data: { user } });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: { user: null },
      error: { message: error instanceof Error ? error.message : 'Erreur inconnue' },
    }, { status: 500 });
  }
}

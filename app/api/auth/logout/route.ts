import { NextResponse } from 'next/server';
import { authSignOut } from '@/lib/dbFacade.server';

export async function POST() {
  try {
    const { error } = await authSignOut();
    if (error) {
      return NextResponse.json({
        success: false,
        error: { message: error.message },
      }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: error instanceof Error ? error.message : 'Erreur inconnue' },
    }, { status: 500 });
  }
}

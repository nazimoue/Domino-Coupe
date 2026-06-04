import { NextResponse } from 'next/server';

// Minimal implementation so the file exports a module for Next's type validator.
export async function GET() {
	try {
		// Return a safe default (empty ranking) so the dev build/type validator is happy.
		return NextResponse.json({ success: true, data: [] });
	} catch (err: unknown) {
		return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
	}
}


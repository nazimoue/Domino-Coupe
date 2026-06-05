import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'public', 'top5_visibility.json');

async function readFlag(): Promise<boolean> {
  try {
    if (!fs.existsSync(FILE_PATH)) return true;
    const raw = await fs.promises.readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw || '{}');
    return typeof parsed.visible === 'boolean' ? parsed.visible : true;
  } catch {
    return true;
  }
}

async function writeFlag(visible: boolean) {
  const payload = { visible };
  await fs.promises.writeFile(FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function GET() {
  const visible = await readFlag();
  return NextResponse.json({ success: true, visible });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const visible = body?.visible;
    if (typeof visible !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid payload, expected { visible: boolean }' }, { status: 400 });
    }
    await writeFlag(visible);
    return NextResponse.json({ success: true, visible });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

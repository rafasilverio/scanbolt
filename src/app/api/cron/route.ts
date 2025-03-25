import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/queue/process`, {
      method: 'POST'
    });
    
    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
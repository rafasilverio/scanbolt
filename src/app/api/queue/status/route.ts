import { NextResponse } from 'next/server';

// Importar a função original do CommonJS
const { getQueueStatus } = require('@/lib/queue.common');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getQueueStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' }, 
      { status: 500 }
    );
  }
} 
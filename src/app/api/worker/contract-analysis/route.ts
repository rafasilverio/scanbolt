import { NextRequest, NextResponse } from 'next/server';
import { redis, ANALYSIS_QUEUE } from '@/lib/redis';
import { processQueueItem } from '@/lib/process';

// Proteger a rota com uma chave secreta
const API_SECRET = process.env.WORKER_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const authorization = req.headers.get('authorization');
    if (!authorization || authorization !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter um item da fila
    const queueItem = await redis.rpop(ANALYSIS_QUEUE);
    
    if (!queueItem) {
      return NextResponse.json({ message: 'No items in queue' });
    }
    
    // Processar o item
    const item = JSON.parse(queueItem);
    await processQueueItem(item);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
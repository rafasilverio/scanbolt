import { NextResponse } from 'next/server';
import { redis, ANALYSIS_QUEUE } from '@/lib/redis';

// Função para chamar o worker
async function callWorker() {
  const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/worker/contract-analysis`;
  
  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WORKER_API_SECRET}`
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Worker failed: ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling worker:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Verificar se há itens na fila
    const queueLength = await redis.llen(ANALYSIS_QUEUE);
    
    if (queueLength === 0) {
      return NextResponse.json({ message: 'No items in queue' });
    }
    
    // Processar até 5 itens por execução
    const results = [];
    const maxItems = Math.min(5, queueLength);
    
    for (let i = 0; i < maxItems; i++) {
      try {
        const result = await callWorker();
        results.push(result);
      } catch (error) {
        console.error(`Failed to process item ${i}:`, error);
        break;
      }
    }
    
    return NextResponse.json({
      processed: results.length,
      remaining: await redis.llen(ANALYSIS_QUEUE)
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Configuração para o Vercel Cron
export const config = {
  runtime: 'edge',
  regions: ['iad1'],  // Escolha a região mais próxima do seu banco de dados
};
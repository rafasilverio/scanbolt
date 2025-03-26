import { NextResponse } from 'next/server';
import { startWorker } from '@/lib/worker';

// Flag para controlar se o worker já está rodando
let isWorkerRunning = false;

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    // Verificar se o worker já está rodando
    if (isWorkerRunning) {
      return NextResponse.json({
        success: true,
        message: 'Worker already running'
      });
    }
    
    // Marcar o worker como iniciado
    isWorkerRunning = true;
    
    // Iniciar o worker de forma não bloqueante
    const result = await startWorker();
    
    return NextResponse.json({
      success: true,
      message: result ? 'Processado um job com sucesso' : 'Nenhum job para processar'
    });
    
  } catch (error) {
    console.error('Failed to start worker:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start worker'
    }, { status: 500 });
  }
} 
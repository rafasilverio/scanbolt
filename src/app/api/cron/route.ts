import { NextResponse } from 'next/server';

// Importar as funções necessárias
const { getNextJob } = require('@/lib/queue.common');

// Definir interface para o job
interface ContractJob {
  contractId: string;
  fileData: {
    buffer: string;
    name: string;
    type: string;
    size: number;
  };
  userId: string;
  isPreview: boolean;
  createdAt: number;
}

// Criar uma versão simplificada do processJob para uso em cron
// Isso é uma alternativa ao worker.js completo para ambientes sem servidores dedicados
async function processSingleJob(job: ContractJob) {
  try {
    console.log(`[CRON] Processing job for contract: ${job.contractId}`);
    
    // Carregar dinamicamente o módulo worker (para evitar problemas de dependência circular)
    const workerModule = require('@/scripts/worker');
    
    // Se o worker exporta processJob diretamente, usamos essa função
    if (typeof workerModule.processJob === 'function') {
      await workerModule.processJob(job);
      return true;
    } 
    // Caso contrário, tentamos uma implementação simplificada
    else {
      console.warn('[CRON] Worker module does not export processJob function. Using simplified version.');
      
      // Aqui você pode implementar uma versão simplificada do processamento
      // ou retornar um erro indicando que o processamento completo requer o worker.js
      
      throw new Error('Worker module does not export processJob function. Please set up a dedicated worker.');
    }
  } catch (error) {
    console.error('[CRON] Error processing job:', error);
    throw error;
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos

export async function GET() {
  try {
    // Processar próximo job da fila
    const job = await getNextJob();
    
    if (job) {
      await processSingleJob(job);
      return NextResponse.json({ 
        success: true, 
        processed: true,
        contractId: job.contractId
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      processed: false,
      message: 'No jobs in queue'
    });
  } catch (error: unknown) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
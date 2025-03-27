// [ARQUIVO STUB] - A implementação atual está em src/lib/queue.common.js
// Este arquivo é mantido apenas para compatibilidade com importações existentes

// Tipo para os jobs na fila (mantido por compatibilidade)
export type ContractJob = {
  contractId: string;
  fileData: {
    buffer: string; // base64
    name: string;
    type: string;
    size: number;
  };
  userId: string;
  isPreview: boolean;
  tempId?: string;
  createdAt: number;
};

// Função stub - a implementação atual está em queue.common.js
export async function getNextJob(): Promise<ContractJob | null> {
  console.warn('DEPRECATED: Esta função foi movida para src/lib/queue.common.js');
  return null;
}

// Função stub - a implementação atual está em queue.common.js
export async function addToQueue(job: Omit<ContractJob, 'createdAt'>): Promise<string> {
  console.warn('DEPRECATED: Esta função foi movida para src/lib/queue.common.js');
  return '';
}

// Função stub - a implementação atual está em queue.common.js
export async function getQueueStatus(): Promise<{ 
  length: number; 
  oldestJob: number | null;
  newestJob: number | null;
}> {
  console.warn('DEPRECATED: Esta função foi movida para src/lib/queue.common.js');
  return {
    length: 0,
    oldestJob: null,
    newestJob: null
  };
} 
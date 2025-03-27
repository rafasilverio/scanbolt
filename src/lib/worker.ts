// [ARQUIVO STUB] - A implementação atual está em src/scripts/worker.js
// Este arquivo é mantido apenas para compatibilidade com importações existentes

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para iniciar o worker - mantida por compatibilidade
export async function startWorker() {
  console.warn('DEPRECATED: Esta função foi movida para src/scripts/worker.js');
  console.warn('O processamento agora é feito via script Node.js separado, não via API Edge');
  return false;
}

export default startWorker; 
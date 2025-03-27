// Adaptador para usar queue.common.js em componentes cliente via ESM
// Este arquivo é necessário para uso em componentes React

// Definir interface para compatibilidade com TypeScript
interface QueueStatus {
  length: number;
  oldestJob: number | null;
  newestJob: number | null;
}

// Função para obter status da fila
export async function getQueueStatus(): Promise<QueueStatus> {
  try {
    const response = await fetch('/api/queue/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get queue status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking queue status:', error);
    return {
      length: 0,
      oldestJob: null,
      newestJob: null
    };
  }
} 
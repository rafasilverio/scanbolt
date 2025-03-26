const { Redis } = require('@upstash/redis');

// Inicializar cliente Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Constante para o nome da fila
const QUEUE_KEY = 'contract-processing-queue';

// Função para adicionar um job à fila
async function addToQueue(job) {
  const jobWithTimestamp = {
    ...job,
    createdAt: Date.now()
  };
  
  // Adiciona o job ao final da lista no Redis
  const jobId = await redis.rpush(QUEUE_KEY, JSON.stringify(jobWithTimestamp));
  
  console.log(`Job added to queue with ID: ${jobId}, contract: ${job.contractId}`);
  
  return jobId.toString();
}

// Função para obter o próximo job da fila (FIFO)
async function getNextJob() {
  // Obtém e remove o primeiro elemento da lista
  const jobData = await redis.lpop(QUEUE_KEY);
  
  if (!jobData) {
    return null;
  }
  
  try {
    // Verifica se jobData já não é um objeto
    if (typeof jobData === 'object') {
      return jobData;
    }
    const job = JSON.parse(jobData);
    return job;
  } catch (error) {
    console.error('Error parsing job data:', error);
    return null;
  }
}

// Função para obter o status da fila
async function getQueueStatus() {
  // Obtém o tamanho atual da fila
  const queueLength = await redis.llen(QUEUE_KEY);
  
  // Se a fila estiver vazia, retorna valores padrão
  if (queueLength === 0) {
    return {
      length: 0,
      oldestJob: null,
      newestJob: null
    };
  }
  
  // Pega o primeiro job (mais antigo) sem removê-lo
  const oldest = await redis.lindex(QUEUE_KEY, 0);
  let oldestTimestamp = null;
  
  if (oldest) {
    try {
      const job = typeof oldest === 'object' ? oldest : JSON.parse(oldest);
      oldestTimestamp = job.createdAt;
    } catch (error) {
      console.error('Error parsing oldest job:', error);
    }
  }
  
  // Pega o último job (mais recente) sem removê-lo
  const newest = await redis.lindex(QUEUE_KEY, -1);
  let newestTimestamp = null;
  
  if (newest) {
    try {
      const job = typeof newest === 'object' ? newest : JSON.parse(newest);
      newestTimestamp = job.createdAt;
    } catch (error) {
      console.error('Error parsing newest job:', error);
    }
  }
  
  return {
    length: queueLength,
    oldestJob: oldestTimestamp,
    newestJob: newestTimestamp
  };
}

module.exports = {
  addToQueue,
  getNextJob,
  getQueueStatus
}; 
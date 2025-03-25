import { Redis } from "@upstash/redis";

// Cria uma instância do Redis usando variáveis de ambiente
// (configuradas pela integração Vercel-Upstash)
export const redis = Redis.fromEnv();

// Nome da fila para análise de contratos
export const ANALYSIS_QUEUE = 'contract-analysis-queue';
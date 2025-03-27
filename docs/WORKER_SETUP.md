# Configuração do Worker para ScanContract

Este documento explica como configurar o worker para processamento de contratos em background.

## Visão Geral

O ScanContract utiliza um sistema de fila Redis (Upstash) para processar contratos em background. O processo funciona da seguinte forma:

1. O usuário faz upload de um contrato através da interface web
2. O sistema cria um registro do contrato no banco de dados e adiciona um job à fila Redis
3. Um processo worker separado (Node.js) busca jobs da fila e processa os contratos

## Configuração em Produção

### Opção 1: Servidores Dedicados (Recomendado)

Em um ambiente de produção robusto, recomendamos executar o worker em servidores dedicados:

1. Configure um ou mais servidores EC2/DigitalOcean/etc
2. Clone o repositório do projeto
3. Instale as dependências com `npm install`
4. Configure as variáveis de ambiente (veja abaixo)
5. Execute o worker com PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o worker com PM2
pm2 start src/scripts/worker.js --name "contract-worker"

# Configurar para iniciar automaticamente no boot
pm2 startup
pm2 save
```

### Opção 2: Vercel Cron Jobs (Simples)

Para projetos menores, você pode usar Vercel Cron Jobs para execução periódica:

1. Configure um Cron Job na Vercel que chama `/api/cron` a cada 5 minutos
2. Certifique-se que sua API `/api/cron` tem a seguinte configuração:

```typescript
import { NextResponse } from 'next/server';
const { getNextJob } = require('@/lib/queue.common');
const { processJob } = require('@/scripts/worker');

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos

export async function GET() {
  try {
    // Processar próximo job da fila
    const job = await getNextJob();
    
    if (job) {
      await processJob(job);
      return NextResponse.json({ success: true, processed: true });
    }
    
    return NextResponse.json({ success: true, processed: false });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Variáveis de Ambiente Necessárias

```
# Database (PostgreSQL/Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Supabase (Storage)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI (para análise de contratos)
OPENAI_API_KEY=...
```

## Monitoramento

Recomendamos configurar monitoramento para o worker:

1. Use logs do PM2 para depuração: `pm2 logs contract-worker`
2. Configure alertas em caso de falha: `pm2 install pm2-slack`
3. Monitore o tamanho da fila via dashboard Upstash

## Escalabilidade

Para escalar o processamento:

1. Execute múltiplas instâncias do worker em diferentes servidores
2. Configure balanceamento de carga para distribuir o tráfego web
3. Aumente o número de conexões Redis conforme necessário 
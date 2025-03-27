# Arquitetura do Sistema ScanContract

Este documento descreve a arquitetura e componentes do sistema ScanContract.

## Visão Geral

O ScanContract é arquitetado como uma aplicação híbrida com processamento assíncrono em background:

1. **Frontend & API**: Next.js hospedado na Vercel
2. **Processamento de Contratos**: Worker Node.js dedicado
3. **Dados & Armazenamento**: PostgreSQL e Supabase Storage 
4. **Fila & Comunicação**: Redis Upstash

## Diagrama de Arquitetura

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│    Cliente     │◄────►│  Next.js API   │◄────►│   PostgreSQL   │
│  (Navegador)   │      │    (Vercel)    │      │   (Supabase)   │
│                │      │                │      │                │
└────────────────┘      └───────┬────────┘      └────────────────┘
                                │                        ▲
                                ▼                        │
                        ┌────────────────┐      ┌────────────────┐
                        │                │      │                │
                        │  Redis Queue   │◄────►│  Worker Node   │
                        │   (Upstash)    │      │  (Servidor)    │
                        │                │      │                │
                        └────────────────┘      └───────┬────────┘
                                                        │
                                                        ▼
                                                ┌────────────────┐
                                                │                │
                                                │    OpenAI      │
                                                │     API        │
                                                │                │
                                                └────────────────┘
```

## Componentes Principais

### 1. Frontend e API (Next.js)

- **Função**: Interface do usuário e endpoints de API
- **Arquivos Principais**:
  - `app/`: Páginas e rotas da aplicação
  - `components/`: Componentes React reutilizáveis
  - `lib/`: Funções utilitárias compartilhadas
  - `app/api/`: Endpoints da API

### 2. Worker de Processamento (Node.js)

- **Função**: Processamento assíncrono de contratos
- **Arquivos Principais**:
  - `src/scripts/worker.js`: Worker principal
  - `src/lib/queue.common.js`: Gerenciamento da fila
  - `src/lib/ai.common.js`: Integração com OpenAI

### 3. Banco de Dados (PostgreSQL/Supabase)

- **Função**: Armazenamento persistente
- **Arquivos Principais**:
  - `prisma/schema.prisma`: Schema do banco de dados
  - `lib/prisma.ts`: Cliente Prisma

### 4. Armazenamento (Supabase Storage)

- **Função**: Armazenamento de arquivos PDF
- **Arquivos Principais**:
  - `lib/supabase.ts`: Cliente Supabase

### 5. Fila (Redis Upstash)

- **Função**: Gerenciamento da fila de processamento
- **Arquivos Principais**:
  - `lib/queue.common.js`: Implementação da fila

## Fluxo de Processamento de Contratos

1. **Upload do Contrato**:
   - Usuário envia contrato via `api/contracts/upload`
   - Criação do registro no banco de dados
   - Upload do arquivo para Supabase Storage
   - Adição do job à fila Redis

2. **Processamento Background**:
   - Worker busca job da fila
   - Extração de texto do PDF
   - Envio para análise da OpenAI via `analyzeContract()`
   - Atualização do contrato no banco com resultados

3. **Visualização dos Resultados**:
   - Usuário acessa `/contracts/[id]`
   - Exibição do contrato com problemais identificados
   - Interface para revisão das sugestões

## Estratégias de Escalabilidade

1. **Escalabilidade Horizontal do Worker**:
   - Múltiplas instâncias do worker em diferentes servidores
   - Cada worker busca jobs da mesma fila Redis

2. **Otimização de Recursos**:
   - Compressão de arquivos antes do upload
   - Limitação do tamanho de contratos
   - Caching de resultados similares

3. **Recuperação de Falhas**:
   - Jobs que falham são registrados e podem ser reprocessados
   - Monitoramento via PM2 para reiniciar workers em caso de falha 
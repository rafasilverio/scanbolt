# ScanContract

Aplicação para análise e gestão de contratos com IA.

## Visão Geral

ScanContract é uma plataforma que permite aos usuários:

1. Fazer upload de contratos em PDF
2. Analisar automaticamente cláusulas problemáticas com IA
3. Receber sugestões de melhorias para seus contratos
4. Gerenciar e organizar todos os seus contratos

## Tecnologias

- **Frontend**: Next.js, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Queue**: Upstash Redis
- **AI**: OpenAI GPT-4

## Requisitos

- Node.js 18+ (recomendado 20+)
- PostgreSQL 14+
- Redis 6+
- Conta na OpenAI com acesso à API

## Configuração Local

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/scancontract.git
cd scancontract
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

4. Execute as migrações do banco de dados
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

6. Em outro terminal, execute o worker para processamento de contratos
```bash
node src/scripts/worker.js
```

## Deploy na Vercel

### 1. Frontend e API

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente necessárias
3. Deploy!

### 2. Worker (Processamento Background)

Para o worker de processamento, você tem duas opções:

#### Opção 1: Servidor Dedicado

Configure um servidor dedicado (EC2, DigitalOcean, etc) para executar o worker:

```bash
# No servidor
git clone https://github.com/seu-usuario/scancontract.git
cd scancontract
npm install
npm install -g pm2

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Inicie o worker com PM2
pm2 start src/scripts/worker.js --name "contract-worker"
pm2 startup
pm2 save
```

#### Opção 2: Vercel Cron Jobs

Configure um Cron Job na Vercel que chama a rota `/api/cron` a cada 5 minutos. Esta rota processará um contrato por vez.

Nota: Esta opção é mais limitada, mas pode funcionar para volumes baixos.

## Variáveis de Ambiente

```
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# OpenAI
OPENAI_API_KEY=...
```

## Documentação Adicional

- [Configuração do Worker](WORKER_SETUP.md)
- [Arquitetura do Sistema](docs/ARCHITECTURE.md)

## Licença

Copyright © 2024. Todos os direitos reservados.

# Guia de Implantação do ScanContract

Este documento descreve o processo de implantação do sistema ScanContract em ambientes de produção.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta na [Supabase](https://supabase.com)
- Conta na [Upstash](https://upstash.com) (Redis)
- Conta na [OpenAI](https://platform.openai.com)
- Servidor para o worker (qualquer provedor de VPS)

## Configuração do Ambiente

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL="postgresql://postgres:[senha]@[host]:5432/scancontract"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://[region].upstash.io/redis/[hash]"
UPSTASH_REDIS_REST_TOKEN="[token]"

# OpenAI
OPENAI_API_KEY="sk-..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Autenticação
NEXTAUTH_SECRET="[gere-uma-string-aleatória]"
NEXTAUTH_URL="https://seu-dominio.com"

# Configurações do App
NEXT_PUBLIC_APP_URL="https://seu-dominio.com"
```

### 2. Banco de Dados (Supabase)

1. Crie um novo projeto no Supabase
2. Use a URL e chaves fornecidas pelo Supabase nas variáveis de ambiente
3. Execute as migrações do Prisma:

```bash
npx prisma migrate deploy
```

### 3. Armazenamento (Supabase Storage)

1. No painel do Supabase, crie um bucket chamado "contracts"
2. Configure as políticas de segurança para permitir:
   - Upload autenticado
   - Download autenticado
   - Acesso de leitura para o serviço de worker

## Implantação no Vercel

### 1. Preparação do Projeto

Certifique-se de que o arquivo `vercel.json` está configurado corretamente:

```json
{
  "functions": {
    "app/api/**/*": {
      "memory": 1024
    }
  },
  "buildCommand": "npm run build",
  "ignoreCommand": "echo 'Ignorando worker.js - execute separadamente em um servidor'",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "installCommand": "npm install"
}
```

### 2. Implantação na Vercel

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel da Vercel
3. Implante o projeto:
   - Vercel detectará automaticamente o projeto Next.js
   - A primeira implantação criará o ambiente de produção

### 3. Domínio Personalizado (Opcional)

1. No painel da Vercel, vá para "Domains"
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar os registros DNS

## Implantação do Worker

Consulte o arquivo [WORKER_SETUP.md](./WORKER_SETUP.md) para instruções detalhadas sobre a configuração do worker em um servidor dedicado ou usando Vercel Cron Jobs.

## Verificação da Implantação

Após a implantação, verifique se os seguintes componentes estão funcionando:

1. **Frontend**: Navegue até o URL da aplicação e verifique se a página inicial carrega
2. **API**: Teste os endpoints da API (ex: `/api/contracts`)
3. **Worker**: Verifique os logs do worker para confirmar que está processando jobs
4. **Upload de Arquivos**: Tente fazer upload de um contrato para verificar a integração com Supabase Storage

## Solução de Problemas

### Problemas com o Worker

Se o worker não estiver processando jobs:
1. Verifique as variáveis de ambiente no servidor do worker
2. Confirme que o Redis está acessível
3. Verifique os logs do PM2 para erros específicos: `pm2 logs worker`

### Problemas com a API

Se os endpoints da API estiverem falhando:
1. Verifique os logs da função no painel da Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste localmente para identificar problemas específicos

## Monitoramento

Para monitorar a saúde do sistema:

1. **Vercel**: Use o painel da Vercel para monitorar o frontend e APIs
2. **Worker**: Configure alertas no PM2 para notificar sobre falhas
3. **Redis**: Use o painel do Upstash para monitorar o uso da fila
4. **Banco de Dados**: Configure alertas no Supabase para monitorar o desempenho do banco

## Atualizações

Para implantar atualizações:

1. Mescle as alterações no branch `main`
2. A Vercel detectará automaticamente as alterações e iniciará uma nova implantação
3. Para o worker, atualize o código no servidor e reinicie o processo:
   ```bash
   cd /caminho/para/scancontract
   git pull
   npm install
   pm2 restart worker
   ``` 
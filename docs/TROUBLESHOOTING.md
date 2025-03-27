# Guia de Solução de Problemas

Este documento apresenta soluções para problemas comuns encontrados durante o desenvolvimento e operação do ScanContract.

## Problemas de Build

### Erros de Dynamic Server Usage

```
Error: Dynamic server usage: Route /api/contracts/count couldn't be rendered statically because it used `headers`.
```

**Solução:** Este erro ocorre durante o build estático do Next.js. Não é um problema crítico pois as rotas de API são renderizadas sob demanda em produção. Proceda com a implantação normalmente.

### Erros de Prisma Client

```
Error: Unable to require('./client'). Please run `prisma generate` to generate the Prisma Client.
```

**Solução:**
1. Execute `npx prisma generate` para regenerar o cliente Prisma
2. Verifique se a variável de ambiente `DATABASE_URL` está correta
3. Reinicie o servidor de desenvolvimento ou reconstrua o projeto

## Problemas do Worker

### Worker não processa contratos

**Sintomas:** Os contratos permanecem com status "pending" indefinidamente.

**Possíveis causas e soluções:**

1. **Worker não está rodando:**
   - Verifique se o processo do worker está ativo: `pm2 status`
   - Inicie o worker se necessário: `pm2 start src/scripts/worker.js --name worker`

2. **Erro de configuração do Redis:**
   - Verifique as variáveis de ambiente `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
   - Teste a conexão com Redis: `node -e "const { getQueueStatus } = require('./src/lib/queue.common.js'); getQueueStatus().then(console.log)"`

3. **Erro de conexão com OpenAI:**
   - Verifique os logs do worker: `pm2 logs worker`
   - Confirme se a chave de API da OpenAI é válida

4. **Worker travando em um job específico:**
   - Verifique os logs para identificar o job problemático
   - Use a rota `/api/queue/process` para pular manualmente o job problemático

### Erros de Memória no Worker

```
<--- Last few GCs --->
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solução:**
1. Aumente a memória disponível para o Node.js: `NODE_OPTIONS="--max-old-space-size=4096" pm2 restart worker`
2. Verifique se há vazamentos de memória no código do worker
3. Considere limitar o tamanho dos contratos processados

## Problemas de Upload de Arquivos

### Falha no Upload para o Supabase Storage

**Sintomas:** Erro ao fazer upload de um contrato.

**Soluções:**
1. **Verificar permissões do bucket:**
   - No painel do Supabase, confirme se as políticas do bucket "contracts" permitem inserções
   - Verifique se a chave de API tem permissões suficientes

2. **Problemas de tamanho de arquivo:**
   - Verifique se o arquivo está dentro do limite (10MB por padrão)
   - Ajuste `next.config.js` para permitir arquivos maiores se necessário

3. **Erros de CORS:**
   - Verifique se as políticas CORS do Supabase estão configuradas corretamente

## Problemas de Autenticação

### Erro de Login/Registro

**Sintomas:** Usuários não conseguem fazer login ou registrar-se.

**Soluções:**
1. **Verificar configuração do NextAuth:**
   - Confirme se `NEXTAUTH_SECRET` e `NEXTAUTH_URL` estão configurados corretamente
   - Verifique os logs de erro no console

2. **Problemas com banco de dados:**
   - Verifique se as tabelas de autenticação foram criadas corretamente
   - Execute `npx prisma db push` para sincronizar o schema

## Problemas de Processamento de Contratos

### Análise de Contratos Incompleta

**Sintomas:** O contrato é processado, mas a análise está vazia ou incompleta.

**Soluções:**
1. **Problemas com o modelo OpenAI:**
   - Verifique os logs do worker para erros da API da OpenAI
   - Confirme se o prompt está formatado corretamente (veja `src/lib/ai.common.js`)

2. **Problemas com a extração de texto:**
   - Verifique se o PDF é legível e pesquisável (não digitalizado como imagem)
   - Teste a extração de texto manualmente para verificar se o conteúdo está sendo extraído corretamente

3. **Limite de tokens da API OpenAI:**
   - Verifique se o contrato não excede o limite de tokens do modelo da OpenAI
   - Considere implementar a divisão de documentos grandes em partes menores

### Erro ao Atualizar Campos JSON no Banco de Dados

```
Error: Failed to update contract: invalid input syntax for type json
```

**Solução:**
1. Verifique se os campos JSON estão sendo formatados corretamente antes da atualização
2. Certifique-se de usar `JSON.stringify()` para campos JSON antes de enviá-los ao banco de dados
3. Para diagnóstico, imprima o valor exato que está sendo enviado ao banco de dados

## Problemas de Implantação na Vercel

### Falha na Implantação

**Sintomas:** A implantação na Vercel falha.

**Soluções:**
1. **Verificar logs de build:**
   - Examine os logs de build na interface da Vercel para identificar erros específicos
   - Corrija quaisquer erros de linting ou typescript reportados

2. **Problemas com variáveis de ambiente:**
   - Confirme se todas as variáveis de ambiente necessárias estão configuradas no projeto Vercel
   - Verifique se há diferenças entre as variáveis locais e as da Vercel

3. **Conflitos com o worker:**
   - Certifique-se de que o arquivo `vercel.json` está configurado para ignorar o worker
   - Confirme que não há tentativas de iniciar o worker durante o build

## Problemas de Performance

### API Lenta ou Tempo Limite Excedido

**Sintomas:** Endpoints de API lentos ou erros de tempo limite.

**Soluções:**
1. **Otimizar consultas do banco de dados:**
   - Verifique se os índices apropriados estão presentes no banco de dados
   - Otimize consultas Prisma para reduzir a complexidade

2. **Aumentar limites de tempo:**
   - Ajuste os limites de tempo das funções na Vercel (no arquivo `vercel.json`)
   - Para APIs críticas, considere aumentar a alocação de memória

3. **Implementar cache:**
   - Adicione caching para endpoints frequentemente acessados
   - Utilize Redis para armazenar resultados de consultas frequentes 
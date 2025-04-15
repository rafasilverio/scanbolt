# Fluxo de Registro de Usuário na Migração do Preview

Esta documentação descreve o processo de registro ou login de usuários durante a migração de um contrato pré-visualizado a partir da Home. 

## Esboço do Fluxo Atual

1.  **Pré-visualização (Home):**
    *   Usuário (não autenticado) faz upload de um contrato.
    *   Sistema gera um preview e armazena temporariamente (`preview_cache` no Supabase com `tempId`).
    *   Componente relevante: `src/components/preview/PreviewUpload.tsx` (assumido)

2.  **Decisão de Migrar:**
    *   Usuário interage com a UI para iniciar a análise completa/migração.
    *   Componente relevante: `src/components/preview/PreviewResult.tsx` (assumido)

3.  **Dialog de Autenticação/Registro:**
    *   O componente `src/components/auth/PreviewRegisterDialog.tsx` é exibido.
    *   Oferece opções: Login (Email/Senha, Google) ou Registro (Email/Senha, Google).

4.  **Processo de Autenticação/Registro:**
    *   **Email/Senha:**
        *   Registro: `POST /api/auth/register` -> `POST /api/auth/signin` (credentials).
        *   Login: `POST /api/auth/signin` (credentials).
    *   **Google:**
        *   Inicia fluxo OAuth do Google via `signIn('google', ...)`.
        *   `callbackUrl` é crucial, geralmente configurado para `/api/preview/migrate?tempId={tempId}` ou uma página que lida com a migração.

5.  **Pós-Autenticação e Início da Migração:**
    *   **Email/Senha:** Após login bem-sucedido, `PreviewRegisterDialog` chama `handleMigration()`.
    *   **Google:** O `callbackUrl` direciona o fluxo (provavelmente para a API de migração ou uma página que a chama).
    *   **`handleMigration()` (no Frontend):** Chama `POST /api/preview/migrate` com `{ tempId }`.

6.  **Endpoint de Migração (`POST /api/preview/migrate`):**
    *   Localização: `src/app/api/preview/migrate/route.ts`
    *   **Requer Autenticação:** Verifica a sessão do usuário (`getServerSession`).
    *   Busca dados da `preview_cache` usando `tempId`.
    *   **Cria `Contract`:** Registra um novo contrato no Prisma, associando-o ao `userId` da sessão.
    *   **Inicia Background Processing:** Chama `processContractInBackground(contract.id, fileFromCache, userId)`.
        *   Faz upload do arquivo original (do cache) para o Supabase Storage.
        *   Adiciona job à fila Redis (`src/lib/queue.common.js`).
    *   Limpa a entrada da `preview_cache`.
    *   Retorna `{ success: true, contractId: contract.id }`.

7.  **Monitoramento e Redirecionamento (Frontend):**
    *   `PreviewRegisterDialog` recebe `contractId`.
    *   Exibe UI de "Analisando..." (com polling).
    *   Faz GET em `/api/contracts/[id]/status` periodicamente.
    *   Endpoint de Status (`src/app/api/contracts/[id]/status/route.ts`): Retorna status e `isAnalysisComplete`.
    *   Após `isAnalysisComplete === true`, redireciona para `/contracts/[contractId]`.

## Pontos a Confirmar/Melhorar:

*   Fluxo exato do `callbackUrl` do Google Sign-In.
*   Tratamento de erros em cada etapa (autenticação, busca no cache, criação do contrato, adição à fila).
*   Experiência do usuário caso ele feche o modal durante a autenticação/migração.
*   Segurança: Validação do `tempId` e associação correta com o usuário logado. 
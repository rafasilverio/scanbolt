# Guia de Contribuição

Obrigado pelo interesse em contribuir com o ScanContract! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Primeiros Passos

### Configuração do Ambiente de Desenvolvimento

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/scancontract.git
   cd scancontract
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o ambiente:**
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha as variáveis de ambiente necessárias (veja [DEPLOYMENT.md](./DEPLOYMENT.md) para detalhes)

4. **Configure o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Em um terminal separado, inicie o worker:**
   ```bash
   node src/scripts/worker.js
   ```

## Estrutura do Projeto

Familiarize-se com a estrutura do projeto antes de contribuir:

- `src/app/` - Rotas e páginas da aplicação (Next.js App Router)
- `src/components/` - Componentes React reutilizáveis
- `src/lib/` - Bibliotecas e utilitários
- `src/scripts/` - Scripts de linha de comando (incluindo o worker)
- `prisma/` - Schema e migrações do banco de dados
- `public/` - Arquivos estáticos públicos
- `docs/` - Documentação do projeto

## Fluxo de Trabalho de Desenvolvimento

### Branches

- `main` - Branch principal, sempre estável e pronta para produção
- `develop` - Branch de desenvolvimento, para integração de recursos
- `feature/nome-do-recurso` - Branches para novos recursos
- `fix/nome-do-bug` - Branches para correções de bugs

### Processo de Contribuição

1. **Crie uma branch:**
   ```bash
   git checkout -b feature/seu-recurso
   ```

2. **Faça suas alterações:**
   - Escreva código claro e bem documentado
   - Siga os padrões de código existentes
   - Adicione testes quando apropriado

3. **Teste suas alterações:**
   ```bash
   npm run lint
   npm run build
   npm test
   ```

4. **Commit suas alterações:**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
   Siga o padrão de commit [Conventional Commits](https://www.conventionalcommits.org/)

5. **Envie sua branch:**
   ```bash
   git push origin feature/seu-recurso
   ```

6. **Abra um Pull Request:**
   - Descreva claramente suas alterações
   - Mencione quaisquer problemas relacionados
   - Aguarde revisão

## Padrões de Código

### Estilo de Código

- Usamos ESLint para garantir a consistência do código
- Siga o estilo de código já presente no projeto
- Use TypeScript para novas implementações

### Princípios de Design

1. **Componentes:**
   - Mantenha os componentes pequenos e focados
   - Siga o padrão de "Componentes de Apresentação e Contêineres"
   - Use o sistema de design da aplicação (baseado em TailwindCSS)

2. **Estado e Side Effects:**
   - Use React Hooks para gerenciar estado e efeitos colaterais
   - Mantenha a lógica de negócios separada da camada de apresentação
   - Minimize o uso de estado global

3. **Processamento Assíncrono:**
   - Utilize a arquitetura de fila para operações pesadas
   - Mantenha o worker separado da aplicação Next.js

## Documentação

- Adicione comentários ao código quando necessário
- Atualize a documentação quando fizer alterações significativas
- Use JSDoc para documentar funções e componentes complexos

## Testes

- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes existente
- Teste manualmente fluxos críticos antes de submeter PRs

## Implementação do Worker

Se estiver trabalhando no worker de processamento:

1. Certifique-se de testar exaustivamente com diferentes tipos de contratos
2. Lembre-se que o worker é executado em um ambiente Node.js separado
3. Considere o consumo de memória e CPU para documentos grandes
4. Documente quaisquer alterações na API de processamento

## Relatando Problemas

Se encontrar um bug ou tiver uma sugestão:

1. Verifique se o problema já foi relatado
2. Use o modelo de issue para fornecer informações completas
3. Inclua:
   - Passos para reproduzir o problema
   - Comportamento esperado vs. atual
   - Capturas de tela/logs relevantes
   - Informações do ambiente (navegador, sistema operacional)

## Perguntas?

Se tiver dúvidas sobre o processo de contribuição, sinta-se à vontade para abrir uma issue com a tag "pergunta" ou entrar em contato com os mantenedores. 
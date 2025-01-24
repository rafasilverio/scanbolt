# Implementação do PDF Viewer - Roadmap

## Fase 1 - Setup e Teste do PDF Viewer ✅
### Instalação e Configuração
- [x] Instalar dependências
- [x] Configurar worker do PDF.js

### Componente PDFViewer
- [x] Criar componente base
- [x] Implementar visualização do PDF
- [x] Adicionar sistema de highlights estático
- [x] Implementar InlineComment com dados estáticos
- [x] Testar em rota separada (/pdf-test)

## Fase 2 - Adaptar Extrator de Texto 🚧
### Extração com Posicionamento
- [ ] Modificar função extractTextContent
- [ ] Adicionar informações de coordenadas
- [ ] Implementar extração por página

### Atualização de Tipos
- [x] Criar interfaces para posicionamento
- [x] Atualizar tipos existentes
- [x] Documentar novas interfaces

### Detalhes para Fase 2:
Na implementação atual do PDFViewer de test, temos:
1. Highlights estáticos
2. InlineComment apenas representativo
3. Sem integração real com o estado do contrato

Precisamos adaptar para ter a mesma funcionalidade do ContractViewer atual, onde:
1. Os highlights são dinâmicos e vêm do contrato
2. O InlineComment é totalmente funcional, mostrando:
-- Texto original
-- Explicação do problema
-- Sugestão da AI
3. Integração com o estado global do contrato via useContractStore
4. Sistema de navegação entre issues
5. Diferenciação entre primeira issue crítica e demais issues
6. Integração com a lógica de upgrade (Stripe ainda não implementado)
###

## Fase 3 - Implementar Novo ContractContent 📝
### Componentes
- [ ] Criar NewContractContent (paralelo ao atual)
- [ ] Implementar HighlightLayer
- [ ] Integrar com sistema de comentários

## Fase 4 - Migração Gradual 📝
### Feature Flag
- [ ] Implementar sistema de feature flag
- [ ] Criar rota de teste para nova versão
- [ ] Preparar sistema de fallback

### Testes e Feedback
- [ ] Testar com grupo inicial de usuários
- [ ] Coletar e analisar feedback
- [ ] Ajustar posicionamento e estilos
- [ ] Resolver bugs reportados

## Fase 5 - Finalização 📝
### Limpeza e Otimização
- [ ] Remover código legado
- [ ] Otimizar performance
- [ ] Implementar lazy loading de páginas

### Features Extras
- [ ] Zoom in/out
- [ ] Navegação entre páginas
- [ ] Miniaturas das páginas
- [ ] Busca no documento
- [ ] Exportação de relatório

### Documentação
- [ ] Documentar componentes
- [ ] Criar guia de uso
- [ ] Documentar tipos e interfaces

## Notas Importantes
- Manter compatibilidade com a versão atual durante a migração
- Priorizar performance e usabilidade
- Testar em diferentes tamanhos de PDF
- Garantir suporte a diferentes tipos de dispositivos
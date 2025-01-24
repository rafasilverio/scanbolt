1. Navegação e Scroll de Issues
Implementar a funcionalidade de scroll até a posição da issue no PDF quando clicada na sidebar
Remover a marcação colorida no PDF, mantendo apenas a navegação
Usar as posições salvas (startIndex, endIndex, pageNumber) para localizar o texto

2. Separação de Issues e Novas Cláusulas
Atualmente temos:
interface Contract {
  issues: ContractIssue[];
  suggestedClauses: SuggestedClause[];
}

O modelo atual já está preparado para essa separação, precisamos:
1. Ajustar o prompt da OpenAI para retornar claramente:
Issues existentes (melhorias em cláusulas atuais)
Sugestões de novas cláusulas

2.Modificar a análise da OpenAI para:
async function analyzeContract(text: string): Promise<{
  issues: ContractIssue[];      // Problemas em cláusulas existentes
  suggestedClauses: SuggestedClause[];  // Novas cláusulas sugeridas
}> {
  // Novo prompt específico
  // Processamento separado
}


## Passos de Implementação:

1. Atualizar NewContractContent.tsx:
- Remover lógica de highlights coloridos
- Implementar scroll para posição da issue
- Separar exibição de issues e suggested clauses na sidebar

2. Atualizar o Prompt da OpenAI:
- Separar claramente a análise em duas partes
- Garantir que as posições no texto sejam precisas

3. Ajustar PDFViewer:
- Implementar função de scroll para posição específica
- Remover highlight colorido
- Manter indicador de posição atual

--
Dúvidas para alinhar:
Certo, já começamos a implementar algumas coisas, fizemos um ajuste no novo formato dos types@contract.ts 

Dúvidas para Alinharmos:
1. Na exibição das novas cláusulas sugeridas:
Como você prefere que elas apareçam na sidebar?
Igual na imagem, elas já aparecem semelhante ao que precisamos no @NewContractContent.tsx na lateral do lado direito. Exceto as novas clausulas (porque é uma função nova)

Devemos ter uma seção separada para elas?
Podemos manter na mesma barra por enquanto.

No scroll até a posição:
Deseja algum indicador visual temporário quando chegar na posição?
Sim, uma marcação simples na posição inicial da issue.

Como lidar com issues que se estendem por múltiplas páginas?
Marcar apenas no inicio e rolar no inicio da issue.

3. Na transição do modelo atual:
Precisamos manter compatibilidade com contratos já analisados?
não é necessário, já migramos o banco de dados, não se preocupe com isso.

Podemos fazer a migração gradual?
Já fizemos do banco de dados, não precisa se preocupar com isso.

Lembrando que vamos usar a @react-pdf-highlighter-extended verifique na Docs do Cursor a implementação e função dela.
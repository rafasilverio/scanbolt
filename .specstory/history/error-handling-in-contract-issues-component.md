## SpecStory

## Error Handling in Contract Issues Component (14/02/2025, 12:53:36)

_**User**_

Eu recebi esse erro ao clicar nas issues da página src/app/(protected)/contracts/[id]/page.tsx (169:19) @ onIssueClick

  167 |           isFirstIssue={contract?.status === 'under_review'}
  168 |           onUpgrade={handleGenerateRevision} selectedIssue={null} onIssueClick={function (issue: ContractIssue): void {
> 169 |             throw new Error('Function not implemented.');
      |                   ^
  170 |           } } onNext={function (): void {
  171 |             throw new Error('Function not implemented.');
  172 |           } } onClose={function (): void {

---

_**Assistant**_

Entendo que você está recebendo um erro porque a função `onIssueClick` não está implementada. Vou ajudar você a implementar essa função no componente.

Aqui está como podemos corrigir o código na página dos contratos:

```typescript:src/app/(protected)/contracts/[id]/page.tsx
// ... existing code ...

// Adicione o estado para controlar a issue selecionada
const [selectedIssue, setSelectedIssue] = useState<ContractIssue | null>(null);

// Implemente a função onIssueClick
const handleIssueClick = (issue: ContractIssue) => {
  setSelectedIssue(issue);
};

// No componente ContractReview, atualize as props
<ContractReview
  contract={contract}
  issues={issues}
  suggestedClauses={suggestedClauses}
  isFirstIssue={contract?.status === 'under_review'}
  onUpgrade={handleGenerateRevision}
  selectedIssue={selectedIssue}
  onIssueClick={handleIssueClick}
  onNext={() => {
    // Implementar lógica para próxima issue
    const currentIndex = issues.findIndex(i => i.id === selectedIssue?.id);
    if (currentIndex < issues.length - 1) {
      setSelectedIssue(issues[currentIndex + 1]);
    }
  }}
  onClose={() => setSelectedIssue(null)}
/>

// ... existing code ...
```

Explicação das alterações:
1. Adicionamos um estado `selectedIssue` para controlar qual issue está selecionada
2. Implementamos a função `handleIssueClick` que atualiza o estado quando uma issue é clicada
3. Implementamos a função `onNext` para navegar para a próxima issue na lista
4. Implementamos a função `onClose` para limpar a issue selecionada

Essas alterações devem resolver o erro e implementar a funcionalidade básica de seleção e navegação entre as issues. Você pode ajustar a lógica do `onNext` e outras funções de acordo com suas necessidades específicas.

---

_**User**_

eu não posso simplesmente passar um "null" ao inves de implementar?

---

_**Assistant**_

Não é recomendado passar `null` para as funções de callback (`onIssueClick`, `onNext`, `onClose`). Mesmo que você não precise da funcionalidade completa, é melhor implementar funções vazias (no-op) do que deixar funções que lançam erros.

Aqui está a correção:

```typescript:src/app/(protected)/contracts/[id]/page.tsx
// ... existing code ...
        <NewContractContent
          contract={contract}
          isFirstIssue={contract?.status === 'under_review'}
          onUpgrade={handleGenerateRevision}
          selectedIssue={null}
          onIssueClick={() => {}} // função vazia
          onNext={() => {}}       // função vazia
          onClose={() => {}}      // função vazia
        />
// ... existing code ...
```

Desta forma:
1. O código não lançará erros quando essas funções forem chamadas
2. Se você precisar implementar a funcionalidade no futuro, pode facilmente substituir as funções vazias
3. É uma prática mais segura do que ter funções que lançam erros

---

_**User**_

perfeito, obg!

---

_**Assistant**_

De nada! Fico feliz em ajudar. A solução com funções vazias (no-op) é uma prática comum e segura quando você não precisa implementar certas funcionalidades imediatamente. Se precisar implementar alguma dessas funções no futuro ou tiver outras dúvidas, pode me perguntar!

---

_**User**_

eu estou com esse erro no @page.tsx podemos contornar ele ou omitir ele?

---

_**Assistant**_

Sim, podemos corrigir da mesma forma que fizemos anteriormente, substituindo as funções que lançam erro por funções vazias:

```typescript:src/app/preview/[tempId]/page.tsx
// ... existing code ...
            <NewContractContent
              contract={previewData ?? undefined}
              isFirstIssue={false}
              onUpgrade={() => {}}    // função vazia
              onNext={() => {}}       // função vazia
              onClose={() => {}}      // função vazia
              selectedIssue={null}
              onIssueClick={() => {}} // função vazia
            />
// ... existing code ...
```

Essa alteração vai remover os erros e manter o componente funcionando, mesmo que sem as implementações específicas dessas funções. Como é uma página de preview, provavelmente você não precisa implementar essas ações de qualquer forma.

---

_**User**_

o que pode ser este erro? A tela abre normal mas aparece esse erro no console e o navegador travou

---

_**Assistant**_

Esse erro está ocorrendo porque o componente PDF está tentando acessar objetos do navegador (`window` e `document`) durante o Server-Side Rendering (SSR) do Next.js, onde esses objetos não existem.

Para resolver isso, você precisa fazer o componente que usa o PDF viewer ser carregado apenas no lado do cliente. Você pode fazer isso usando dynamic imports com a opção `ssr: false`.

Aqui está como você pode modificar o componente:

```typescript:src/components/contracts/PDFViewer.tsx
import dynamic from 'next/dynamic';

// Importe o componente PDF de forma dinâmica, desabilitando SSR
const PDFViewer = dynamic(
  () => import('./PDFViewerComponent'), // crie um novo arquivo com o componente original
  { 
    ssr: false,
    loading: () => <div>Loading PDF viewer...</div>
  }
);

export default PDFViewer;
```

E crie um novo arquivo para o componente original:

```typescript:src/components/contracts/PDFViewerComponent.tsx
'use client';

// Mova o código original do PDFViewer para cá
// ... seu código do PDFViewer aqui ...
```

Isso vai fazer com que:
1. O componente PDF só seja carregado no lado do cliente
2. Evite os erros de `window is not defined` e `document is not defined`
3. Mostre um componente de loading enquanto o viewer está carregando

O erro `Promise.withResolvers is not a function` também será resolvido, pois está relacionado ao mesmo problema de SSR.

---

_**User**_

obrigado!

---

_**Assistant**_



---



---


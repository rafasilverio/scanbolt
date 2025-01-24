## SpecStory

## TypeScript Error: Contract Type Mismatch (10/11/2024, 22:41:27)

_**User**_

For the code present, we get this error:
```
O argumento do tipo '{ status: "under_review"; id?: string | undefined; title?: string | undefined; content?: string | undefined; fileUrl?: string | undefined; fileType?: string | undefined; highlights?: Highlight[] | undefined; changes?: AIChange[] | undefined; createdAt?: string | undefined; updatedAt?: string | undefined; }' não é atribuível ao parâmetro do tipo 'Contract'.
  Tipos de propriedade 'id' são incompatíveis.
    O tipo 'string | undefined' não pode ser atribuído ao tipo 'string'.
      O tipo 'undefined' não pode ser atribuído ao tipo 'string'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error is in Portuguese and indicates that the `Contract` type requires certain fields to be non-optional, specifically the `id` field must be a string and cannot be undefined.

Here's the fix:

```typescript:src/components/contracts/ContractViewer.tsx
// ... existing code ...
      // Reset status on error
      setContract({ ...storeContract!, status: 'under_review' });
// ... existing code ...
```

The fix adds a non-null assertion operator (`!`) to `storeContract` to tell TypeScript that we're certain `storeContract` is not null at this point. Alternatively, you could add a check:

```typescript:src/components/contracts/ContractViewer.tsx
// ... existing code ...
      // Reset status on error
      if (storeContract) {
        setContract({ ...storeContract, status: 'under_review' });
      }
// ... existing code ...
```

Choose whichever approach better fits your error handling strategy.

---



---


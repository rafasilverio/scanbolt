## SpecStory

## Resolving Null Error in TypeScript Code (10/11/2024, 22:44:04)

_**User**_

For the code present, we get this error:
```
'storeContract' é possivelmente 'null'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because `storeContract` might be null when accessing its `id` property. Here's the fix:

```typescript:src/components/contracts/ContractViewer.tsx
  const handleViewRevision = () => {
    if (!storeContract) return;
    router.push(`/contracts/${storeContract.id}/revision`);
  };
```

I added a null check before accessing `storeContract.id`. This ensures we only try to navigate when `storeContract` exists.

---



---


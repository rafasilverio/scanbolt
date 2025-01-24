## SpecStory

## Resolving Import Error in TypeScript Component (08/11/2024, 20:37:48)

_**User**_

For the code present, we get this error:
```
O módulo '"@/components/contracts/ContractViewer"' não tem membro exportado 'ContractViewer'. Você quis dizer 'importar ContractViewer de "@/components/contracts/ContractViewer"' em vez disso?
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

Based on the error message (which is in Portuguese and indicates a default export issue), it seems the `ContractViewer` component is likely exported as a default export rather than a named export.

Here's the fix:

```typescript:src/app/(auth)/contracts/[id]/page.tsx
import ContractViewer from '@/components/contracts/ContractViewer';
// ... rest of the code ...
```

The change is to remove the curly braces `{}` from the import statement, as they are used for named exports while default exports are imported without them.

Alternatively, if you want to keep the named export, you would need to modify the `ContractViewer` component file to export using `export const` instead of `export default`.

---



---


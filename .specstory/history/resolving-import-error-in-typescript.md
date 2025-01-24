## SpecStory

## Resolving Import Error in TypeScript (28/11/2024, 16:30:50)

_**User**_

For the code present, we get this error:
```
O módulo '"@/components/contracts/StatsHeader"' não tem membro exportado 'StatsHeader'. Você quis dizer 'importar StatsHeader de "@/components/contracts/StatsHeader"' em vez disso?
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error message (in Portuguese) indicates that `StatsHeader` is not exported correctly from the module. This is likely because it's a default export rather than a named export.

Here's how to fix it - you have two options:

1. Either change the import to use default import:
```typescript:src/app/(protected)/contracts/[id]/page.tsx
// ... existing code ...
import StatsHeader from '@/components/contracts/StatsHeader';
// ... existing code ...
```

2. Or ensure `StatsHeader` is exported as a named export in its source file (`@/components/contracts/StatsHeader.tsx`).

The first option is the quickest fix if `StatsHeader` is indeed exported as default in its source file.

---



---


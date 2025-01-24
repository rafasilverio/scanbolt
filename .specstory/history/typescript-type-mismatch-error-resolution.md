## SpecStory

## TypeScript Type Mismatch Error Resolution (10/11/2024, 22:43:25)

_**User**_

For the code present, we get this error:
```
Esta comparação parece não ser intencional porque os tipos '"under_review" | "rejected" | "draft" | "approved" | undefined' e '"generating"' não têm sobreposição.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error indicates a type mismatch - `'generating'` is not included in the possible status types. You'll need to add it to your contract status type definition. Here's the fix:

```typescript:src/types/contract.ts
// ... existing code ...
type ContractStatus = 'under_review' | 'rejected' | 'draft' | 'approved' | 'generating';
// ... existing code ...
```

And then your existing comparison will work correctly. The error occurs because TypeScript is correctly telling you that you're comparing against a status value that isn't in the defined type union.

If you don't want to modify the type definition, you could alternatively check for the generating status in a different way:

```typescript:src/components/contracts/ContractViewer.tsx
// ... existing code ...
const isGenerating = storeContract?.status === 'under_review' && storeIsGenerating;
// ... existing code ...
```

This uses the `storeIsGenerating` boolean that's already available from your store instead of checking for a 'generating' status.

---



---


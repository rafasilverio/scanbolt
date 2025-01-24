## SpecStory

## Resolving TypeScript Implicit 'any' Error (10/11/2024, 22:40:29)

_**User**_

For the code present, we get this error:
```
O parâmetro 'h' implicitamente tem um tipo 'any'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error is in Portuguese and means "Parameter 'h' implicitly has an 'any' type." To fix this, we need to explicitly type the parameter in the filter callback function.

Here's the fix:

```typescript:src/components/contracts/StatsHeader.tsx
  // Count all types of highlights using lowercase comparison
  const warningCount = highlights.filter((h: Highlight) => 
    h.type?.toLowerCase() === 'warning'
  ).length;
```

I added the `Highlight` type to the parameter `h`, which is already imported from `@/types/contract`. This same fix should also be applied to the other similar filter functions for `dangerCount` and `improvementCount`.

---

_**User**_

[{
	"resource": "/Users/rafasilverio/sites/scancontract/src/lib/auth.ts",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "O tipo '(credentials: Record<\"email\" | \"password\", string> | undefined) => Promise<{ id: any; email: any; name: any; role: any; contracts_remaining: any; }>' não pode ser atribuído ao tipo '(credentials: Record<\"email\" | \"password\", string> | undefined, req: Pick<RequestInternal, \"headers\" | \"body\" | \"query\" | \"method\">) => Awaitable<...>'.\n  O tipo 'Promise<{ id: any; email: any; name: any; role: any; contracts_remaining: any; }>' não pode ser atribuído ao tipo 'Awaitable<User | null>'.\n    O tipo 'Promise<{ id: any; email: any; name: any; role: any; contracts_remaining: any; }>' não pode ser atribuído ao tipo 'PromiseLike<User | null>'.\n      Tipos de propriedade 'then' são incompatíveis.\n        O tipo '<TResult1 = { id: any; email: any; name: any; role: any; contracts_remaining: any; }, TResult2 = never>(onfulfilled?: ((value: { id: any; email: any; name: any; role: any; contracts_remaining: any; }) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<...>)...' não pode ser atribuído ao tipo '<TResult1 = User | null, TResult2 = never>(onfulfilled?: ((value: User | null) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<...>) | null | undefined) => PromiseLike<...>'.\n          Os tipos de parâmetros 'onfulfilled' e 'onfulfilled' são incompatíveis.\n            Os tipos de parâmetros 'value' e 'value' são incompatíveis.\n              O tipo '{ id: any; email: any; name: any; role: any; contracts_remaining: any; }' não tem as propriedades a seguir do tipo 'User': provider, createdAt, updatedAt",
	"source": "ts",
	"startLineNumber": 19,
	"startColumn": 13,
	"endLineNumber": 19,
	"endColumn": 22,
	"relatedInformation": [
		{
			"startLineNumber": 13,
			"startColumn": 5,
			"endLineNumber": 13,
			"endColumn": 14,
			"message": "O tipo esperado vem da propriedade 'authorize', que é declarada aqui no tipo 'UserCredentialsConfig<{ email: { label: string; type: string; }; password: { label: string; type: string; }; }>'",
			"resource": "/Users/rafasilverio/sites/scancontract/node_modules/next-auth/providers/credentials.d.ts"
		}
	]
}]

---

_**Assistant**_

The error (in Portuguese) indicates that the return type from the `authorize` function doesn't match the expected `User` type from NextAuth. We need to properly type the return value to match NextAuth's `User` interface.

Here's the fix:

```typescript:src/lib/auth.ts
// ... existing code ...
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check user in Supabase
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (!user) {
          throw new Error("User not found");
        }

        // Verify password
        const validPassword = await bcryptjs.compare(credentials.password, user.password);
        if (!validPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contracts_remaining: user.contracts_remaining,
          provider: 'credentials',
          createdAt: user.created_at,
          updatedAt: user.updated_at
        };
      }
// ... existing code ...
```

The key changes are:
1. Added `provider: 'credentials'` to match NextAuth's User interface
2. Added `createdAt` and `updatedAt` fields (assuming they exist in your Supabase user table)

If you need to properly type this, you might want to create a custom type that extends NextAuth's User interface:

```typescript
import { User } from "next-auth"

interface CustomUser extends User {
  role: string;
  contracts_remaining: number;
}
```

---

_**User**_

[{
	"resource": "/Users/rafasilverio/sites/scancontract/src/components/contracts/ContractViewer.tsx",
	"owner": "typescript",
	"code": "2322",
	"severity": 8,
	"message": "O tipo 'Contract | null' não pode ser atribuído ao tipo 'Contract | undefined'.\n  O tipo 'null' não pode ser atribuído ao tipo 'Contract | undefined'.",
	"source": "ts",
	"startLineNumber": 338,
	"startColumn": 30,
	"endLineNumber": 338,
	"endColumn": 38,
	"relatedInformation": [
		{
			"startLineNumber": 12,
			"startColumn": 3,
			"endLineNumber": 12,
			"endColumn": 11,
			"message": "O tipo esperado vem da propriedade 'contract', que é declarada aqui no tipo 'IntrinsicAttributes & DocumentWrapperProps'",
			"resource": "/Users/rafasilverio/sites/scancontract/src/components/contracts/DocumentWrapper.tsx"
		}
	]
}]

---

_**Assistant**_



The error indicates that `DocumentWrapper` expects a `Contract | undefined` but is receiving a `Contract | null`. Here's how to fix it:

```typescript:src/components/contracts/ContractViewer.tsx
// ... existing code ...
            <DocumentWrapper contract={storeContract || undefined}>
              <ContractContent
                contract={storeContract}
                selectedHighlight={selectedHighlight}
                selectedChange={selectedChange}
                onChangeSelect={setSelectedChange}
              />
            </DocumentWrapper>
// ... existing code ...
```

The fix converts `null` to `undefined` using the `|| undefined` operator when passing the contract prop to `DocumentWrapper`.

---



---


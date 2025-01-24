## SpecStory

## Resolving TypeScript Module Not Found Error (09/11/2024, 22:15:16)

_**User**_

For the code present, we get this error:
```
Não é possível localizar o módulo './database.types' ou suas declarações de tipo correspondentes.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error is in Portuguese and says "Cannot find module './database.types' or its corresponding type declarations."

You need to generate the TypeScript types for your Supabase database. Here's how to fix it:

1. Install the Supabase CLI if you haven't already:
```bash
npm install supabase --save-dev
```

2. Generate the types by running:
```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

Replace `your-project-id` with your actual Supabase project ID, which you can find in your Supabase dashboard settings.

This will create the missing `database.types.ts` file with the correct type definitions based on your Supabase schema.

---



---


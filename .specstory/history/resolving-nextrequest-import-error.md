## SpecStory

## Resolving NextRequest Import Error (10/11/2024, 00:10:45)

_**User**_

For the code present, we get this error:
```
Não é possível encontrar o nome 'NextRequest'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error message in Portuguese says "Cannot find name 'NextRequest'". You need to import NextRequest from next/server.

Here's the fix:

```typescript:src/app/api/contracts/upload/route.ts
// ... existing imports ...
import { NextResponse, NextRequest } from 'next/server';
// ... rest of the code ...
```

Just add `NextRequest` to the existing `NextResponse` import at the top of the file.

---

_**User**_

the error 405 appear after this PDF/extract implementation

---

_**Assistant**_

A 405 error means "Method Not Allowed". The issue is likely because we need to specify the allowed HTTP methods in Next.js 13+ API routes. Let's add the necessary configuration:

```typescript:src/app/api/contracts/upload/route.ts
// ... existing imports ...

// Add this export to specify allowed methods
export const dynamic = 'force-dynamic';
export const allowedMethods = ['POST'];

// ... rest of the code ...
```

If that doesn't resolve it, an alternative approach would be to explicitly handle the HTTP methods:

```typescript:src/app/api/contracts/upload/route.ts
// ... existing imports ...

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  // ... rest of your existing POST handler code ...
}
```

Try one of these approaches and let me know if you're still experiencing issues.

---

_**User**_

lets remove the extractTextContent and use only for TXT or use a name of file in Contract content

---

_**Assistant**_

Here's the simplified version that only handles TXT files and falls back to filename for other types:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files only
    if (fileType === 'text/plain') {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

This version:
1. Only processes text/plain files
2. Returns the filename for all other file types (including PDFs)
3. Removes the PDF parsing logic entirely
4. Falls back to filename if any error occurs

The rest of your code can remain unchanged since it still expects the same function signature and return type.

---

_**User**_

its work, let continue without PDF content extract

---

_**Assistant**_

Great decision! Keeping it simple with just text files and using filenames for other types is a more maintainable approach. If you need PDF content extraction in the future, it can be implemented as a separate feature with proper error handling and testing.

Would you like to proceed with any other modifications to the code?

---



---


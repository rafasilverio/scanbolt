## SpecStory

## Handling TypeScript Unknown Error Types (11/11/2024, 14:14:36)

_**User**_

For the code present, we get this error:
```
'error' é do tipo 'desconhecido'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error occurs because TypeScript doesn't know the type of the error being caught. Here's how to fix it:

```typescript:src/components/contracts/upload/UploadZone.tsx
  const uploadContract = async (formData: FormData) => {
    try {
      // ... existing code ...
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to upload contract');
    }
  };
```

The fix involves:
1. Changing `error` to `err` in the catch clause
2. Adding a type check using `instanceof` to safely access the error message

This ensures TypeScript knows how to handle the error object properly.

---

_**User**_

help me to fix the vercel 504 for hobby plans like we did in Upload/route.ts to Revision/route.ts

---

_**Assistant**_

I'll help you add similar timeout handling to the Revision route. Here's how to modify it:

```typescript:src/app/api/contracts/revision/route.ts
export const maxDuration = 60; // Set max duration to Vercel default
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 250000); // 250 seconds timeout
    });

    // Wrap processing in a promise
    const processingPromise = async () => {
      const { contractId, changes } = await req.json();
      // ... existing processing code ...
      return { success: true, contract };
    };

    // Race between timeout and processing
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    return NextResponse.json(result);

  } catch (error: any) {
    await prisma.$disconnect();
    
    console.error('Revision error:', error);
    
    if (error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to revise contract' },
      { status: error.status || 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```

The key changes are:
1. Added `maxDuration` and `dynamic` exports for Vercel configuration
2. Added timeout promise with 250s limit
3. Wrapped the main processing logic in a promise
4. Used `Promise.race` to handle timeouts
5. Added specific error handling for timeout cases
6. Ensured proper Prisma disconnection in catch and finally blocks

This follows the same pattern we used in the Upload route to handle long-running requests on Vercel's hobby plan.

---

_**User**_

the correct file is @route.ts 

---

_**Assistant**_

I'll help you apply the timeout handling to the correct file. Here are the changes needed:

```typescript:src/app/api/contracts/[id]/revision/route.ts
export const maxDuration = 60; // Set max duration to Vercel default
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 250000); // 250 seconds timeout
    });

    // Wrap processing in a promise
    const processingPromise = async () => {
      // Get existing contract with current highlights and changes
      const existingContract = await prisma.contract.findUnique({
        where: { id: params.id }
      });
      
      // ... rest of the existing processing code ...
      
      return NextResponse.json({
        success: true,
        contract: {
          ...revisionContract,
          highlights: newHighlights,
          changes: newChanges,
          content: aiResponse.finalContent
        }
      });
    };

    // Race between timeout and processing
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    return result;

  } catch (error) {
    console.error('Error in revision generation:', error);
    
    // Revert to original state on error
    await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: 'under_review',
        updatedAt: new Date()
      }
    });

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate revision' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```

Key changes made:
1. Added `maxDuration` and `dynamic` exports
2. Added timeout promise with 250s limit
3. Wrapped the main processing logic in a promise
4. Added `Promise.race` to handle timeouts
5. Added specific timeout error handling
6. Added `finally` block with Prisma disconnect
7. Improved error handling with proper type checking

This should help handle long-running requests better on Vercel's hobby plan and prevent 504 timeouts.

---

_**User**_

now i have this error on deploy for vercel 

Type error: Route "src/app/api/contracts/[id]/revision/route.ts" has an invalid export:
  "Promise<unknown>" is not a valid POST return type:
    Expected "void | Response | Promise<void | Response>", got "Promise<unknown>".
      Expected "Promise<void | Response>", got "Promise<unknown>".
        Expected "void | Response", got "unknown".

---

_**Assistant**_



The error occurs because the `Promise.race` return type isn't properly typed. Here's the fix:

```typescript:src/app/api/contracts/[id]/revision/route.ts
// ... existing imports ...

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {  // Add return type
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add timeout promise
    const timeoutPromise = new Promise<Response>((_, reject) => {  // Type the promise
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 250000);
    });

    // Wrap processing in a promise
    const processingPromise = async (): Promise<Response> => {  // Type the promise
      // ... existing processing code ...
    };

    // Race between timeout and processing
    return await Promise.race([processingPromise(), timeoutPromise]);

  } catch (error) {
    // ... existing error handling ...
  }
}
```

The key changes are:
1. Added explicit return type `Promise<Response>` to the POST function
2. Typed the promises to return `Response`
3. Changed `const result = await Promise.race` to directly return the result

This should resolve the Vercel deployment type error.

---

_**User**_

whats the best way to enhance performance on GET @route.ts  for @page.tsx ?

---

_**Assistant**_



To enhance performance, we can make several optimizations. Here's how to improve both files:

```typescript:src/app/api/contracts/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Use singleton instance
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Add cache control
export const revalidate = 3600; // Cache for 1 hour
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use select instead of include for better performance
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        content: true,
        status: true,
        highlights: true,
        changes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (contract.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Add cache headers
    return NextResponse.json(contract, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

```typescript:src/app/(protected)/contracts/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ContractsList } from '@/components/contracts/ContractsList';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import Link from 'next/link';
import { cache } from 'react';

// Cache the data fetching
const getContractsData = cache(async (email: string) => {
  return prisma.$transaction(async (tx) => {
    const [user, contracts] = await Promise.all([
      tx.user.findUnique({
        where: { email },
        select: { id: true }
      }),
      tx.contract.findMany({
        where: { 
          user: { email }
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          // Add only needed fields
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return { user, contracts };
  });
});

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const { contracts } = await getContractsData(session.user.email);

  // Memoize filtered counts
  const underReviewCount = contracts.filter(c => c.status === 'under_review').length;
  const approvedCount = contracts.filter(c => c.status === 'approved').length;

  return (
    <div className="container mx-auto py-8">
      {/* Rest of the JSX */}
    </div>
  );
}
```

Key improvements made:

1. **API Route Optimizations**:
   - Removed multiple Prisma disconnects
   - Used singleton Prisma instance
   - Added cache control headers
   - Used `select` instead of `include` for better performance
   - Added specific field selection to reduce payload size

2. **Page Optimizations**:
   - Cached data fetching using React's `cache` function
   - Used parallel Promise.all for concurrent queries
   - Optimized database queries with specific field selection
   - Combined queries into a single transaction
   - Removed unnecessary fields from the query

3. **General Improvements**:
   - Added revalidation strategy
   - Improved error handling
   - Reduced database round trips
   - Optimized data fetching patterns

These changes should significantly improve the performance by:
- Reducing database queries
- Implementing proper caching
- Minimizing data transfer
- Optimizing database operations
- Using concurrent operations where possible

---



---


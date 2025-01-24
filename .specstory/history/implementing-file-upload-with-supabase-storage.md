## SpecStory

## Implementing File Upload with Supabase Storage (09/11/2024, 22:35:58)

_**User**_

hey Claude, lets implement and fix a upload archives for my project. This is my archives with upload implementation drag n drop, but its not working actually. 

Lets create a real upload to upload the files in supabase storage, save on the database Contract (with user relationship). The simple type of files is : PDF, DOC, DOCX, TXT

---

_**Assistant**_

I'll help you implement the file upload functionality with Supabase storage and database integration. Let's break this down into steps:

1. First, let's update the API route to handle Supabase storage uploads:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate a unique file name
    const fileName = `${Date.now()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('contracts')
      .upload(fileName, buffer);

    if (storageError) {
      throw new Error(storageError.message);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('contracts')
      .getPublicUrl(fileName);

    // Create database record
    const contract = await db.contract.create({
      data: {
        name: file.name,
        fileUrl: publicUrl,
        fileKey: fileName,
        userId: session.user.id,
        status: 'PENDING',
        fileType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ 
      success: true, 
      contract 
    });
    
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}
```

2. Create a Prisma schema for the Contract model if you haven't already:

```prisma:prisma/schema.prisma
model Contract {
  id        String   @id @default(cuid())
  name      String
  fileUrl   String
  fileKey   String
  fileType  String
  fileSize  Int
  status    String   @default("PENDING") // PENDING, PROCESSED, ERROR
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

3. Update the UploadZone component to show upload progress:

```typescript:src/components/contracts/upload/UploadZone.tsx
// ... existing imports ...

const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/contracts/upload', {
      method: 'POST',
      body: formData,
    });

    setProgress(90);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await response.json();
    setProgress(100);

    if (data.success && data.contract) {
      toast.success('Contract uploaded successfully!');
      router.push(`/contracts/${data.contract.id}`);
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Upload error:', error);
    setError(error instanceof Error ? error.message : 'Upload failed');
    toast.error(error instanceof Error ? error.message : 'Upload failed');
  } finally {
    setLoading(false);
    setProgress(0);
  }
};
```

4. Update the ContractPage to fetch real data:

```typescript:src/app/(protected)/contracts/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ContractViewer from "@/components/contracts/ContractViewer";
import { useParams } from 'next/navigation';
import { Contract } from '@prisma/client';

export default function ContractPage() {
  const params = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        const data = await response.json();
        setContract(data.contract);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="h-full">
      <Tabs.Root defaultValue="review" className="h-full">
        {/* ... rest of the component ... */}
      </Tabs.Root>
    </div>
  );
}
```

To make this work, you'll need to:

1. Set up Supabase storage and create a bucket named 'contracts'
2. Add the necessary environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
3. Run the Prisma migration to create the Contract table
4. Create an API endpoint to fetch individual contracts (`/api/contracts/[id]`)

Would you like me to provide the implementation for any of these additional steps?

---

_**User**_

yes, whats de API endpoint we need to create? I have somes ins src/app/api

---

_**Assistant**_

Let's create the API endpoint to fetch individual contracts. Here's the implementation:

```typescript:src/app/api/contracts/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contract = await db.contract.findUnique({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only access their own contracts
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract });
    
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Error fetching contract' },
      { status: 500 }
    );
  }
}
```

You might also want to create an endpoint to fetch all contracts for a user. Here's that implementation:

```typescript:src/app/api/contracts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contracts = await db.contract.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ contracts });
    
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Error fetching contracts' },
      { status: 500 }
    );
  }
}
```

And optionally, you might want to add a DELETE endpoint to remove contracts:

```typescript:src/app/api/contracts/[id]/route.ts
// Add this to the existing route.ts file

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the contract to check ownership and get the fileKey
    const contract = await db.contract.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Delete the file from Supabase storage
    const { error: storageError } = await supabase
      .storage
      .from('contracts')
      .remove([contract.fileKey]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete the database record
    await db.contract.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Error deleting contract' },
      { status: 500 }
    );
  }
}
```

These endpoints provide the basic CRUD operations for contracts:
- GET /api/contracts - List all contracts for the authenticated user
- GET /api/contracts/[id] - Get a specific contract
- POST /api/contracts/upload - Upload a new contract (already implemented)
- DELETE /api/contracts/[id] - Delete a specific contract

Make sure to:

1. Import the Supabase client in the files where it's needed:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

2. Set up proper error handling in your frontend components when calling these endpoints
3. Add loading states and error messages in your UI
4. Implement proper validation for the contract ID parameter

Would you like me to show you how to implement any of these additional features?

---

_**User**_

i have 404 in all requests

---

_**Assistant**_

Let's fix the 404 issue. This usually happens when the routing isn't set up correctly. Since you're using Next.js 13+ with the app router, let's verify the routing structure.

1. First, make sure your folder structure looks like this:

```
src/
  ├── app/
  │   ├── (protected)/
  │   │   └── contracts/
  │   │       ├── page.tsx         # /contracts
  │   │       ├── upload/
  │   │       │   └── page.tsx     # /contracts/upload
  │   │       └── [id]/
  │   │           └── page.tsx     # /contracts/[id]
  │   ├── api/
  │   │   └── contracts/
  │   │       ├── route.ts         # /api/contracts
  │   │       ├── upload/
  │   │       │   └── route.ts     # /api/contracts/upload
  │   │       └── [id]/
  │   │           └── route.ts     # /api/contracts/[id]
  │   ├── layout.tsx
  │   └── page.tsx                 # home page
```

2. Create a root page.tsx if it doesn't exist:

```typescript:src/app/page.tsx
export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1>Welcome to Contract Manager</h1>
    </div>
  );
}
```

3. Make sure you have a root layout.tsx:

```typescript:src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Contract Manager',
  description: 'AI-powered contract management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

4. Create a layout for protected routes:

```typescript:src/app/(protected)/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <>{children}</>;
}
```

5. Create a contracts index page:

```typescript:src/app/(protected)/contracts/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContractsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Contracts</h1>
        <Link href="/contracts/upload">
          <Button>Upload Contract</Button>
        </Link>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        {/* Add your contracts list component here */}
      </Suspense>
    </div>
  );
}
```

6. Make sure your middleware.ts (if you have one) isn't blocking any routes unintentionally:

```typescript:src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Allow public files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // Protect routes under (protected)
  if (request.nextUrl.pathname.startsWith('/contracts') && !token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/contracts/:path*',
    '/api/contracts/:path*',
  ],
};
```

7. Finally, check your next.config.js:

```javascript:next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

After implementing these changes, try accessing these URLs:
- http://localhost:3000/ (should show home page)
- http://localhost:3000/contracts (should redirect to login if not authenticated)
- http://localhost:3000/contracts/upload (should redirect to login if not authenticated)

Let me know if you're still getting 404 errors, and if so, which specific URLs are causing them.

---



---


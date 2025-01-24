## SpecStory

## Resolvendo erro de tipo 'never' no TypeScript (11/11/2024, 13:51:02)

_**User**_

For the code present, we get this error:
```
O argumento do tipo 'string' não é atribuível ao parâmetro do tipo 'never'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

The error message is in Portuguese and translates to: "Argument of type 'string' is not assignable to parameter of type 'never'."

This error occurs because the event type for Prisma's `$on` method needs to be properly typed. Here's the fix:

```typescript:src/lib/prisma.ts
// ... existing code ...
prisma.$on('beforeExit' as never, async () => {
  await prisma.$disconnect();
});
// ... existing code ...
```

The same change should be applied to the error handler:

```typescript:src/lib/prisma.ts
// ... existing code ...
prisma.$on('error' as never, async (e) => {
  console.error('Prisma Client error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
// ... existing code ...
```

This is a type assertion that tells TypeScript to treat the string literal as the correct event type that Prisma expects. While not the most elegant solution, it's a common workaround for this particular Prisma typing issue.

---

_**User**_

help to fix

---

_**Assistant**_

Since you're using multiple schemas (as indicated by `schemas = ["public", "auth"]` in your datasource), you need to specify which schema each model and enum belongs to. Let's fix this by adding the `@@schema` attribute to each model and enum.

```prisma:prisma/schema.prisma
// ... existing code ...

model User {
  // ... existing fields ...

  @@map("users")
  @@schema("public")
}

model Contract {
  // ... existing fields ...

  @@index([userId])
  @@schema("public")
}

enum Role {
  FREE
  PRO

  @@schema("public")
}

enum Status {
  draft
  under_review
  approved
  rejected

  @@schema("public")
}

enum contract_status {
  draft
  under_review
  approved
  rejected

  @@schema("public")
}
```

I've added `@@schema("public")` to all models and enums. I'm assuming you want these in the "public" schema, but if any of these should be in the "auth" schema instead, just change `"public"` to `"auth"` for those specific models/enums.

Also, you might want to consider consolidating your `Status` and `contract_status` enums since they have the same values.

---

_**User**_

help me to resolve this problem when deploy my app to vercel Error fetching recent contracts: PrismaClientUnknownRequestError: 
Invalid `prisma.contract.findMany()` invocation:


Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42P05", message: "prepared statement \"s0\" already exists", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })
    at $n.handleRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:121:7505)
    at $n.handleAndLogRequestError (/var/task/node_modules/@prisma/client/runtime/library.js:121:6623)
    at $n.request (/var/task/node_modules/@prisma/client/runtime/library.js:121:6307)
    at async l (/var/task/node_modules/@prisma/client/runtime/library.js:130:9633)
    at async /var/task/.next/server/app/api/contracts/recent/route.js:1:1637
    at async Proxy._transactionWithCallback (/var/task/node_modules/@prisma/client/runtime/library.js:130:8000)
    at async p (/var/task/.next/server/app/api/contracts/recent/route.js:1:1605)
    at async /var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:37010
    at async eC.execute (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:27552)
    at async eC.handle (/var/task/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38344) {
  clientVersion: '5.22.0'
}

---

_**Assistant**_

The error message you're encountering, specifically `prepared statement "s0" already exists`, typically indicates that there is an issue with how prepared statements are being managed in your Prisma Client when deployed to Vercel. This can happen due to connection pooling or the way Prisma handles database connections in serverless environments.

Here are some steps you can take to resolve this issue:

### 1. Use `prisma.$disconnect()` Properly
Ensure that you are properly disconnecting the Prisma client after each request. In serverless environments like Vercel, connections can be reused, and failing to disconnect can lead to issues with prepared statements.

```typescript
// Example of a handler
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from 'path/to/your/prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contracts = await prisma.contract.findMany();
    res.status(200).json(contracts);
  } catch (error) {
    console.error('Error fetching recent contracts:', error);
    res.status(500).json({ error: 'Error fetching recent contracts' });
  } finally {
    await prisma.$disconnect(); // Ensure disconnection
  }
}
```

### 2. Use Connection Pooling
If you're using a PostgreSQL database, consider using a connection pooler like PgBouncer. This can help manage connections more effectively in a serverless environment.

### 3. Update Prisma Client
Make sure you are using the latest version of Prisma Client. Sometimes, bugs are fixed in newer releases. You can update it by running:

```bash
npm install @prisma/client
```

### 4. Check for Duplicate Queries
Ensure that you are not inadvertently calling the same query multiple times in quick succession, which could lead to prepared statement conflicts.

### 5. Adjust Vercel Settings
If you are using Vercel's serverless functions, you might want to adjust the settings for your functions to allow for longer execution times or increased memory, which can help with connection management.

### 6. Review Your Database Configuration
Check your database configuration to ensure that it allows for the number of connections that your application might need, especially under load.

### 7. Use `prisma.$connect()` Wisely
If you are using `prisma.$connect()` in your application, ensure that it is called only once per request or in a way that does not lead to multiple connections being opened unnecessarily.

### Example of a Connection Management Strategy
Here’s a simple example of how to manage connections effectively:

```typescript
let isConnected = false;

async function connectToDatabase() {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(); // Ensure connection is established

  try {
    const contracts = await prisma.contract.findMany();
    res.status(200).json(contracts);
  } catch (error) {
    console.error('Error fetching recent contracts:', error);
    res.status(500).json({ error: 'Error fetching recent contracts' });
  } finally {
    await prisma.$disconnect(); // Ensure disconnection
  }
}
```

By following these steps, you should be able to resolve the `prepared statement "s0" already exists` error when deploying your app to Vercel.

---

_**User**_

help me to undestand why i have a 504 on Vercel when a upload a Contratc in @route.ts  @page.tsx  and the front give me the error "Unexpected token 'A', "An error o"... is not valid JSON" in local work very well

---

_**Assistant**_



The 504 error on Vercel indicates a gateway timeout, which means the function is taking too long to execute. This is happening because your API route is doing several heavy operations (file processing, OpenAI API calls, Supabase upload) within Vercel's function timeout limit (10 seconds for Hobby tier).

Here's how to fix this:

1. First, modify your API route to handle timeouts better:

```typescript:src/app/api/contracts/upload/route.ts
// Add this at the top of your file
export const maxDuration = 300; // Set max duration to 300 seconds (5 minutes)
export const dynamic = 'force-dynamic';

// Modify your POST function to include better error handling
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

    // Wrap your existing logic in a promise
    const processingPromise = async () => {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        throw new Error('No file provided');
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Rest of your existing logic...
      const extractedText = await extractTextContent(file);
      const { highlights, changes } = await analyzeContract(extractedText);
      
      // ... rest of your code ...

      return { success: true, contract };
    };

    // Race between timeout and processing
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload contract' },
      { status: error.status || 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```

2. Update your frontend to handle errors better:

```typescript:src/components/contracts/upload/UploadZone.tsx
const uploadContract = async (formData: FormData) => {
  try {
    const response = await fetch('/api/contracts/upload', {
      method: 'POST',
      body: formData,
      // Add timeout
      signal: AbortSignal.timeout(300000), // 5 minutes timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Upload failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload contract');
  }
};
```

3. Consider these additional optimizations:

```typescript:src/app/api/contracts/upload/route.ts
// Optimize the OpenAI function
async function analyzeContract(text: string) {
  try {
    // Add timeout for OpenAI call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI timeout')), 60000);
    });

    const analysisPromise = openai.chat.completions.create({
      // Reduce tokens to speed up response
      max_tokens: 2000, // Reduced from 4000
      temperature: 0.1,
      // ... rest of your options
    });

    const response = await Promise.race([analysisPromise, timeoutPromise]);
    // ... rest of your code
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      highlights: [{
        id: crypto.randomUUID(),
        type: 'warning',
        message: 'Analysis timeout - please try again',
        suggestion: 'Upload a smaller document or try again later',
        startIndex: 0,
        endIndex: text.length
      }],
      changes: []
    };
  }
}
```

4. Update your Vercel configuration:

Create or update your `vercel.json`:

```json:vercel.json
{
  "functions": {
    "app/api/contracts/upload/route.ts": {
      "maxDuration": 300
    }
  }
}
```

5. Consider upgrading your Vercel plan if you need longer function execution times.

These changes will:
- Increase the function timeout
- Add better error handling
- Provide more informative error messages
- Handle timeouts gracefully
- Optimize the OpenAI API calls

Remember that Vercel has different timeout limits based on your plan:
- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 900 seconds

If you're on the Hobby plan and your function consistently takes longer than 10 seconds, you might need to:
1. Optimize your code further
2. Split the operation into smaller chunks
3. Upgrade to a paid plan
4. Consider using a background job service for long-running tasks

---

_**User**_

modify for me

---

_**Assistant**_

Here's the modified version of your code incorporating the timeout handling and better error management:

```typescript:src/app/api/contracts/upload/route.ts
// ... existing code ...

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

    // Wrap file processing in a promise
    const processingPromise = async () => {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file provided');
      }

      // Rest of your existing logic...
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Continue with file processing...
      const extractedText = await extractTextContent(file);
      const { highlights, changes } = await analyzeContract(extractedText);
      
      // ... rest of your existing upload logic ...
      
      return { success: true, contract };
    };

    // Race between timeout and processing
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Handle specific error cases
    if (error.message === 'No file provided') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload contract' },
      { status: error.status || 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
```

The main changes are:
1. Wrapped the file processing logic in a promise
2. Added timeout handling
3. More specific error handling for different cases
4. Proper error responses with appropriate status codes

This should help handle timeouts better and provide clearer error messages when something goes wrong.

---

_**User**_

lets remove ContractCount on @Header.tsx 

---

_**Assistant**_



Here's the simplified version of the Header component without the contract count functionality:

```typescript:src/components/layout/Header.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Upload, 
  LayoutDashboard,
  Settings, 
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-emerald-500",
    },
    {
      title: "Contracts",
      icon: FileText,
      href: "/contracts",
      color: "text-blue-500",
    },
    {
      title: "Upload",
      icon: Upload,
      href: "/contracts/upload",
      color: "text-purple-500",
    },
  ];

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('')
    : session?.user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="bg-[#5000f7] border-b border-[#4000c6]">
      <div className="h-16 px-6 flex items-center">
        {/* Logo with Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[#5000f7] font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-xl text-white">Scancontract</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors relative group flex items-center gap-2",
                    isActive 
                      ? "bg-white text-[#5000f7]" 
                      : "text-blue-100 hover:text-white hover:bg-[#4000c6]"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", 
                    isActive ? item.color : "text-current"
                  )} />
                  {item.title}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md border-2 border-white"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Push actions to the right */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-[#4000c6] text-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="gap-2 hover:bg-[#4000c6]"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {session.user.name || session.user.email}
                      </span>
                      <ChevronDown className="h-4 w-4 text-blue-100" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-[#4000c6]">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

The main changes made:
1. Removed the `useState` and `useEffect` hooks for contract count
2. Removed the `contractCount` state variable
3. Removed the `fetchContractCount` function
4. Simplified the `navigationItems` array by removing the `badge` property
5. Removed the badge rendering logic from the navigation items

The header now has a cleaner implementation without the contract count functionality.

---

_**User**_

fix

---

_**Assistant**_



This error occurs due to connection pooling issues with Prisma in serverless environments. Here's how to fix it:

1. First, modify your Prisma client instantiation. Create or update your Prisma client file:

```typescript:src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

2. Then update your contracts page to properly handle the Prisma connection:

```typescript:src/app/contracts/page.tsx
import { prisma } from '@/lib/prisma';

export default async function ContractsPage() {
  try {
    const user = await prisma.user.findUnique({
      // your query here
    });
    
    // Rest of your code...
    
    return (
      // Your JSX
    );
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
```

3. For additional reliability, you can add connection management:

```typescript:src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add connection management options
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Add connection pooling settings
    connection: {
      pool: {
        min: 0,
        max: 10
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

prisma.$on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

4. If you're using Vercel, add a `vercel.json` configuration:

```json:vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

5. You might also want to add connection pooling at the database level. If you're using PostgreSQL, you can use PgBouncer. Add this to your database URL:

```env:.env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1"
```

These changes should help resolve the prepared statement errors by:
- Ensuring proper connection management
- Using a singleton pattern for the Prisma client
- Adding connection pooling
- Properly disconnecting after operations
- Handling errors appropriately

---

_**User**_

how i fix this?

---

_**Assistant**_



Since you're on Vercel's free tier (Hobby), the maximum function duration is limited to 10 seconds. Here are a few ways to handle this:

1. Update your `vercel.json` to stay within the limits:

```json:vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

2. Or remove the `maxDuration` setting completely from `vercel.json` to use default values:

```json:vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024
    }
  }
}
```

3. If you need longer execution times, you have these options:

a) Upgrade to Vercel Pro plan (allows up to 60 seconds)
b) Optimize your code to complete within 10 seconds
c) Split long operations into smaller chunks
d) Use background jobs for long-running tasks

4. For your specific case, you can also add edge config to your API routes:

```typescript:src/app/api/contracts/route.ts
export const runtime = 'edge'; // Use edge runtime
export const dynamic = 'force-dynamic';

// Your route handler code...
```

The edge runtime can sometimes be more performant and have different timeout characteristics.

Choose the approach that best fits your needs and budget constraints. If your operations consistently take longer than 10 seconds, consider upgrading to a paid plan or restructuring your application architecture.

---

_**User**_

now this

---

_**Assistant**_



For Next.js 13+ App Router, the path pattern in `vercel.json` needs to be updated to match the new file structure. Here's the correct configuration:

```json:vercel.json
{
  "functions": {
    "app/api/**/*": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

Or for a more specific pattern:

```json:vercel.json
{
  "functions": {
    "app/api/**/route.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

The key changes are:
1. Changed `api/**/*.ts` to `app/api/**/*` to match the App Router structure
2. Or use `app/api/**/route.ts` to specifically target route handlers
3. Kept the limits within Vercel's Hobby tier constraints

This should now correctly match your API routes in the Next.js App Router structure.

---



---


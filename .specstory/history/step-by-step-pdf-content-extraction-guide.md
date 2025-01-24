## SpecStory

## Step-by-step PDF Content Extraction Guide (10/11/2024, 15:31:23)

_**User**_

explain me the code step by step and show me how a implement a simple extract content with file is pdf

---

_**Assistant**_

I'll explain the code and then show you how to implement PDF content extraction.

**Code Explanation:**

1. **Imports and Setup:**
   - The code sets up a Next.js API route handler
   - It uses Supabase for file storage and Prisma for database operations
   - Authentication is handled through NextAuth

2. **Main Functions:**
   - `extractTextContent`: Currently handles only plain text files
   - `POST`: Main route handler that:
     - Verifies user authentication
     - Processes file upload
     - Stores file in Supabase
     - Creates a contract record in the database

3. **Current Limitations:**
   - The text extraction only works for plain text files
   - Other file types just store the filename as content

Here's how to implement PDF content extraction. We'll modify the `extractTextContent` function:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType === 'text/plain') {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const data = await PDFParser(uint8Array);
      // Return first 1000 characters of PDF text content
      return data.text.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

**Key changes explained:**
1. Added a new condition for PDF files (`application/pdf`)
2. Converts the file to a Uint8Array which PDFParser can process
3. Uses the already imported `PDFParser` to extract text
4. Limits the extracted text to 1000 characters (you can adjust this limit)

Note: Make sure you have the `pdf-parse` package installed:
```bash
npm install pdf-parse
```

The rest of your code can remain unchanged as it already handles the file upload and database operations correctly. The extracted PDF content will be stored in the `content` field of your contract record.

---

_**User**_

thank you!
pdf-parse dont work, any other lib can we use?

---

_**Assistant**_

Yes! For Next.js applications, `pdf.js` is a more reliable choice. Here are two good alternatives:

1. Using `pdfjs-dist` (Mozilla's PDF.js):

```bash
npm install pdfjs-dist
```

Here's the modified code:

```typescript:src/app/api/contracts/upload/route.ts
import * as pdfjsLib from 'pdfjs-dist';

// Need to set the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType === 'text/plain') {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(buffer).promise;
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

2. Alternative: Using `@react-pdf/renderer`:

```bash
npm install @react-pdf/renderer
```

```typescript:src/app/api/contracts/upload/route.ts
import { PDFDocument } from '@react-pdf/renderer';

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType === 'text/plain') {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      let fullText = '';
      
      for (const page of pages) {
        const text = await page.getText();
        fullText += text + ' ';
      }
      
      return fullText.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

I recommend using the first option (`pdfjs-dist`) as it's more widely used and maintained by Mozilla. It's the same library that browsers use to display PDFs.

Note: If you're running into CORS issues with the worker, you can also download and serve the worker file locally:

```bash
npm install -D copy-webpack-plugin
```

Then copy the worker file to your public directory and update the worker src:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

Let me know if you need help with any of these implementations!

---

_**User**_

if i need to extract only first 1000 caracteres, instead of all pages

---

_**Assistant**_



Here's an optimized version that stops extracting text once we reach 1000 characters:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType === 'text/plain') {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(buffer).promise;
      let fullText = '';
      
      // Extract text page by page until we reach 1000 characters
      for (let i = 1; i <= pdf.numPages; i++) {
        if (fullText.length >= 1000) break;
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

Key changes:
1. Added a length check inside the loop: `if (fullText.length >= 1000) break;`
2. This stops processing additional pages once we have enough text
3. Still includes the final `slice(0, 1000)` as a safeguard

This optimization will make the function more efficient by not processing unnecessary pages when we only need the first 1000 characters.

---

_**User**_

if text/plain contain another words its not working right? Example: text/plain;charset=UTF-8



---

_**Assistant**_



Ah, good catch! Yes, we should make the file type check more flexible. Here's the corrected version that handles different text MIME types:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files - check if mime type starts with 'text/'
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(buffer).promise;
      let fullText = '';
      
      // Extract text page by page until we reach 1000 characters
      for (let i = 1; i <= pdf.numPages; i++) {
        if (fullText.length >= 1000) break;
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      
      return fullText.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

The key change is replacing:
```typescript
if (fileType === 'text/plain')
```
with:
```typescript
if (fileType.startsWith('text/'))
```

This will now handle various text MIME types like:
- `text/plain;charset=UTF-8`
- `text/plain`
- `text/html`
- `text/csv`
- And any other MIME type that starts with `text/`

---

_**User**_

now i have this error

---

_**Assistant**_



This error occurs because `Promise.withResolvers` is a newer JavaScript feature that might not be supported in your Node.js version. Let's fix this by downgrading the pdf.js version or using a legacy build.

Try these steps:

1. First, uninstall the current version:
```bash
npm uninstall pdfjs-dist
```

2. Install a specific legacy version:
```bash
npm install pdfjs-dist@3.11.174
```

3. Update your import and initialization:

```typescript:src/app/api/contracts/upload/route.ts
// ... other imports ...
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Update the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
```

If you're still getting issues, you can try an alternative approach using the webpack configuration:

1. Create a custom worker loader:

```typescript:src/lib/pdf-worker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}
```

2. Then import it in your route file:

```typescript:src/app/api/contracts/upload/route.ts
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import '@/lib/pdf-worker';

// Remove the GlobalWorkerOptions line since it's now in pdf-worker.ts
// Rest of your code remains the same
```

This should resolve the `Promise.withResolvers` error. Let me know if you need any clarification or if you run into other issues!

---

_**User**_

lets try another lib instead pdfjslib?

---

_**Assistant**_



Yes! Let's try `pdf-parse`, which is simpler to use. Here's how to implement it:

1. Install the package:
```bash
npm install pdf-parse
```

2. Here's the updated code:

```typescript:src/app/api/contracts/upload/route.ts
import PDFParse from 'pdf-parse';

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(buffer));
      return data.text.slice(0, 1000);
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

The advantages of this approach:
1. Much simpler implementation
2. No worker configuration needed
3. Lighter weight
4. Better server-side support

If you still run into issues, another alternative is `pdf2json`:

```bash
npm install pdf2json
```

```typescript:src/app/api/contracts/upload/route.ts
import PDFParser from 'pdf2json';

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    // Handle text files
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    // Handle PDF files
    if (fileType === 'application/pdf') {
      return new Promise(async (resolve) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on('pdfParser_dataReady', (pdfData) => {
          const text = decodeURIComponent(pdfData.Pages[0].Texts.map(text => text.R[0].T).join(' '));
          resolve(text.slice(0, 1000));
        });

        const buffer = await file.arrayBuffer();
        pdfParser.parseBuffer(Buffer.from(buffer));
      });
    }

    // For all other file types, return the filename
    return file.name;

  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}
```

Try the first option with `pdf-parse` first, as it's simpler. If that doesn't work well for your needs, we can try the second option or explore other alternatives.

---

_**User**_

right, not get error, but now the api call get 405 using text/ ou pdf -  POST /api/contracts/upload 405 in 4095ms

---

_**Assistant**_



The 405 (Method Not Allowed) error typically means there's an issue with the API route export. Let's check the route configuration:

```typescript:src/app/api/contracts/upload/route.ts
// ... other imports ...

// Make sure to export the POST handler correctly
export async function POST(req: NextRequest) {  // Remove the context parameter if not needed
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ... rest of your code ...
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// If you need to handle OPTIONS requests (for CORS), add this:
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

Key changes:
1. Removed the `context` parameter from the POST handler if you're not using it
2. Added an OPTIONS handler for CORS support
3. Made sure the function is properly exported

Also, verify that your API call from the frontend is correctly configured:

```typescript
const response = await fetch('/api/contracts/upload', {
  method: 'POST',
  body: formData,  // Make sure formData contains the file with key 'file'
});
```

Let me know if you're still getting the 405 error after these changes!

---

_**User**_

not work, received a 405 again

---

_**Assistant**_



Let's try a complete revision of the route file. In Next.js 13+, we need to use the proper route handler format:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import PDFParse from 'pdf-parse';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(buffer));
      return data.text.slice(0, 1000);
    }

    return file.name;
  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}

// Export the config for the route handler
export const config = {
  api: {
    bodyParser: false, // Disables body parsing, as we're using FormData
  },
};

// Export the route handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await extractTextContent(file, file.type);
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: fileContent,
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

Also, make sure your frontend code is making the request correctly:

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/contracts/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

Key changes made:
1. Added proper export config
2. Ensured the route handler is using the correct Next.js API format
3. Updated the OPTIONS handler
4. Made sure we're using NextRequest and NextResponse consistently

If you're still getting a 405 error, please check:
1. The file path is correct: `/src/app/api/contracts/upload/route.ts`
2. Your Next.js version is up to date
3. The API endpoint URL in your frontend matches exactly

Let me know if you still have issues!

---

_**User**_

i need to implement a call to OpenAI to create a simple shorten text for PDF and Text for Contract uploaded and save then in Contract.content  in database

---

_**Assistant**_

To implement a call to OpenAI's API to generate a shortened version of the text extracted from the uploaded PDF or text file, you can follow these steps:

1. **Install the OpenAI SDK** (if you haven't already):
   ```bash
   npm install openai
   ```

2. **Update your API route** to include the OpenAI API call after extracting the text content. Here’s how you can modify your existing `POST` function:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import PDFParse from 'pdf-parse';
import { Configuration, OpenAIApi } from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY; // Ensure you have this in your environment variables

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAIApi(new Configuration({ apiKey: openaiApiKey }));

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(buffer));
      return data.text.slice(0, 1000);
    }

    return file.name;
  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}

async function shortenText(text: string): Promise<string> {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003', // You can choose a different model if needed
      prompt: `Please shorten the following text:\n\n${text}`,
      max_tokens: 100, // Adjust the token limit as needed
      temperature: 0.5, // Adjust the creativity level
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return text; // Fallback to original text in case of error
  }
}

// Export the route handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await extractTextContent(file, file.type);
    const shortenedContent = await shortenText(fileContent); // Call OpenAI to shorten the text
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: shortenedContent, // Save the shortened content
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Key Changes:
1. **OpenAI Configuration**: Added the OpenAI API key and initialized the OpenAI client.
2. **Shorten Text Function**: Created a `shortenText` function that calls the OpenAI API to generate a shortened version of the extracted text.
3. **Integration**: Called the `shortenText` function after extracting the text content and before saving it to the database.

### Environment Variables:
Make sure you have the following environment variable set in your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Notes:
- Adjust the `max_tokens` parameter in the OpenAI API call to control the length of the shortened text.
- You can modify the `temperature` parameter to control the creativity of the response.

This implementation will now extract text from the uploaded file, shorten it using OpenAI, and save the shortened content in the database. Let me know if you have any questions or need further assistance!

---

_**User**_

fix

---

_**Assistant**_

The error you're encountering indicates that the `OpenAIApi` class is not being exported from the `openai` package in the way it's being imported. This is likely due to changes in the OpenAI SDK. 

To fix this, you can import the OpenAI client correctly based on the latest version of the SDK. Here's how to do it:

1. **Update the import statement** for the OpenAI client. Instead of importing `OpenAIApi`, you should import `Configuration` and `OpenAI` directly from the `openai` package.

2. **Modify your code** as follows:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import PDFParse from 'pdf-parse';
import { Configuration, OpenAI } from 'openai'; // Update this line

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY; // Ensure you have this in your environment variables

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI(new Configuration({ apiKey: openaiApiKey })); // Update this line

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(buffer));
      return data.text.slice(0, 1000);
    }

    return file.name;
  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}

async function shortenText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use the appropriate model
      messages: [{ role: 'user', content: `Please shorten the following text:\n\n${text}` }],
      max_tokens: 100, // Adjust the token limit as needed
      temperature: 0.5, // Adjust the creativity level
    });

    return response.choices[0].message.content.trim(); // Update this line
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return text; // Fallback to original text in case of error
  }
}

// Export the route handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await extractTextContent(file, file.type);
    const shortenedContent = await shortenText(fileContent); // Call OpenAI to shorten the text
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: shortenedContent, // Save the shortened content
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### Key Changes:
1. **Import Statement**: Changed the import from `OpenAIApi` to `OpenAI`.
2. **OpenAI Initialization**: Updated the initialization to use the new `OpenAI` class.
3. **Shorten Text Function**: Updated the API call to use the `chat.completions.create` method, which is the new way to interact with the OpenAI API.

### Note:
Make sure you are using the latest version of the OpenAI SDK. If you continue to have issues, you can check the [OpenAI Node.js SDK documentation](https://github.com/openai/openai-node) for the latest usage patterns.

Let me know if you need further assistance!

---

_**User**_

fix

---

_**Assistant**_

It seems that the OpenAI SDK has undergone some changes in its structure. The `Configuration` class is no longer exported as it was in previous versions. Instead, you can directly create an instance of the OpenAI client without needing to import `Configuration`.

Here’s how to fix the import and initialization:

1. **Update the import statement** to only import `OpenAI` from the `openai` package.
2. **Initialize the OpenAI client directly** without the `Configuration` class.

Here’s the corrected code:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import PDFParse from 'pdf-parse';
import OpenAI from 'openai'; // Update this line

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY; // Ensure you have this in your environment variables

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey }); // Update this line

async function extractTextContent(file: File, fileType: string): Promise<string> {
  try {
    if (fileType.startsWith('text/')) {
      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      return text.slice(0, 1000);
    }

    if (fileType === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const data = await PDFParse(Buffer.from(buffer));
      return data.text.slice(0, 1000);
    }

    return file.name;
  } catch (error) {
    console.error('Error extracting text:', error);
    return file.name;
  }
}

async function shortenText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use the appropriate model
      messages: [{ role: 'user', content: `Please shorten the following text:\n\n${text}` }],
      max_tokens: 100, // Adjust the token limit as needed
      temperature: 0.5, // Adjust the creativity level
    });

    return response.choices[0].message.content.trim(); // Update this line
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return text; // Fallback to original text in case of error
  }
}

// Export the route handler
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await extractTextContent(file, file.type);
    const shortenedContent = await shortenText(fileContent); // Call OpenAI to shorten the text
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: shortenedContent, // Save the shortened content
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### Key Changes:
1. **Import Statement**: Changed the import to only import `OpenAI`.
2. **OpenAI Initialization**: Directly initialized the OpenAI client with the API key.

### Note:
Make sure you are using the latest version of the OpenAI SDK. If you continue to have issues, you can check the [OpenAI Node.js SDK documentation](https://github.com/openai/openai-node) for the latest usage patterns.

Let me know if you need further assistance!

---

_**User**_

works now, but i have this error on upload files. The @UploadZone.tsx is here, but works normal until we use a pdf-parse

---

_**Assistant**_

The 405 error indicates that the HTTP method used in the request is not allowed for the specified endpoint. Since you mentioned that the upload works normally until you use `pdf-parse`, it suggests that the issue might be related to how the API endpoint is handling the request or how the file is being processed.

### Steps to Troubleshoot and Fix the Issue:

1. **Check API Route Configuration**:
   Ensure that your API route is correctly set up to handle POST requests. The route should be defined in `src/app/api/contracts/upload/route.ts` and should export a `POST` function.

   Here’s a quick checklist:
   - Ensure the file is located at `src/app/api/contracts/upload/route.ts`.
   - Ensure the `POST` function is correctly defined and exported.

2. **Verify the API Call**:
   Make sure that the API call from your `UploadZone.tsx` component is correctly targeting the `/api/contracts/upload` endpoint. The fetch call should look like this:

   ```javascript
   const response = await fetch('/api/contracts/upload', {
     method: 'POST',
     body: formData,
   });
   ```

3. **Check Middleware**:
   If you have any middleware set up in your Next.js application, ensure that it is not interfering with the request. Middleware can sometimes block certain methods or paths.

4. **Inspect the Server Logs**:
   Check the server logs for any additional error messages that might provide more context about why the 405 error is occurring. Look for any logs related to the API route or middleware.

5. **CORS Issues**:
   If you are testing from a different origin (like localhost vs. a deployed version), ensure that CORS is properly configured. You can add an OPTIONS handler to your API route to handle preflight requests:

   ```typescript
   // Handle OPTIONS requests
   export async function OPTIONS() {
     return NextResponse.json({}, {
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'POST, OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
       },
     });
   }
   ```

6. **Check File Size and Type**:
   Ensure that the file being uploaded meets the requirements set in your API. If the file is too large or of an unsupported type, the server might reject the request. You mentioned a max size of 10MB; ensure that the file being uploaded does not exceed this limit.

7. **Debugging the PDF Parsing**:
   If the error occurs specifically when using `pdf-parse`, ensure that the library is correctly processing the file. You can add some logging to see if the file is being read correctly:

   ```typescript
   async function extractTextContent(file: File, fileType: string): Promise<string> {
     try {
       if (fileType.startsWith('text/')) {
         const buffer = await file.arrayBuffer();
         const text = new TextDecoder().decode(buffer);
         return text.slice(0, 1000);
       }

       if (fileType === 'application/pdf') {
         const buffer = await file.arrayBuffer();
         console.log('Buffer length:', buffer.byteLength); // Log buffer length
         const data = await PDFParse(Buffer.from(buffer));
         console.log('Extracted text:', data.text); // Log extracted text
         return data.text.slice(0, 1000);
       }

       return file.name;
     } catch (error) {
       console.error('Error extracting text:', error);
       return file.name;
     }
   }
   ```

### Summary
- Ensure the API route is correctly set up to handle POST requests.
- Verify that the fetch call is correctly targeting the API endpoint.
- Check for any middleware that might be blocking the request.
- Inspect server logs for additional error messages.
- Ensure the file being uploaded meets size and type requirements.
- Add logging to debug the PDF parsing process.

If you follow these steps and still encounter issues, please provide any additional error messages or logs that you see, and I can help you further troubleshoot the problem!

---

_**User**_

works now, but i have this error on upload files 405 but my archive still right. The @UploadZone.tsx is here, but works normal until we use a pdf-parse

---

_**Assistant**_

The 405 error suggests that the API route isn't being recognized correctly. Let's verify the API route structure and make some adjustments:

1. First, make sure your API route file is in the correct location:
```
src/
  app/
    api/
      contracts/
        upload/
          route.ts  <- This is the correct location
```

2. Update your API route file to ensure it's properly configured for Next.js 13+:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import PDFParse from 'pdf-parse';
import OpenAI from 'openai';

// ... your existing configurations ...

// Add this export to explicitly define accepted methods
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Update the POST handler signature
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, file.type); // Add logging

    const fileContent = await extractTextContent(file, file.type);
    console.log('File content extracted:', fileContent.substring(0, 100)); // Add logging

    const shortenedContent = await shortenText(fileContent);
    console.log('Shortened content:', shortenedContent.substring(0, 100)); // Add logging

    // ... rest of your code ...

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update the OPTIONS handler
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

3. Update your UploadZone component to include headers in the fetch request:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/contracts/upload', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData,
    });

    console.log('Response status:', response.status); // Add logging

    setProgress(90);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Add logging
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

4. Add a middleware configuration to ensure the API route is accessible:

```typescript:src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add logging
  console.log('Middleware - Request path:', request.nextUrl.pathname);
  
  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/contracts/upload',
  ],
};
```

These changes should help resolve the 405 error. The key points are:
1. Proper route exports for Next.js 13+
2. Explicit CORS configuration
3. Proper headers in the fetch request
4. Added logging for debugging
5. Middleware configuration to ensure the route is accessible

Let me know if you still encounter issues!

---

_**User**_

the middleware using a Auth verification, maybe its cause a 405?

---

_**Assistant**_



Yes! The middleware with auth verification could be causing the 405 error. Let's check your current middleware and make the necessary adjustments to allow the upload endpoint:

```typescript:src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to auth pages when not authenticated
    if (path.startsWith('/auth/')) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Add specific handling for the upload endpoint
    if (path === '/api/contracts/upload') {
      return NextResponse.next();
    }

    console.log('Middleware - Request path:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Allow auth pages without token
        if (path.startsWith('/auth/')) {
          return true;
        }

        // Allow the upload endpoint with token
        if (path === '/api/contracts/upload') {
          return !!token;
        }

        // Require token for other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/contracts/:path*',
    '/api/protected/:path*',
    '/api/contracts/upload',  // Make sure this is included
    '/api/:path*',
  ],
};
```

Key changes:
1. Added specific handling for the `/api/contracts/upload` path
2. Ensured the upload endpoint is properly matched in the config
3. Added token verification for the upload endpoint

This should allow the upload endpoint to work while still maintaining authentication. The endpoint will still require authentication (the user must be logged in), but it won't get blocked with a 405 error.

If you're still getting the 405 error, you might want to try temporarily removing the upload path from the middleware matcher to verify if that's the issue:

```typescript:src/middleware.ts
export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/contracts/:path*',
    '/api/protected/:path*',
    // '/api/contracts/upload',  // Comment this out temporarily
    '/api/:path*',
  ],
};
```

Let me know if this helps resolve the issue!

---

_**User**_

same error @route.ts @UploadZone.tsx 

---

_**Assistant**_

I noticed a few issues in your code that might be causing the 405 error:

1. In your `route.ts`, there's a typo in the POST handler where you're using `req` instead of `request`:

```typescript:src/app/api/contracts/upload/route.ts
// Change this line
export async function POST(request: Request) {
  try {
    // ... other code ...

    // Fix this line - change req to request
    const formData = await request.formData(); // was using req.formData()
    const file = formData.get('file') as File;

    // ... rest of the code ...
  } catch (error) {
    // ... error handling ...
  }
}
```

2. There's also an error in the OpenAI model name:

```typescript:src/app/api/contracts/upload/route.ts
async function shortenText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Fix this - was "gpt-4o"
      messages: [{
        role: "user",
        content: `Please shorten the following text:\n\n${text}`
      }]
    });

    // Fix this line to access the content correctly
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return text;
  }
}
```

3. Add proper typing for the request parameter:

```typescript:src/app/api/contracts/upload/route.ts
import { NextRequest } from 'next/server';

// Update the function signature
export async function POST(request: NextRequest) {
  // ... rest of the code ...
}
```

4. Update your middleware configuration to ensure it's not blocking the upload route:

```typescript:src/middleware.ts
export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/contracts/:path*',
    '/api/protected/:path*',
    '/api/contracts/:path*',  // Update this line
  ],
};
```

5. In your UploadZone component, remove the 'Accept' header as it might be causing issues:

```typescript:src/components/contracts/upload/UploadZone.tsx
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
    
    // ... rest of the code ...
  } catch (error) {
    // ... error handling ...
  }
};
```

6. Add proper export configuration at the top of your route file:

```typescript:src/app/api/contracts/upload/route.ts
export const config = {
  api: {
    bodyParser: false,
  },
};

// Add these exports
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

These changes should help resolve the 405 error. The key changes are:
1. Fixed the request parameter usage
2. Corrected the OpenAI model name and response handling
3. Added proper typing for the request
4. Updated middleware configuration
5. Simplified the fetch request
6. Added proper export configuration

Let me know if you still encounter any issues!

---

_**User**_

the 405 continue, i dont know why anymore @middleware.ts @UploadZone.tsx @page.tsx 

---

_**Assistant**_



Let's try to fix this by making a few key changes:

1. First, update your middleware configuration to be more specific and exclude the API routes:

```typescript:src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to auth pages when not authenticated
    if (path.startsWith('/auth/')) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    console.log('Middleware - Request path:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Allow auth pages without token
        if (path.startsWith('/auth/')) {
          return true;
        }

        // Require token for protected routes
        return !!token;
      },
    },
  }
);

// Update the matcher to exclude API routes
export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/contracts/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

2. Update your API route to use the correct request type and add proper headers:

```typescript:src/app/api/contracts/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ... rest of your code ...

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update OPTIONS handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

3. Update your UploadZone component to include credentials and the CSRF token:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/contracts/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    console.log('Response status:', response.status);

    setProgress(90);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
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

4. Create an API route configuration file:

```typescript:src/app/api/contracts/upload/route.config.ts
export const config = {
  api: {
    bodyParser: false,
  },
};
```

These changes should help resolve the 405 error by:
1. Properly configuring the middleware to exclude API routes
2. Ensuring the API route is properly typed and configured
3. Adding proper CORS headers
4. Including credentials in the fetch request

Let me know if you still encounter any issues!

---

_**User**_

not working!!! helpme to fix this 405 please this ocorre AFTER use a pdf-parser 

---

_**Assistant**_



Ah, now I understand better - the issue occurs specifically after implementing pdf-parse. Let's try a different approach:

1. First, let's create a separate API endpoint just for file parsing:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let text = '';

    if (file.type === 'application/pdf') {
      const data = await PDFParse(Buffer.from(buffer));
      text = data.text.slice(0, 1000);
    } else if (file.type.startsWith('text/')) {
      text = new TextDecoder().decode(buffer).slice(0, 1000);
    } else {
      text = file.name;
    }

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
  }
}
```

2. Then update your main upload route to handle just the file upload and database operations:

```typescript:src/app/api/contracts/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const content = formData.get('content') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: content,
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

3. Update your UploadZone component to handle the two-step process:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    // First, parse the file
    const parseFormData = new FormData();
    parseFormData.append('file', file);
    
    const parseResponse = await fetch('/api/contracts/parse', {
      method: 'POST',
      body: parseFormData,
    });

    if (!parseResponse.ok) {
      throw new Error('Failed to parse file');
    }

    const parseData = await parseResponse.json();
    setProgress(50);

    // Then, upload the file with the parsed content
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('content', parseData.text);

    const uploadResponse = await fetch('/api/contracts/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    setProgress(90);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await uploadResponse.json();
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

This approach:
1. Separates the PDF parsing into its own endpoint
2. Simplifies the main upload endpoint
3. Handles the process in two steps
4. Should avoid the 405 error by keeping the PDF parsing separate from the file upload

Let me know if this helps resolve the issue!

---

_**User**_

and when file is txt ? @route.ts @parse 

---

_**Assistant**_

Let me help you create a parse route that handles both PDF and TXT files:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  if (file.type === 'application/pdf') {
    const data = await PDFParse(Buffer.from(buffer));
    return data.text;
  } else if (file.type === 'text/plain') {
    const text = new TextDecoder().decode(buffer);
    return text;
  }
  
  throw new Error('Unsupported file type');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await extractTextContent(file);

    // Truncate text if it's too long (optional)
    const truncatedText = text.slice(0, 5000); // Adjust length as needed

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Parse failed' }, 
      { status: 500 }
    );
  }
}
```

This parse route will:
1. Handle both PDF and TXT files
2. Extract text content appropriately based on file type
3. Return the extracted text in a consistent format
4. Include proper error handling and authentication

The main upload route remains the same, as it just receives the parsed content and handles the file storage and database operations.

Let me know if you need any clarification or adjustments!

---

_**User**_

Failed to parse file

---

_**Assistant**_

The 405 error suggests that the POST method isn't being properly exported. Let's modify the parse route to ensure it's correctly configured for Next.js 13+ API routes:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Add proper config for API route
export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  if (file.type === 'application/pdf') {
    const data = await PDFParse(Buffer.from(buffer));
    return data.text;
  } else if (file.type === 'text/plain') {
    const text = new TextDecoder().decode(buffer);
    return text;
  }
  
  throw new Error('Unsupported file type');
}

// Add OPTIONS handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Processing file:', file.name, file.type); // Add logging

    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Parse failed' }, 
      { status: 500 }
    );
  }
}
```

Key changes made:
1. Added proper API route configuration
2. Added OPTIONS handler for CORS
3. Added logging for debugging
4. Ensured proper export of POST handler

Let me know if you still encounter issues!

---

_**User**_

not working

---

_**Assistant**_

Let's modify the parse route to handle the file parsing correctly. Here's the updated version:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function extractTextContent(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const fileType = file.type;
  
  try {
    if (fileType === 'application/pdf') {
      const pdfData = await PDFParse(Buffer.from(buffer));
      return pdfData.text;
    } else if (fileType === 'text/plain') {
      return new TextDecoder().decode(buffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    console.log('Processing file:', file.type); // Debug log

    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Parse failed' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

Key changes:
1. Removed the `config` export as it's not needed in Next.js 13+ API routes
2. Changed `File` type to `Blob` for better compatibility
3. Added more error handling and logging
4. Simplified the OPTIONS handler
5. Added type checking for the file

Let me know if you still encounter issues!

---

_**User**_

not working the error always is Failed to parse file

---

_**Assistant**_

Let's modify both the client and server code to better handle the file parsing and add more detailed error handling:

1. First, update the parse route with better error handling and logging:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function extractTextContent(file: Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;
    console.log('File type:', fileType); // Debug log

    if (fileType === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);
      const pdfData = await PDFParse(pdfBuffer);
      return pdfData.text;
    } else if (fileType === 'text/plain') {
      const text = new TextDecoder().decode(buffer);
      return text;
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  console.log('Parse endpoint hit'); // Debug log
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no'); // Debug log

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        error: 'No valid file provided',
        details: `File type: ${file ? typeof file : 'undefined'}`
      }, { status: 400 });
    }

    console.log('File type:', file.type); // Debug log
    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      error: 'Parse failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

2. Then update the client-side error handling in UploadZone:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const parseFormData = new FormData();
    parseFormData.append('file', file);
    
    const parseResponse = await fetch('/api/contracts/parse', {
      method: 'POST',
      credentials: 'include',
      body: parseFormData,
    });

    const responseData = await parseResponse.json();

    if (!parseResponse.ok) {
      throw new Error(responseData.details || 'Failed to parse file');
    }

    if (!responseData.success || !responseData.text) {
      throw new Error('Invalid response format from parse endpoint');
    }

    setProgress(50);

    // Rest of your upload code...
```

The key changes are:
1. Added more detailed error logging on the server
2. Improved error handling and messaging
3. Added credentials to the fetch request
4. Better type checking and validation
5. More detailed error responses

Try this and check the browser console and server logs for more detailed error information. Let me know if you need any adjustments!

---

_**User**_

now the error is Unexpected end of JSON input



---

_**Assistant**_

I notice there's a syntax error in your parse route - there's a missing closing bracket for the JSON response. Here's the fix:

```typescript:src/app/api/contracts/parse/route.ts
    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    }); // Add the missing closing bracket here
```

The error "Unexpected end of JSON input" occurs because the JSON response is malformed due to this missing bracket. This causes the client-side `parseResponse.json()` call to fail.

Let's also add better error handling in the client:

```typescript:src/components/contracts/upload/UploadZone.tsx
const parseResponse = await fetch('/api/contracts/parse', {
  method: 'POST',
  credentials: 'include',
  body: parseFormData,
});

let responseData;
try {
  responseData = await parseResponse.json();
} catch (error) {
  console.error('Failed to parse JSON response:', error);
  throw new Error('Invalid server response');
}

if (!parseResponse.ok) {
  throw new Error(responseData?.details || 'Failed to parse file');
}
```

This should resolve the JSON parsing error and provide better error messages if something goes wrong. Let me know if you need any clarification!

---

_**User**_

 POST /api/contracts/parse 405 in 2425ms now the error is  Invalid server response

---

_**Assistant**_

I see the issue. The parse route has a syntax error and is missing a closing bracket for the JSON response. Let's fix the parse route:

```typescript:src/app/api/contracts/parse/route.ts
export async function POST(request: NextRequest) {
  console.log('Parse endpoint hit');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        error: 'No valid file provided',
        details: `File type: ${file ? typeof file : 'undefined'}`
      }, { status: 400 });
    }

    console.log('File type:', file.type);
    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    }); // Added missing closing bracket and parenthesis

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      error: 'Parse failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

The 405 error suggests that the POST method isn't being properly handled. Let's also add an OPTIONS handler to properly handle CORS:

```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

Add these exports at the top of the file:

```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

This should resolve both the JSON parsing error and the 405 Method Not Allowed error. Let me know if you need any clarification!

---

_**User**_

Invalid server response

@UploadZone.tsx 

---

_**Assistant**_

I notice that in your `UploadZone.tsx`, you're making a fetch request to `/api/contracts/parse` but getting an "Invalid server response" error. Let's modify both the client and server code to fix this:

1. First, update the client-side fetch in `UploadZone.tsx`:

```typescript
const parseResponse = await fetch('/api/contracts/parse', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
  },
  credentials: 'include',
  body: parseFormData,
});

let responseData;
try {
  const textResponse = await parseResponse.text(); // Get raw response first
  console.log('Raw response:', textResponse); // Debug log
  responseData = JSON.parse(textResponse);
} catch (error) {
  console.error('Failed to parse JSON response:', error);
  throw new Error('Invalid server response format');
}
```

2. Then, ensure your server-side route in `parse/route.ts` has proper error handling and response format:

```typescript
export async function POST(request: NextRequest) {
  console.log('Parse endpoint hit');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no');

    if (!file || !(file instanceof Blob)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'No valid file provided',
          details: `File type: ${file ? typeof file : 'undefined'}`
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('File type:', file.type);
    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        text: truncatedText 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Parse error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Parse failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

The key changes are:
1. Using `new NextResponse` with explicit JSON stringification and headers
2. Adding better error handling and logging on both client and server
3. Ensuring proper Content-Type headers
4. Adding raw response logging for debugging

This should help resolve the "Invalid server response" error. Let me know if you need any clarification!

---

_**User**_

Invalid server response format



---

_**Assistant**_

I notice that your route file has a few issues that could be causing the "Invalid server response format" error. Let's fix them:

```typescript:src/app/api/contracts/parse/route.ts
export async function POST(request: NextRequest) {
  console.log('Parse endpoint hit');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    console.log('File received:', file ? 'yes' : 'no');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        error: 'No valid file provided',
        details: `File type: ${file ? typeof file : 'undefined'}`
      }, { status: 400 });
    }

    console.log('File type:', file.type);
    const text = await extractTextContent(file);
    const truncatedText = text.slice(0, 5000);

    return NextResponse.json({ 
      success: true, 
      text: truncatedText 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      error: 'Parse failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

Key changes:
1. Replaced `new NextResponse(JSON.stringify())` with `NextResponse.json()`
2. Simplified the response headers (they're automatically handled by `NextResponse.json()`)
3. Ensured consistent response format across all return statements

The error you're seeing likely comes from inconsistent response formatting. Using `NextResponse.json()` ensures proper JSON serialization and content-type headers.

Let me know if you still encounter issues!

---

_**User**_

Invalid server response format

Lets refactor all this upload and parse @route.ts @route.ts @UploadZone.tsx 

---

_**Assistant**_

Let's refactor this into a cleaner implementation. I'll break it down into three parts:

1. First, the parse route:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const extractPdfText = async (buffer: ArrayBuffer): Promise<string> => {
  const pdfBuffer = Buffer.from(buffer);
  const pdfData = await PDFParse(pdfBuffer);
  return pdfData.text;
};

const extractTextContent = async (file: Blob): Promise<string> => {
  const buffer = await file.arrayBuffer();
  
  switch (file.type) {
    case 'application/pdf':
      return extractPdfText(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    const text = await extractTextContent(file);
    return NextResponse.json({ 
      success: true, 
      text: text.slice(0, 5000) 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

2. The upload route:

```typescript:src/app/api/contracts/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const content = formData.get('content') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content,
        userId: user.id
      }
    });
    
    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

3. The UploadZone component:

```typescript:src/components/contracts/upload/UploadZone.tsx
'use client';

import { useState, useCallback } from 'react';
import { Upload, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from 'next-auth/react';
import { ContractFileSchema } from '@/lib/validators/contract';
import { toast } from 'sonner';

export function UploadZone() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      setProgress(10);
      
      // Parse step
      const parseFormData = new FormData();
      parseFormData.append('file', file);
      
      const parseResponse = await fetch('/api/contracts/parse', {
        method: 'POST',
        credentials: 'include',
        body: parseFormData,
      });
      
      const parseData = await parseResponse.json();
      
      if (!parseResponse.ok || !parseData.success) {
        throw new Error(parseData.error || 'Failed to parse file');
      }

      setProgress(50);

      // Upload step
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('content', parseData.text);

      const uploadResponse = await fetch('/api/contracts/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      setProgress(100);
      toast.success('Contract uploaded successfully!');
      router.push(`/contracts/${uploadData.contract.id}`);

    } catch (error) {
      console.error('Upload error:', error);
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Rest of the component remains the same
  // startLine: 14
  // endLine: 172
}
```

Key changes made:
1. Consistent error handling and response format
2. Simplified file parsing logic
3. Better type safety
4. Cleaner API responses with success/error flags
5. More robust error messages
6. Simplified upload flow
7. Better progress tracking

Let me know if you need any clarification or have questions about specific parts!

---

_**User**_

Invalid response format from parse endpoint

when call the /api/contracts/upload

---

_**Assistant**_

I notice the issue - in your `UploadZone.tsx`, you're calling `/api/contracts/upload` instead of `/api/contracts/parse` for the parsing step. Let's fix the `handleUpload` function:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    // Step 1: Parse the file
    const parseFormData = new FormData();
    parseFormData.append('file', file);
    
    const parseResponse = await fetch('/api/contracts/parse', { // Changed from /upload to /parse
      method: 'POST',
      credentials: 'include',
      body: parseFormData,
    });
    
    const parseData = await parseResponse.json();

    if (!parseResponse.ok || !parseData.success) {
      throw new Error(parseData.error || 'Failed to parse file');
    }

    setProgress(50);

    // Step 2: Upload the file with parsed content
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('content', parseData.text);

    const uploadResponse = await fetch('/api/contracts/upload', {
      method: 'POST',
      credentials: 'include', // Added credentials
      body: uploadFormData,
    });

    const uploadData = await uploadResponse.json();
    setProgress(90);

    if (!uploadResponse.ok || !uploadData.success) {
      throw new Error(uploadData.error || 'Upload failed');
    }

    setProgress(100);
    toast.success('Contract uploaded successfully!');
    router.push(`/contracts/${uploadData.contract.id}`);

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

Key changes:
1. Changed the first fetch URL from `/api/contracts/upload` to `/api/contracts/parse`
2. Simplified error handling and JSON parsing
3. Added consistent credentials to both requests
4. Made error messages more specific
5. Improved response validation

This should resolve the "Invalid response format" error since we're now calling the correct endpoint for parsing. Let me know if you need any clarification!

---

_**User**_

i dont want to use parse anymore

---

_**Assistant**_

I understand you want to remove the parsing step and just handle the upload directly. Let's simplify the `handleUpload` function in `UploadZone.tsx`:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch('/api/contracts/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    setProgress(50);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await uploadResponse.json();
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

This simplified version:
1. Removes the parsing step completely
2. Makes a single request to upload the file
3. Maintains the same error handling and progress tracking
4. Keeps the same success flow with toast and navigation

You can now delete the `parse` route file since it won't be needed anymore. Let me know if you need help updating the upload route as well!

---

_**User**_

work very well!!!!
I need to create a simple call on OpenAi to get a shorten text of file uploaded and save then on Contract.content

---

_**Assistant**_

I'll help you modify the upload route to include OpenAI text summarization. First, let's update the route:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function summarizeText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes legal documents. Keep summaries concise and focused on key points."
        },
        {
          role: "user",
          content: `Please summarize the following text in a concise way: ${text}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return text;
  }
}

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  if (file.type === 'text/plain') {
    return new TextDecoder().decode(buffer);
  }
  return file.name;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract and summarize text content
    const extractedText = await extractTextContent(file);
    const summarizedContent = await summarizeText(extractedText);

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: summarizedContent,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Key changes:
1. Added OpenAI integration
2. Created a `summarizeText` function that uses GPT-3.5-turbo
3. Simplified the text extraction
4. Added error handling for the OpenAI call
5. Stores the summarized content in the contract record

Make sure to:
1. Install the OpenAI package: `npm install openai`
2. Add your OpenAI API key to your environment variables: `OPENAI_API_KEY=your-key-here`

Let me know if you need any clarification or adjustments!

---

_**User**_

work very well!

Now lets move to a modify implementation on my Contract Page to Show the file i storage in supabase for Contract

---

_**Assistant**_

I'll help you modify the Contract page to show the stored file from Supabase. We'll need to update the Contract type and the page component:

```typescript:src/types/contract.ts
export type Contract = {
  id: string;
  title: string;
  content: string;
  fileUrl: string;  // Add this
  fileType: string; // Add this
  highlights: any[];
  changes: any[];
  createdAt: string;
  updatedAt: string;
  status: string;
};
```

```typescript:src/app/(protected)/contracts/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ContractViewer from "@/components/contracts/ContractViewer";
import { useParams } from 'next/navigation';
import { Contract } from '@/types/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

export default function ContractPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch contract');
        }

        const transformedContract: Contract = {
          id: data.id,
          title: data.title,
          content: data.content,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          highlights: data.highlights || [],
          changes: data.changes || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          status: data.status,
        };

        setContract(transformedContract);
      } catch (error) {
        console.error('Error in fetchContract:', error);
        setError(error instanceof Error ? error.message : 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && session?.user) {
      fetchContract();
    }
  }, [params.id, session?.user, status]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Contract</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return <div className="p-6">Contract not found</div>;
  }

  return (
    <div className="h-full">
      <Tabs.Root defaultValue="review" className="h-full">
        <div className="border-b px-4">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger 
              value="review"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Review
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="document"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Original Document
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        
        <Tabs.Content value="review" className="h-[calc(100%-48px)]">
          <ContractViewer contract={contract} />
        </Tabs.Content>

        <Tabs.Content value="document" className="h-[calc(100%-48px)] p-4">
          {contract.fileType === 'application/pdf' ? (
            <iframe
              src={contract.fileUrl}
              className="w-full h-full rounded-lg border"
              title={contract.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <a 
                href={contract.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download Original Document
              </a>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
```

This implementation:
1. Adds file-related fields to the Contract type
2. Adds a new "Original Document" tab
3. Shows PDF files in an iframe
4. Provides a download link for other file types
5. Maintains the existing review functionality

Let me know if you need any adjustments!

---

_**User**_

Right.

I need to show the content inside the editor, what the best way to do this?

I dont now the better solution but i will explain to you.

After the upload i need to storage in supabase (its ok now), i need to create a Contract in database (its ok now), and i need to call OpenAi to help me to create a higlights, warning and dangers (not implemented yet).

But for this i need to access the content inside the file uploaded, maybe i need to extract content and create another type or we use a Contract.content for this?

---

_**Assistant**_

I understand you need to handle the file content for AI analysis. Let's break this down:

1. First, let's modify the Contract type to include AI analysis fields:

```typescript
export type Contract = {
  id: string;
  title: string;
  content: string;  // This will store the extracted text content
  summary: string;  // AI-generated summary
  analysis: {
    highlights: string[];
    warnings: string[];
    dangers: string[];
  };
  fileUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  status: string;
};
```

2. Then, let's create a ContractEditor component that will display the content and AI analysis:

```typescript:src/components/contracts/ContractViewer.tsx
import { Contract } from '@/types/contract';
import { Card } from '@/components/ui/card';

interface ContractViewerProps {
  contract: Contract;
}

export default function ContractViewer({ contract }: ContractViewerProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Original Content */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Content</h2>
        <div className="whitespace-pre-wrap">{contract.content}</div>
      </Card>

      {/* AI Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highlights */}
        <Card className="p-4 border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Key Points</h3>
          <ul className="list-disc pl-4 space-y-2">
            {contract.analysis?.highlights.map((highlight, index) => (
              <li key={index} className="text-green-600">{highlight}</li>
            ))}
          </ul>
        </Card>

        {/* Warnings */}
        <Card className="p-4 border-yellow-200">
          <h3 className="font-semibold text-yellow-700 mb-2">Warnings</h3>
          <ul className="list-disc pl-4 space-y-2">
            {contract.analysis?.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-600">{warning}</li>
            ))}
          </ul>
        </Card>

        {/* Dangers */}
        <Card className="p-4 border-red-200">
          <h3 className="font-semibold text-red-700 mb-2">Critical Issues</h3>
          <ul className="list-disc pl-4 space-y-2">
            {contract.analysis?.dangers.map((danger, index) => (
              <li key={index} className="text-red-600">{danger}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
```

3. For the upload process, you'll want to:
- Extract text content from the file (using your existing parse logic)
- Send this content to OpenAI for analysis
- Store both the original content and the AI analysis in your database

Here's how to modify your upload route to include AI analysis:

```typescript:src/app/api/contracts/upload/route.ts
async function analyzeContent(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "Analyze this contract and provide: 1) Key highlights 2) Potential warnings 3) Critical dangers. Format as JSON."
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0]?.message?.content || '{}');
}
```

This approach:
1. Uses Contract.content to store the extracted text
2. Adds structured fields for AI analysis
3. Separates concerns between content storage and analysis
4. Provides a clean UI for viewing both content and analysis

Let me know if you need help implementing any specific part!

---

_**User**_

wait, before implement this, wee have implemented with static data AIChange and Highlight features

---

_**Assistant**_

I see you already have a well-structured type system for handling AI analysis with `Highlight` and `AIChange` interfaces. Let's modify the parse route to generate these AI-powered highlights and changes:

```typescript:src/app/api/contracts/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import crypto from 'crypto';
import { Highlight, AIChange } from '@/types/contract';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ... keep existing extractPdfText and extractTextContent functions ...

async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Analyze this contract and provide:
          1. Highlights: Critical issues, warnings, and suggested improvements
          2. Changes: Specific text changes with explanations
          Format as JSON with structure matching these types:
          Highlight: { id: string, type: 'critical' | 'warning' | 'improvement', message: string, suggestion: string, startIndex: number, endIndex: number }
          AIChange: { id: string, content: string, originalContent: string, explanation: string, suggestion: string, status: 'pending', reason: string, type: 'critical' | 'warning' | 'improvement', startIndex: number, endIndex: number }`
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: { type: "json_object" },
  });

  const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
  
  // Add IDs and ensure proper typing
  return {
    highlights: analysis.highlights.map((h: Omit<Highlight, 'id'>) => ({
      ...h,
      id: crypto.randomUUID()
    })),
    changes: analysis.changes.map((c: Omit<AIChange, 'id' | 'status'>) => ({
      ...c,
      id: crypto.randomUUID(),
      status: 'pending'
    }))
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    const text = await extractTextContent(file);
    const analysis = await analyzeContract(text);

    return NextResponse.json({ 
      success: true, 
      text: text.slice(0, 5000),
      highlights: analysis.highlights,
      changes: analysis.changes
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

This implementation:
1. Uses your existing type definitions
2. Adds AI analysis to generate highlights and changes
3. Maintains the same structure you're using in the example data
4. Returns both the extracted text and AI analysis
5. Properly types all the responses

You'll need to:
1. Install OpenAI: `npm install openai`
2. Add your OpenAI API key to environment variables
3. Update your upload route to save these highlights and changes to the database

Let me know if you need help with any of these steps!

---

_**User**_

lets create this inside @route.ts not in parse please

---

_**Assistant**_

I'll help you modify the upload route to include the AI analysis functionality. Here's the updated version:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import PDFParse from 'pdf-parse';
import { Highlight, AIChange } from '@/types/contract';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfBuffer = Buffer.from(buffer);
  const pdfData = await PDFParse(pdfBuffer);
  return pdfData.text;
}

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  switch (file.type) {
    case 'application/pdf':
      return extractPdfText(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze this contract and provide:
            1. Highlights: Critical issues, warnings, and suggested improvements
            2. Changes: Specific text changes with explanations
            Return a JSON with two arrays: 'highlights' and 'changes'.
            Each highlight should have: type ('critical'|'warning'|'improvement'), message, suggestion, startIndex, endIndex
            Each change should have: content, originalContent, explanation, suggestion, reason, type ('critical'|'warning'|'improvement'), startIndex, endIndex`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      highlights: analysis.highlights?.map((h: Omit<Highlight, 'id'>) => ({
        ...h,
        id: crypto.randomUUID()
      })) || [],
      changes: analysis.changes?.map((c: Omit<AIChange, 'id' | 'status'>) => ({
        ...c,
        id: crypto.randomUUID(),
        status: 'pending'
      })) || []
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return { highlights: [], changes: [] };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract text and analyze content
    const extractedText = await extractTextContent(file);
    const { highlights, changes } = await analyzeContract(extractedText);

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText,
        highlights: highlights,
        changes: changes,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Key changes:
1. Moved text extraction logic from parse route
2. Added AI analysis function for highlights and changes
3. Stores full extracted text instead of summary
4. Includes highlights and changes in the contract creation
5. Better error handling for AI analysis

You can now delete the parse route since all functionality has been moved to the upload route.

---

_**User**_

i remove the parse its not working os past, please lets generate again

---

_**Assistant**_

I'll help you create a new implementation for the upload route that includes the PDF parsing functionality. Here's the updated code:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import PDFParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfBuffer = Buffer.from(buffer);
  const pdfData = await PDFParse(pdfBuffer);
  return pdfData.text;
}

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  switch (file.type) {
    case 'application/pdf':
      return extractPdfText(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

async function summarizeText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes legal documents. Keep summaries concise and focused on key points."
        },
        {
          role: "user",
          content: `Please summarize the following text in a concise way: ${text}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('OpenAI summarization error:', error);
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Extract and summarize text content
    const extractedText = await extractTextContent(file);
    const summarizedContent = await summarizeText(extractedText);

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText, // Store full extracted text
        summary: summarizedContent, // Store the summary separately
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

Key changes:
1. Integrated PDF parsing directly into the upload route
2. Added proper file type handling for both PDF and text files
3. Stores both the full extracted text and the summary
4. Added consistent success/error response format
5. Included CORS headers in OPTIONS handler

Make sure you have the required dependencies installed:
```bash
npm install pdf-parse openai
```

Let me know if you need any clarification or adjustments!

---

_**User**_

Right.

I need to show the content inside the editor, what the best way to do this?

I dont now the better solution but i will explain to you.

After the upload i need to storage in supabase (its ok now), i need to create a Contract in database (its ok now), and i need to call OpenAi to help me to create a higlights, warning and dangers (not implemented yet).

But for this i need to access the content inside the file uploaded, maybe i need to extract content and create another type or we use a Contract.content for this? @contract.ts i have Highlights and AIChanges in file.

The better way is use the Upload route or create anothers to change this?

---

_**Assistant**_

I understand you want to implement the AI analysis for highlights and changes. Looking at your code structure, here's what I recommend:

1. First, modify the `extractTextContent` function in your upload route to properly handle PDFs:

```typescript:src/app/api/contracts/upload/route.ts
import PDFParse from 'pdf-parse';

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  switch (file.type) {
    case 'application/pdf':
      const pdfBuffer = Buffer.from(buffer);
      const pdfData = await PDFParse(pdfBuffer);
      return pdfData.text;
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}
```

2. Add a new function to analyze the content and generate highlights:

```typescript:src/app/api/contracts/upload/route.ts
async function analyzeContent(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze this contract and identify:
            1. Critical issues (security, legal, compliance risks)
            2. Warnings (potential problems or unclear terms)
            3. Improvements (suggestions for better clarity or coverage)
            Format the response as JSON with highlights array matching the Highlight type.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      highlights: (analysis.highlights || []).map((h: any) => ({
        ...h,
        id: crypto.randomUUID()
      })),
      changes: [] // You can implement changes analysis later
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { highlights: [], changes: [] };
  }
}
```

3. Update the contract creation part:

```typescript:src/app/api/contracts/upload/route.ts
    // Extract content and analyze
    const extractedText = await extractTextContent(file);
    const { highlights, changes } = await analyzeContent(extractedText);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText,
        highlights,
        changes,
        userId: user.id
      }
    });
```

This approach:
1. Uses the existing Contract type structure
2. Keeps all processing in the upload route (simpler flow)
3. Stores the full content for future reference
4. Generates AI analysis during upload
5. Matches your existing highlight/change types

The upload route is the best place for this because:
1. You already have the file content
2. It's a single API call for the client
3. The analysis is part of the contract creation process
4. It maintains atomic operations

Let me know if you need any clarification or have questions about specific parts!

---

_**User**_

i implement a step 1 with pdf-parse and get the error "Upload failed:"

---

_**Assistant**_

Let's fix the PDF parsing issue in the upload route. The error likely comes from how we're handling the File object. Here's the corrected implementation:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    
    switch (file.type) {
      case 'application/pdf': {
        const pdfBuffer = Buffer.from(buffer);
        const pdfData = await PDFParse(pdfBuffer);
        return pdfData.text || '';
      }
      case 'text/plain':
        return new TextDecoder().decode(buffer);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // ... authentication code remains the same ...

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    // Extract text content
    const extractedText = await extractTextContent(file);
    if (!extractedText) {
      throw new Error('Failed to extract text from file');
    }

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file instanceof File ? file.name : fileName,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Key changes:
1. Added better error handling in `extractTextContent`
2. Fixed type checking for the file object
3. Added null checks for extracted text
4. Improved error messages
5. Made the function work with both File and Blob types

Let me know if you still encounter any issues!

---

_**User**_

Upload failed continue

---

_**Assistant**_

I see the issue. Let's modify the upload route to better handle file uploads and error reporting. Here's the corrected version:

```typescript:src/app/api/contracts/upload/route.ts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    // Extract text content with better error handling
    let extractedText;
    try {
      extractedText = await extractTextContent(file);
      console.log('Extracted text length:', extractedText?.length || 0);
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      return NextResponse.json({ 
        success: false, 
        error: `Text extraction failed: ${extractError instanceof Error ? extractError.message : 'Unknown error'}` 
      }, { status: 400 });
    }

    if (!extractedText) {
      return NextResponse.json({ 
        success: false, 
        error: 'No text could be extracted from file' 
      }, { status: 400 });
    }

    // Upload file to Supabase with better error handling
    let uploadData;
    try {
      const fileName = `${Date.now()}-${file instanceof File ? file.name : 'unnamed'}`;
      const buffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('contracts')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;
      uploadData = { fileName, data };
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `File upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` 
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(uploadData.data.path);

    // Create contract with better error handling
    try {
      const contract = await prisma.contract.create({
        data: {
          id: crypto.randomUUID(),
          title: file instanceof File ? file.name : uploadData.fileName,
          fileUrl: publicUrl,
          fileName: uploadData.fileName,
          status: "under_review",
          fileType: file.type,
          content: extractedText,
          userId: user.id
        }
      });

      return NextResponse.json({ success: true, contract });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: `Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('General upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Key changes:
1. Added separate try-catch blocks for each major operation
2. Improved error messages with specific contexts
3. Added logging for debugging
4. Better type checking for file name handling
5. More detailed error responses

This should help identify exactly where the upload is failing. The error messages will be more specific about which part of the process failed (text extraction, file upload, or database operation).

---

_**User**_

same error "Upload failed:"

---

_**Assistant**_

Looking at both files, I see the issue. The error message is getting truncated. Let's fix the error handling in both files:

1. First, modify the upload route's error responses:

```typescript:src/app/api/contracts/upload/route.ts
// In the text extraction catch block (around line 95)
return NextResponse.json({ 
  success: false, 
  error: extractError instanceof Error ? extractError.message : 'Unknown extraction error'
}, { status: 400 });

// In the Supabase upload catch block (around line 125)
return NextResponse.json({ 
  success: false, 
  error: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
}, { status: 500 });
```

2. Then, modify the UploadZone component's error handling:

```typescript:src/components/contracts/upload/UploadZone.tsx
const handleUpload = async (file: File) => {
  try {
    setLoading(true);
    setProgress(10);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch('/api/contracts/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    setProgress(50);

    const data = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    setProgress(100);

    if (data.success && data.contract) {
      toast.success('Contract uploaded successfully!');
      router.push(`/contracts/${data.contract.id}`);
    } else {
      throw new Error(data.error || 'Invalid response from server');
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
    setProgress(0);
  }
};
```

Key changes:
1. Always parse response as JSON first
2. Use the error message from the server response
3. Better error handling in both components
4. More detailed error messages
5. Proper error propagation

This should give you more detailed error messages about what's actually failing during the upload process.

---

_**User**_

now the error is Unexpected end of JSON input again



---

_**Assistant**_

I see the issue. The `extractTextContent` function is trying to return a NextResponse instead of throwing an error. Here's the corrected version:

```typescript:src/app/api/contracts/upload/route.ts
async function extractTextContent(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    
    switch (file.type) {
      case 'application/pdf': {
        const pdfBuffer = Buffer.from(buffer);
        const pdfData = await PDFParse(pdfBuffer);
        return pdfData.text || '';
      }
      case 'text/plain':
        return new TextDecoder().decode(buffer);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown extraction error');
  }
}
```

The issue was that the function was returning a NextResponse object instead of throwing an error, which caused JSON parsing to fail in the client. The error handling should be done in the main POST handler, not in the utility function.

The error handling is already properly set up in the POST handler here:

```91:101:src/app/api/contracts/upload/route.ts
    let extractedText;
    try {
      extractedText = await extractTextContent(file);
      console.log('Extracted text length:', extractedText?.length || 0);
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      return NextResponse.json({ 
        success: false, 
        error: extractError instanceof Error ? extractError.message : 'Unknown extraction error'
      }, { status: 400 });
    }
```


This should resolve the "Unexpected end of JSON input" error you're seeing.

---

_**User**_

same error again Unexpected end of JSON input



---

_**Assistant**_

I notice that we need to add proper error handling for the file name in the Supabase upload section. Here's the corrected version of the relevant section:

```typescript:src/app/api/contracts/upload/route.ts
    // Upload file to Supabase with better error handling
    let uploadData;
    try {
      let fileName;
      if (file instanceof File) {
        fileName = `${Date.now()}-${file.name}`;
      } else {
        fileName = `${Date.now()}-unnamed-${crypto.randomUUID()}`;
      }
      
      const buffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('contracts')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;
      if (!data || !data.path) throw new Error('Upload failed: No data returned from Supabase');
      
      uploadData = { fileName, data };
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`
      }, { status: 500 });
    }
```

Key changes:
1. Better file name handling
2. Added check for data and data.path
3. More descriptive error message
4. Added proper type checking for File instance

This should help identify the specific issue causing the JSON parsing error. The error message will be more detailed about what exactly failed during the upload process.

---

_**User**_

same error again.

Lets try another way to this. Please remove PDF-PARSE for @route.ts lets work only for txt or doc files for now

---

_**Assistant**_

I'll help you modify the route to handle only text files for now. Here's the simplified version:

```typescript:src/app/api/contracts/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function extractTextContent(file: File | Blob): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    
    if (file.type !== 'text/plain') {
      throw new Error('Only text files are supported at the moment');
    }
    
    return new TextDecoder().decode(buffer);
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown extraction error');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    // Extract text content
    let extractedText;
    try {
      extractedText = await extractTextContent(file);
      console.log('Extracted text length:', extractedText?.length || 0);
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      return NextResponse.json({ 
        success: false, 
        error: extractError instanceof Error ? extractError.message : 'Unknown extraction error'
      }, { status: 400 });
    }

    // Upload file to Supabase
    let uploadData;
    try {
      const fileName = `${Date.now()}-${file instanceof File ? file.name : `unnamed-${crypto.randomUUID()}`}`;
      const buffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('contracts')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;
      if (!data || !data.path) throw new Error('Upload failed: No data returned from Supabase');
      
      uploadData = { fileName, data };
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ 
        success: false, 
        error: `Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(uploadData.data.path);

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file instanceof File ? file.name : uploadData.fileName,
        fileUrl: publicUrl,
        fileName: uploadData.fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, contract });

  } catch (error) {
    console.error('General upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Key changes:
1. Removed PDF-parse dependency
2. Simplified text extraction to only handle text files
3. Streamlined error handling
4. Removed summarization for now (we can add it back later)
5. Simplified the file type check

You'll also need to update your file input to only accept text files:


```89:89:src/components/contracts/upload/UploadZone.tsx
      if (data.success && data.contract) {
```

Change to:
```typescript
accept=".txt"
```

This should give us a stable base to work from before we add PDF support back in.

---

_**User**_

ok!

Lets implement a highlits and AIChanges interactions for Contract uploadeds.

@contract.ts we have a types implemented with static data for 

---

_**Assistant**_

I'll help you implement the highlights and AIChanges analysis for uploaded contracts. We'll modify the upload route to include AI analysis:

```typescript:src/app/api/contracts/upload/route.ts
async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze this contract and provide:
            1. Highlights: Identify critical issues, warnings, and suggested improvements
            2. Changes: Suggest specific text changes with explanations
            
            Format the response as JSON with two arrays:
            1. highlights: Array of { type: 'critical' | 'warning' | 'improvement', message: string, suggestion: string, startIndex: number, endIndex: number }
            2. changes: Array of { content: string, originalContent: string, explanation: string, suggestion: string, reason: string, type: 'critical' | 'warning' | 'improvement', startIndex: number, endIndex: number }`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      highlights: (analysis.highlights || []).map((h: Omit<Highlight, 'id'>) => ({
        ...h,
        id: crypto.randomUUID()
      })),
      changes: (analysis.changes || []).map((c: Omit<AIChange, 'id' | 'status'>) => ({
        ...c,
        id: crypto.randomUUID(),
        status: 'pending'
      }))
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { highlights: [], changes: [] };
  }
}
```

Then modify the POST handler to include the analysis:

```typescript:src/app/api/contracts/upload/route.ts
    // Extract text content
    const extractedText = await extractTextContent(file);
    
    // Analyze contract
    const { highlights, changes } = await analyzeContract(extractedText);

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: file.name,
        fileUrl: publicUrl,
        fileName,
        status: "under_review",
        fileType: file.type,
        content: extractedText,
        highlights,
        changes,
        userId: user.id
      }
    });
```

This implementation:
1. Uses GPT-4 to analyze the contract text
2. Generates both highlights and suggested changes
3. Matches the existing Contract type structure
4. Assigns unique IDs to each highlight and change
5. Sets initial status of changes to 'pending'

Make sure your Prisma schema includes the highlights and changes fields as JSON arrays:

```prisma
model Contract {
  id          String   @id @default(uuid())
  title       String
  content     String   @db.Text
  fileUrl     String
  fileName    String
  fileType    String
  highlights  Json[]   @default([])
  changes     Json[]   @default([])
  status      String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}
```

Let me know if you need help with any specific part!

---

_**User**_

help me to fix

---

_**Assistant**_

I see two main issues we need to fix:

1. First, let's update the Prisma schema to include highlights and changes as JSON fields:

```prisma:prisma/schema.prisma
model Contract {
  id        String   @id @db.Uuid @default(uuid())
  title     String
  fileUrl   String
  fileName  String
  status    String
  fileType  String
  content   String
  highlights Json    @default("[]")
  changes   Json    @default("[]")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

2. Then, let's fix the OpenAI analysis function to not use response_format (it's not supported by all models):

```typescript:src/app/api/contracts/upload/route.ts
async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a legal document analyzer. Analyze the contract and return a JSON response with two arrays:
            1. highlights: Array of issues found, each with properties:
               - type: ("critical" | "warning" | "improvement")
               - message: string describing the issue
               - suggestion: string with improvement suggestion
               - startIndex: number (position in text where issue starts)
               - endIndex: number (position in text where issue ends)
            
            2. changes: Array of suggested changes, each with properties:
               - content: string (new suggested text)
               - originalContent: string (text to be replaced)
               - explanation: string (why this change is needed)
               - suggestion: string (detailed suggestion)
               - reason: string (reasoning behind change)
               - type: ("critical" | "warning" | "improvement")
               - startIndex: number
               - endIndex: number`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const analysisText = response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}';
    const analysis = JSON.parse(analysisText);
    
    return {
      highlights: (analysis.highlights || []).map((h: Omit<Highlight, 'id'>) => ({
        ...h,
        id: crypto.randomUUID()
      })),
      changes: (analysis.changes || []).map((c: Omit<AIChange, 'id' | 'status'>) => ({
        ...c,
        id: crypto.randomUUID(),
        status: 'pending'
      }))
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { highlights: [], changes: [] };
  }
}
```

After making these changes:
1. Run `npx prisma generate` to update your Prisma client
2. Run `npx prisma db push` to update your database schema
3. Restart your development server

This should resolve both the Prisma validation error and the OpenAI API error.

---

_**User**_

i have 2 files for prisma, wich then is right? @schema.prisma @schema.prisma one in supabase folder and one in /prisma

---

_**Assistant**_

You should only have one Prisma schema file, and it should be in the `/prisma` folder. The one in the supabase folder should be removed.

Let's combine the best parts of both schemas into a single, improved version in `/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String     @id @db.Uuid @default(uuid())
  email             String     @unique
  name              String?
  password          String?
  role              Role       @default(FREE)
  contracts_remaining Int      @default(3)
  provider          String     @default("credentials")
  contracts         Contract[]
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  @@map("users")
}

model Contract {
  id        String   @id @db.Uuid @default(uuid())
  title     String
  fileUrl   String
  fileName  String
  status    Status   @default(draft)
  fileType  String
  content   String   @db.Text
  highlights Json    @default("[]")
  changes   Json    @default("[]")
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

enum Role {
  FREE
  PRO
}

enum Status {
  draft
  under_review
  approved
  rejected
}
```

Key changes:
1. Kept the UUID format from the first schema
2. Added the JSON fields for highlights and changes
3. Made status use the enum by default
4. Added @db.Text for content field
5. Kept the authentication-related fields

After making these changes:
1. Delete the schema file in the supabase folder
2. Run `npx prisma generate`
3. Run `npx prisma db push`

This will give you a single source of truth for your database schema.

---

_**User**_

if i run prisma generate and prisma db push i will lose all the data

---

_**Assistant**_

You're right - we should create a migration instead of using `db push` to preserve the data. Here's what you should do:

1. First, create a migration:
```bash
npx prisma migrate dev --name update_schema_with_highlights
```

This will:
- Create a migration file with the changes
- Apply the migration
- Regenerate the Prisma Client
- Preserve your existing data

The migration will handle:
- Adding the new fields (fileUrl, fileName, fileType)
- Adding the JSON fields for highlights and changes
- Updating the enums
- Preserving existing data

After the migration completes, you can verify your data is still intact by checking the database.

If you need to reference the current schema, it's at:

```1:60:prisma/schema.prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String     @id @db.Uuid @default(uuid())
  email             String     @unique
  name              String?
  password          String?
  role              Role       @default(FREE)
  contracts_remaining Int      @default(3)
  provider          String     @default("credentials")
  contracts         Contract[]
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  @@map("users")
}

model Contract {
  id        String   @id @db.Uuid @default(uuid())
  title     String
  fileUrl   String
  fileName  String
  status    Status   @default(draft)
  fileType  String
  content   String   @db.Text
  highlights Json    @default("[]")
  changes   Json    @default("[]")
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

enum Role {
  FREE
  PRO
}

enum Status {
  draft
  under_review
  approved
  rejected
}

```


Let me know if you need help with the migration process!

---

_**User**_

i dont need to lose all my data

---

_**Assistant**_



You're right - we don't want to lose data. Instead of using `migrate dev`, we should create a migration that safely adds the new fields while preserving existing data. Here's what we should do:

1. First, let's check what fields are currently in your database:
```bash
npx prisma db pull
```

This will update your schema to match the current database state.

2. Then, we can create a new migration that only adds the missing fields:
```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

3. Review the migration.sql file to ensure it only adds new fields and doesn't drop any tables.

4. Apply the migration:
```bash
npx prisma migrate deploy
```

Can you run `npx prisma db pull` first and share the output? This will help us see exactly what fields we need to add without risking data loss.

---

_**User**_

help to fix when a use a npx prisma migrate deploy

---

_**Assistant**_



Since you have an existing database with data, we need to create a baseline migration first. Here's how to fix this:

1. First, create a migrations directory:
```bash
mkdir -p prisma/migrations
```

2. Create a baseline migration by running:
```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```

3. Create a migration.sql file with the following content:
```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('draft', 'under_review', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Contract" 
ALTER COLUMN "content" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DATA TYPE "Status" USING status::text::"Status",
ALTER COLUMN "highlights" SET DEFAULT '[]',
ALTER COLUMN "changes" SET DEFAULT '[]';

-- DropEnum
DROP TYPE IF EXISTS "contract_status";
```

4. Then initialize the migration history:
```bash
npx prisma migrate resolve --applied 0_init
```

5. Finally, you can deploy the migration:
```bash
npx prisma migrate deploy
```

This approach will:
1. Create a baseline from your existing schema
2. Safely modify the columns without losing data
3. Set up proper migration tracking
4. Remove the duplicate enum

Let me know if you need help with any of these steps!

---

_**User**_

i think its work

---

_**Assistant**_

Yes, the migration was successful! The `npx prisma migrate deploy` command showing "No pending migrations to apply" means that:

1. Your migration history is now properly tracked
2. Your schema is in sync with the database
3. Your data is preserved

Now you can proceed with implementing the contract analysis. Let's verify the schema is working by checking if we can create a contract with highlights and changes:

```typescript:src/app/api/contracts/upload/route.ts
const contract = await prisma.contract.create({
  data: {
    id: crypto.randomUUID(),
    title: file.name,
    fileUrl: publicUrl,
    fileName,
    status: "under_review",
    fileType: file.type,
    content: extractedText,
    highlights: [], // This should now work
    changes: [],   // This should now work
    userId: user.id
  }
});
```

Try uploading a new contract to verify everything is working correctly. Let me know if you need help with the OpenAI analysis implementation!

---

_**User**_

@route.ts 

---

_**Assistant**_



The error is occurring because Prisma doesn't recognize the `highlights` and `changes` fields. Let's fix the contract creation part of your code:

```typescript:src/app/api/contracts/upload/route.ts
const contract = await prisma.contract.create({
  data: {
    id: crypto.randomUUID(),
    title: file.name,
    fileUrl: publicUrl,
    fileName: file.name,
    status: "under_review",
    fileType: file.type,
    content: extractedText,
    // Convert arrays to JSON strings for Prisma
    highlights: JSON.stringify(highlights),
    changes: JSON.stringify(changes),
    userId: user.id
  }
});
```

Also, let's update the `analyzeContract` function to remove the `response_format` option since it's causing issues:

```typescript:src/app/api/contracts/upload/route.ts
async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a contract analyzer. Analyze the contract and return a JSON string with this exact format:
            {
              "highlights": [
                {
                  "type": "critical|warning|improvement",
                  "message": "description of the issue",
                  "suggestion": "how to fix it",
                  "startIndex": 0,
                  "endIndex": 100
                }
              ],
              "changes": [
                {
                  "content": "new text",
                  "originalContent": "old text",
                  "explanation": "why change is needed",
                  "suggestion": "detailed suggestion",
                  "reason": "reasoning",
                  "type": "critical|warning|improvement",
                  "startIndex": 0,
                  "endIndex": 100
                }
              ]
            }`
        },
        {
          role: "user",
          content: `Analyze this contract and provide the analysis in the specified JSON format: ${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let analysis;
    try {
      analysis = JSON.parse(response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { highlights: [], changes: [] };
    }
    
    return {
      highlights: (analysis.highlights || []).map((h: Omit<Highlight, 'id'>) => ({
        ...h,
        id: crypto.randomUUID()
      })),
      changes: (analysis.changes || []).map((c: Omit<AIChange, 'id' | 'status'>) => ({
        ...c,
        id: crypto.randomUUID(),
        status: 'pending'
      }))
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { highlights: [], changes: [] };
  }
}
```

Key changes:
1. Added JSON.stringify for highlights and changes in contract creation
2. Removed response_format from OpenAI call
3. Added better error handling for JSON parsing
4. Updated the system prompt to be more specific about the expected JSON format

This should resolve the Prisma error and improve the reliability of the OpenAI analysis.

---

_**User**_

Invalid `prisma.contract.create()` invocation: { data: { id: "4573c2d6-3d80-4a56-b77c-ddc0ac35ce8b", title: "Contrato_Compra_Venda.txt", fileUrl: "https://lvtfajgimtkvixdbptut.supabase.co/storage/v1/object/public/contracts/1731263287552-Contrato_Compra_Venda.txt", fileName: "Contrato_Compra_Venda.txt", status: "under_review", fileType: "text/plain", content: "CONTRATO DE COMPRA E VENDA DE IMÓVEL\n\nPARTES:\nVendedor: Nome do Vendedor, CPF, endereço, e outros dados de identificação.\nComprador: Nome do Comprador, CPF, endereço, e outros dados de identificação.\n\nOBJETO DO CONTRATO:\nEste contrato tem como objeto a compra e venda do imóvel situado em [endereço completo], registrado sob a matrícula nº [número da matrícula] no [cartório de registro].\n\nCLÁUSULAS:\n1. Preço: O valor total do imóvel é de R$ [valor total] e será pago conforme descrito na cláusula de pagamento.\n2. Forma de Pagamento: O pagamento será realizado da seguinte forma: [detalhamento das parcelas, entrada, financiamento, etc.].\n3. Posse e Transferência: A posse do imóvel será transferida ao comprador após a quitação do valor acordado e assinatura da escritura definitiva.\n4. Impostos e Taxas: Todos os impostos, taxas e emolumentos incidentes sobre a transação são de responsabilidade do comprador.\n5. Garantias: O vendedor garante que o imóvel está livre de quaisquer ônus, dívidas ou pendências judiciais, exceto aquelas declaradas neste contrato.\n6. Rescisão: Em caso de inadimplência por parte do comprador, o vendedor poderá rescindir o contrato e reter 10% do valor pago a título de multa.\n7. Foro: Fica eleito o foro da Comarca de [cidade] para dirimir quaisquer dúvidas ou conflitos oriundos deste contrato.\n", highlights: "[]", ~~~~~~~~~~ changes: "[]", userId: "c23a32ed-5a72-455d-9c4e-6ae3bc645e6c", ? createdAt?: DateTime, ? updatedAt?: DateTime } } Unknown argument `highlights`. Available options are marked with ?.

---

_**Assistant**_



I see the issue. The Prisma schema needs to be updated to match how we're trying to create the contract. Let's modify the schema:

```prisma:prisma/schema.prisma
model Contract {
  id        String   @id @default(uuid())
  title     String
  fileUrl   String
  fileName  String
  status    Status   @default(draft)
  fileType  String
  content   String   @db.Text
  highlights String  @default("[]") // Changed from Json to String
  changes   String  @default("[]") // Changed from Json to String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

The key change is that we're storing the highlights and changes as String fields instead of Json fields, since we're stringifying them anyway.

After updating the schema:

1. Create a new migration:
```bash
npx prisma migrate dev --name update_highlights_to_string
```

2. Then the contract creation in your route should work:

```typescript:src/app/api/contracts/upload/route.ts
const contract = await prisma.contract.create({
  data: {
    id: crypto.randomUUID(),
    title: file.name,
    fileUrl: publicUrl,
    fileName: file.name,
    status: "under_review",
    fileType: file.type,
    content: extractedText,
    highlights: JSON.stringify(highlights),
    changes: JSON.stringify(changes),
    userId: user.id
  }
});
```

This should resolve the "Unknown argument 'highlights'" error.

---

_**User**_

help to fix

---

_**Assistant**_



Let's fix this by creating a migration that handles the NULL values before making the columns required. Here's how:

1. First, create the migration file:
```bash
npx prisma migrate dev --create-only --name update_highlights_to_string
```

2. Then modify the generated migration file in `prisma/migrations/[timestamp]_update_highlights_to_string.sql`:

```sql
-- First, update existing NULL values to empty array string
UPDATE "Contract"
SET 
    highlights = '[]',
    changes = '[]'
WHERE highlights IS NULL OR changes IS NULL;

-- Then alter the columns to be String with default value
ALTER TABLE "Contract" 
    ALTER COLUMN highlights TYPE TEXT,
    ALTER COLUMN changes TYPE TEXT,
    ALTER COLUMN highlights SET DEFAULT '[]',
    ALTER COLUMN changes SET DEFAULT '[]',
    ALTER COLUMN highlights SET NOT NULL,
    ALTER COLUMN changes SET NOT NULL;
```

3. Apply the migration:
```bash
npx prisma migrate dev
```

This approach:
1. Updates existing NULL values to empty array strings
2. Changes the column type to TEXT
3. Sets default values
4. Makes the columns required

This should handle the existing NULL values safely before making the columns required.

---



---


import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import { Highlight, AIChange } from '@/types/contract';

export const maxDuration = 300; // Set max duration to 300 seconds (5 minutes)
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a new instance for this route
const prisma = new PrismaClient();

async function summarizeText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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

async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    // Add timeout for OpenAI call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI timeout')), 60000);
    });

    const analysisPromise = openai.chat.completions.create({
      // Reduce tokens to speed up response
      max_tokens: 2000, // Reduced from 4000
      temperature: 0.1,
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert legal document analyzer specialized in contracts. Your task is to:

1. Analyze the provided contract text for issues and improvements
2. Suggest additional essential clauses that are missing
3. Provide comprehensive feedback regardless of contract length
4. Provide more highlights and changes critical types, make more alarming then others
5. IMPORTANT INDEXING RULES FOR HIGHLIGHTS AND CHANGES:
- Use the exact character positions in the text (startIndex and endIndex)
- For each highlight and change, find the precise text span it refers to
- startIndex should point to the beginning of the relevant text
- endIndex should point to the end of the relevant text
- Verify that text.substring(startIndex, endIndex) contains the exact text you're referring to
- For missing clauses, use the position where they should be inserted

Analyze essential Contracts Elements how need atention.
If Essential Contract Elements are present but not complete, suggest a complete with warnings
If any of the Essential Contract Elements are missing, suggest a complete set of clauses with critical type
Always generate a highlights and changes position for each issue in the text, make sure to use the exact position of each issue in the text using string indexes. 
If have 0 startIndex and endIndex after the analysis, make sure to use the whole text length as startIndex and endIndex

For short contracts:
- Identify missing essential clauses
- Suggest complete new sections with proper legal language
- Provide detailed explanations for why each addition is important
- Ensure suggestions follow industry best practices`
        },
        {
          role: "user",
          content: `Analyze this contract and provide comprehensive feedback. You MUST find the exact position of each issue in the text using string indexes on existing text.

IMPORTANT INDEXING RULES:
1. Use the exact character positions in the text (startIndex and endIndex)
2. For each highlight and change, find the precise text span it refers to
3. startIndex should point to the beginning of the relevant text
4. endIndex should point to the end of the relevant text
5. Verify that text.substring(startIndex, endIndex) contains the exact text you're referring to
6. For missing clauses, use the position where they should be inserted

Example of proper indexing:
If the text contains "Payment Terms: $500" and you want to highlight "Payment Terms",
and this phrase starts at character 100 in the text, you would use:
startIndex: 100
endIndex: 113
for highlight and change

Return ONLY a valid JSON object with this exact structure:
{
  "highlights": [
    {
      "type": "critical" | "warning" | "improvement",
      "message": "Clear description of the issue",
      "suggestion": "Detailed suggestion including complete clause text when appropriate",
      "startIndex": number (exact character position where the issue starts - always suggest the start of the issue),
      "endIndex": number (exact character position where the issue ends - always suggest the end of the issue)
    }
  ],
  "changes": [
    {
      "content": "Complete suggested text including new clauses",
      "originalContent": "Exact text to be replaced (must match text.substring(startIndex, endIndex))",
      "explanation": "Detailed explanation of why this change or addition is needed",
      "suggestion": "Specific implementation guidance",
      "reason": "Legal and business reasoning for the change",
      "type": "critical" | "warning" | "improvement",
      "startIndex": number (exact character position where the change should start),
      "endIndex": number (exact character position where the change should end),
      "status": "pending"
    }
  ]
}
Make sure to use the exact position of each issue in the text using string indexes for highlights and changes.
          For short or simple contracts, suggest additional clauses and sections that would make it more comprehensive and legally sound.
          
          Contract to analyze: ${text}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const response = await Promise.race([analysisPromise, timeoutPromise]);

    let analysis;
    try {
      analysis = JSON.parse(response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { highlights: [], changes: [] };
    }
    
    const highlights = (analysis.highlights || []).map((h: Omit<Highlight, 'id'>) => ({
      ...h,
      id: crypto.randomUUID(),
      type: ['critical', 'warning', 'improvement'].includes(h.type) ? h.type : 'improvement'
    }));

    const changes = (analysis.changes || []).map((c: Omit<AIChange, 'id' | 'status'>) => ({
      ...c,
      id: crypto.randomUUID(),
      status: 'pending',
      type: ['critical', 'warning', 'improvement'].includes(c.type) ? c.type : 'improvement'
    }));

    if (highlights.length === 0) {
      highlights.push({
        id: crypto.randomUUID(),
        type: 'improvement',
        message: 'General document review recommended',
        suggestion: 'Consider having a legal professional review the document for completeness',
        startIndex: 0,
        endIndex: text.length
      });
    }

    return { highlights, changes };

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

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Extract text and analyze
      const extractedText = await extractTextContent(file);
      const { highlights, changes } = await analyzeContract(extractedText);

      // Upload to Supabase
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

      // Create contract without transaction
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

      return {
        success: true,
        contract: {
          ...contract,
          highlights: JSON.parse(contract.highlights || '[]'),
          changes: JSON.parse(contract.changes || '[]')
        }
      };
    };

    // Race between timeout and processing
    const result = await Promise.race([processingPromise(), timeoutPromise]);
    return NextResponse.json(result);

  } catch (error: any) {
    // Make sure to disconnect even on error
    await prisma.$disconnect();
    
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
    // Extra safety to ensure disconnection
    await prisma.$disconnect();
  }
}

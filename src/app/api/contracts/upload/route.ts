import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import { 
  IssueType, 
  RiskType, 
  ContractIssue, 
  SuggestedClause,
  PDFPosition,
  Contract
} from '@/types/contract';
import PDFParser from 'pdf2json';

export const maxDuration = 60; // Set max duration to Vercel default
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

// Criar cliente Supabase com service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface PDFExtractResult {
  text: string;
  numPages: number;
  textCoordinates: Map<string, {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
  }>;
}

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<PDFExtractResult> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        let fullText = '';
        const numPages = pdfData.Pages.length;
        const textCoordinates = new Map();
        
        // Fator de escala do PDF (72 DPI é o padrão)
        const PDF_SCALE = 1;
        
        pdfData.Pages.forEach((page: any, pageIndex: number) => {
          // Agrupar textos por linha (mesma coordenada Y)
          const lineGroups = new Map<number, any[]>();
          
          page.Texts.forEach((item: any) => {
            const yPos = Math.round(item.y * 100);
            if (!lineGroups.has(yPos)) {
              lineGroups.set(yPos, []);
            }
            lineGroups.get(yPos)?.push(item);
          });

          lineGroups.forEach((items, yPos) => {
            items.sort((a, b) => a.x - b.x);
            
            const lineText = items
              .map(item => decodeURIComponent(item.R?.[0]?.T || ''))
              .join(' ')
              .trim();

            if (lineText) {
              const firstItem = items[0];
              const lastItem = items[items.length - 1];
              
              const x1 = firstItem.x * PDF_SCALE;
              const y1 = firstItem.y * PDF_SCALE;
              const x2 = (lastItem.x + lastItem.w) * PDF_SCALE;
              const y2 = (firstItem.y + firstItem.h) * PDF_SCALE;
              
              textCoordinates.set(lineText, {
                x1,
                y1,
                x2,
                y2,
                width: x2 - x1,
                height: firstItem.h * PDF_SCALE,
                pageNumber: pageIndex + 1,
                text: lineText // Para debug
              });

              fullText += lineText + '\n';
            }
          });
        });

        console.log('Mapped coordinates:', Object.fromEntries(textCoordinates));
        
        resolve({
          text: fullText.trim(),
          numPages,
          textCoordinates
        });
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.parseBuffer(Buffer.from(buffer));
  });
}

async function extractTextContent(file: File): Promise<{
  text: string;
  numPages: number;
  textCoordinates: Map<string, any>;
}> {
  const buffer = await file.arrayBuffer();
  const result = await extractTextFromPDF(buffer);
  const preprocessedText = preprocessContractText(result.text);
  
  return {
    text: preprocessedText,
    numPages: result.numPages,
    textCoordinates: result.textCoordinates
  };
}

function preprocessContractText(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, '\n') // Normaliza quebras de linha
    .replace(/\n{2,}/g, '\n\n') // Limita linhas vazias a uma
    .replace(/([^\n])\n([^\n])/g, '$1 $2') // Remove quebras de linha desnecessárias dentro de frases
    .replace(/(\.|\!|\?)(\s*)([A-Z])/g, '$1\n\n$3') // Adiciona espaçamento entre frases
    .trim();
}

async function analyzeContract(text: string, textCoordinates: Map<string, any>): Promise<{ 
  issues: ContractIssue[], 
  suggestedClauses: SuggestedClause[] 
}> {
  try {
    // Converter o Map de coordenadas para um objeto para incluir no prompt
    const textLines = Array.from(textCoordinates.entries()).map(([text, coords]) => ({
      text,
      coordinates: coords
    }));

    const analysisResponse = await openai.chat.completions.create({
      max_tokens: 3000,
      temperature: 0.1,
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert legal document analyzer specialized in contracts. Your task is to:

1. Analyze the provided contract text for issues and improvements.
2. Identify missing essential clauses.
3. Provide comprehensive feedback in the following categories:
   - Critical: Legal risks or serious issues
   - Warning: Compliance concerns or potential risks
   - Improvement: Suggestions for better clarity or protection

Return a JSON with the following structure:
{
  "issues": [
    {
      "id": "uuid-string",
      "type": "critical" | "warning" | "improvement",
      "originalText": "EXACT text from the provided segments",
      "newText": "Suggested replacement text",
      "explanation": "Clear explanation of the issue",
      "riskType": "legal" | "financial" | "compliance" | "operational",
      "status": "pending",
      "position": {
        "startIndex": number,
        "endIndex": number,
        "pageNumber": number,
        "x1": number,
        "y1": number,
        "x2": number,
        "y2": number,
        "width": number,
        "height": number
      }
    }
  ],
  "suggestedClauses": [
    {
      "id": "uuid-string",
      "title": "Clause title",
      "explanation": "Why this clause is needed",
      "suggestedText": "Complete text of suggested clause",
      "riskType": "legal" | "financial" | "compliance" | "operational",
      "status": "pending",
      "suggestedPosition": {
        "afterClause": "Text of clause to insert after",
        "pageNumber": number
      }
    }
  ]
}`        },
        {
          role: "user",
          content: `Analyze this contract text and use the provided text segments with coordinates:
${JSON.stringify(textLines, null, 2)}`
        }
      ]
    });

    const analysis = JSON.parse(analysisResponse.choices[0]?.message?.content || '{"issues":[],"suggestedClauses":[]}');

    // Processar issues mantendo as coordenadas originais
    const processedIssues = analysis.issues.map((issue: ContractIssue) => {
      const coordinates = textCoordinates.get(issue.originalText.trim());
      console.log('Found coordinates for:', issue.originalText, coordinates);

      return {
        ...issue,
        id: issue.id || crypto.randomUUID(),
        status: 'pending' as const,
        position: {
          ...issue.position,
          ...(coordinates || {}) // Usar coordenadas encontradas ou manter as do GPT
        }
      };
    });

    return {
      issues: processedIssues,
      suggestedClauses: analysis.suggestedClauses
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { issues: [], suggestedClauses: [] };
  }
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Upload to Supabase Storage
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    // Extract text and analyze
    const { text, numPages, textCoordinates } = await extractTextContent(file);
    const analysisResult = await analyzeContract(text, textCoordinates);

    // Criar contrato com dados processados
    const contract = await prisma.contract.create({
      data: {
        title: file.name,
        fileUrl: publicUrl,
        fileName: file.name,
        status: "under_review",
        fileType: file.type,
        content: text,
        issues: analysisResult.issues,
        suggestedClauses: analysisResult.suggestedClauses,
        metadata: {
          pageCount: numPages,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userId: userId,
        numPages: numPages
      }
    });

    return NextResponse.json({
      success: true,
      contract
    });

  } catch (error) {
    console.error('Upload error details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error processing contract' 
    }, { status: 500 });
  }
}

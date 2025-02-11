import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import { 
  ContractIssue, 
  SuggestedClause,
  PDFPosition,
  Contract
} from '@/types/contract';
import PDFParser from 'pdf2json';
import { analyzeContract } from '@/lib/ai';
import { processContractInBackground } from '@/lib/process';

export const maxDuration = 300; // Aumentado para 5 minutos
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
    const pdfParser = new PDFParser(null, false);

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

    // 1. Criar contrato inicial com status "analyzing"
    const contract = await prisma.contract.create({
      data: {
        title: file.name,
        fileUrl: '', // será atualizado após upload
        fileName: file.name,
        status: "analyzing",
        fileType: file.type,
        content: '',  // será atualizado após extração
        issues: [],   // será atualizado após análise
        suggestedClauses: [], // será atualizado após análise
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        },
        userId: userId,
        numPages: 0   // será atualizado após extração
      }
    });

    // 2. Iniciar processamento em background
    processContractInBackground(contract.id, file, userId);

    // 3. Retornar resposta imediata
    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        status: "analyzing"
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process contract' 
    }, { status: 500 });
  }
}

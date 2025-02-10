import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { analyzeContract } from '@/lib/ai';
import PDFParser from 'pdf2json';

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
}

function preprocessContractText(text: string): string {
    return text
      .replace(/\r\n|\r|\n/g, '\n') // Normaliza quebras de linha
      .replace(/\n{2,}/g, '\n\n') // Limita linhas vazias a uma
      .replace(/([^\n])\n([^\n])/g, '$1 $2') // Remove quebras de linha desnecessárias dentro de frases
      .replace(/(\.|\!|\?)(\s*)([A-Z])/g, '$1\n\n$3') // Adiciona espaçamento entre frases
      .trim();
}  

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

export async function processContractInBackground(contractId: string, file: File, userId: string) {
  try {
    // 1. Upload do arquivo para o Supabase
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueFileName = `${Date.now()}-${sanitizedFileName}`;
    const buffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(uploadData.path);

    // 2. Extrair texto e coordenadas
    const { text, numPages, textCoordinates } = await extractTextContent(file);

    // 3. Primeira atualização: URL do arquivo e conteúdo
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        fileUrl: publicUrl,
        content: text,
        numPages: numPages
      }
    });

    // 4. Análise do contrato
    const analysisResult = await analyzeContract(text, textCoordinates);

    // 5. Atualização final com resultados
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        issues: JSON.parse(JSON.stringify(analysisResult.issues)),
        suggestedClauses: JSON.parse(JSON.stringify(analysisResult.suggestedClauses)),
        status: "under_review",
        metadata: {
          pageCount: numPages,
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Background processing error:', error);
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "error",
        metadata: {
          error: 'Failed to process contract',
          updatedAt: new Date()
        }
      }
    });
  }
}
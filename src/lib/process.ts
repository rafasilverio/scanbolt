import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { analyzeContract } from '@/lib/ai';
import PDFParser from 'pdf2json';
import { addToQueue, getQueueStatus } from './queue';
import prisma from './prisma';

const prismaClient = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function processContractInBackground(
  file: File,
  onProgress?: (progress: number, step: string) => void,
  userId: string = '',
  existingContractId?: string
) {
  try {
    let contract;
    
    if (existingContractId) {
      contract = await prisma.contract.findUnique({
        where: { id: existingContractId }
      });
      
      if (!contract) {
        throw new Error(`Contrato com ID ${existingContractId} não encontrado`);
      }
    } else {
      // Se precisar criar um novo contrato, primeiro busque o usuário
      let validUserId = null;
      
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          validUserId = user.id; // Usar o ID do usuário recuperado do banco
        } else {
          console.warn('User not found, creating contract without user');
        }
      }
      
      contract = await prisma.contract.create({
        data: {
          title: file.name,
          status: 'under_review',
          fileType: file.type,
          content: '',
          issues: [],
          suggestedClauses: [],
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          numPages: 0,
          fileUrl: '',
          fileName: '',
          userId: validUserId
        },
      });
    }

    // 2. Upload do arquivo para o Supabase Storage
    onProgress?.(20, 'Enviando arquivo...');
    const fileExt = file.name.split('.').pop();
    const fileName = `${contract.id}.${fileExt}`;
    const filePath = `contracts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Erro ao fazer upload do arquivo');
    }

    // 3. Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(filePath);

    // 4. Atualizar contrato com a URL do arquivo
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        fileUrl: publicUrl,
        fileName: fileName,
      },
    });

    console.log(`Contrato atualizado com URL: ${publicUrl}`);

    // 5. Converter arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer).toString('base64');

    // 6. Adicionar job à fila
    onProgress?.(100, 'Adicionando à fila de processamento...');
    await addToQueue({
      contractId: contract.id,
      fileData: {
        buffer,
        name: file.name,
        type: file.type,
        size: file.size
      },
      userId: userId || '', // Usar o userId fornecido
      isPreview: false
    });

    return {
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        status: contract.status,
      },
    };
  } catch (error) {
    console.error('Erro no processamento:', error);
    throw error;
  }
}

// Exporta função para verificar o status da fila
export { getQueueStatus };
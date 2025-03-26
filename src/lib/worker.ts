import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';
import { getNextJob, ContractJob } from './queue';

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Função para extrair texto do PDF
async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const pdfParser = new PDFParser();
  
  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const text = pdfData.Pages
          .map(page => page.Texts.map(text => text.R.map(r => r.T).join('')).join(' '))
          .join('\n');
        
        resolve({
          text,
          pageCount: pdfData.Pages?.length || 1
        });
      } catch (error) {
        reject(new Error('Failed to parse PDF content'));
      }
    });
    
    pdfParser.on('pdfParser_dataError', (error) => {
      reject(new Error(`PDF parsing error: ${error}`));
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(new Error('Failed to parse PDF buffer'));
    }
  });
}

// Função principal que processa um job da fila
async function processJob(job: ContractJob) {
  try {
    console.log(`Processing job for contract: ${job.contractId}`);
    
    // Atualizar status para 'processing'
    await prisma.contract.update({
      where: { id: job.contractId },
      data: { status: 'processing' }
    });
    
    // Reconstruir o buffer do arquivo a partir dos dados serializados
    const fileData = job.fileData;
    const buffer = Buffer.from(fileData.buffer, 'base64');
    
    // 1. Upload do arquivo para o Supabase Storage
    const filePath = `contracts/${job.contractId}/${fileData.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, buffer, {
        contentType: fileData.type,
        upsert: true
      });
      
    if (uploadError) {
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }
    
    // 2. Extrair conteúdo do PDF
    const { text, pageCount } = await extractTextFromPDF(buffer);
    
    // 3. Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(filePath);
      
    // 4. Atualizar o contrato com os dados processados
    await prisma.contract.update({
      where: { id: job.contractId },
      data: {
        fileUrl: publicUrlData.publicUrl,
        content: text,
        numPages: pageCount,
        status: job.isPreview ? 'preview_ready' : 'under_review'
      }
    });
    
    console.log(`Job completed for contract: ${job.contractId}`);
    
    // 5. Se for um preview, atualizar cache de preview (se necessário)
    if (job.isPreview && job.tempId) {
      // Lógica adicional para preview se necessário
    }
  } catch (error) {
    console.error('Error processing job:', error);
    
    // Atualizar contrato com status de erro
    await prisma.contract.update({
      where: { id: job.contractId },
      data: { status: 'error' }
    });
    
    throw error;
  }
}

// Função para iniciar o worker
export async function startWorker() {
  console.log('Starting contract processing worker...');
  
  // Iniciar loop infinito para processar jobs
  // No ambiente Edge não podemos ter um loop infinito,
  // então processamos um único job e retornamos
  try {
    // Obter próximo job da fila
    const job = await getNextJob();
    
    if (job) {
      console.log('Processing new job:', job.contractId);
      await processJob(job);
      return true;
    } else {
      console.log('No jobs to process');
      return false;
    }
  } catch (error) {
    console.error('Worker error:', error);
    return false;
  }
}

// Exportar a função de início para ser chamada pela API
export default startWorker; 
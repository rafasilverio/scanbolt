const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const PDFParser = require('pdf2json');
const { getNextJob } = require('../lib/queue.common');
const { analyzeContract } = require('../lib/ai.common');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let checkInterval = 5000; // Inicial: 5 segundos
const MAX_INTERVAL = 60000; // Máximo: 1 minuto
const MIN_INTERVAL = 5000; // Mínimo: 5 segundos
let emptyQueueCount = 0;

// Função para extrair texto do PDF
async function extractTextFromPDF(buffer) {
  const pdfParser = new PDFParser();
  
  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        const textCoordinates = new Map();
        let fullText = '';
        
        pdfData.Pages.forEach((page, pageIndex) => {
          // Array para armazenar textos da página atual em ordem
          const pageTexts = [];
          
          page.Texts.forEach((item) => {
            try {
              // Obter o texto do PDF
              const encodedText = item.R.map(r => r.T).join('');
              let text = encodedText;
              
              // Só tenta decodificar se parece estar codificado
              if (encodedText.includes('%') && /%.{2}/.test(encodedText)) {
                try {
                  text = decodeURIComponent(encodedText);
                } catch (decodeError) {
                  console.warn('Could not decode text, using raw version');
                }
              }
              
              if (text.trim()) {
                // Armazenar o texto com suas coordenadas
                pageTexts.push({
                  text,
                  coords: {
                    x1: item.x,
                    y1: item.y,
                    x2: item.x + item.w,
                    y2: item.y + item.h,
                    width: item.w,
                    height: item.h,
                    pageNumber: pageIndex + 1
                  }
                });
              }
            } catch (decodeError) {
              console.warn('Error decoding text in PDF:', decodeError);
            }
          });
          
          // Ordenar textos por coordenada Y (de cima para baixo)
          pageTexts.sort((a, b) => a.coords.y1 - b.coords.y1);
          
          // Adicionar textos ao resultado
          pageTexts.forEach(({text, coords}) => {
            textCoordinates.set(text, {
              ...coords,
              text // Incluir o texto decodificado nas coordenadas para referência
            });
            fullText += text + ' ';
          });
          
          fullText += '\n';
        });
        
        resolve({
          text: fullText.trim(),
          pageCount: pdfData.Pages?.length || 1,
          textCoordinates
        });
      } catch (error) {
        reject(new Error('Failed to parse PDF content: ' + error.message));
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
async function processJob(job) {
  try {
    console.log(`Processing job for contract: ${job.contractId}`);
    console.log(`Contract ID type: ${typeof job.contractId}, value: ${job.contractId}`);
    console.log('Job data:', JSON.stringify({
      contractId: job.contractId,
      fileSize: job.fileData?.size,
      fileName: job.fileData?.name,
      fileType: job.fileData?.type,
      userId: job.userId,
      isPreview: job.isPreview
    }));
    
    // Reconstruir o buffer do arquivo a partir dos dados serializados
    const fileData = job.fileData;
    const buffer = Buffer.from(fileData.buffer, 'base64');
    
    // 1. Extrair conteúdo do PDF
    console.log('Extracting text from PDF...');
    const { text, pageCount, textCoordinates } = await extractTextFromPDF(buffer);
    
    // Função para processar o texto e remover codificações URL
    function preprocessContractText(text) {
      try {
        let decodedText = text;
        
        // Só tenta decodificar se o texto parece estar codificado em URL
        if (text.includes('%') && /%.{2}/.test(text)) {
          try {
            decodedText = decodeURIComponent(text);
          } catch (decodeError) {
            console.warn('Failed to decode text, using original version');
            // Continua usando a versão original
          }
        }
        
        // Normaliza quebras de linha e formato do texto
        return decodedText
          .replace(/\r\n|\r|\n/g, '\n')
          .replace(/\n{2,}/g, '\n\n')
          .replace(/([^\n])\n([^\n])/g, '$1 $2')
          .replace(/(\.|\!|\?)(\s*)([A-Z])/g, '$1\n\n$3')
          .trim();
      } catch (e) {
        console.error('Error processing text:', e);
        // Se não conseguir processar, retorna o texto original
        return text;
      }
    }
    
    // Decodificar o texto do contrato para remover codificação URL
    const decodedText = preprocessContractText(text);
    
    console.log(`Extracted text: ${decodedText.substring(0, 100)}...`);
    console.log(`Page count: ${pageCount}`);
    console.log(`Text coordinates count: ${textCoordinates.size}`);
    
    // 2. Análise da IA
    console.log('Running AI analysis...');
    const { issues, suggestedClauses } = await analyzeContract(decodedText, textCoordinates);
    console.log(`Analysis completed. Found ${issues.length} issues and ${suggestedClauses.length} clauses`);
    
    // 3. Verificar se o arquivo já foi enviado para o storage
    // Primeiro, verifica se já temos uma URL de arquivo no contrato
    const existingContract = await prisma.contract.findUnique({
      where: { id: job.contractId },
      select: { fileUrl: true, fileName: true }
    });
    
    let fileUrl;
    let fileName;
    
    if (existingContract && existingContract.fileUrl && existingContract.fileUrl.length > 10) {
      console.log('File already uploaded, using existing URL');
      fileUrl = existingContract.fileUrl;
      fileName = existingContract.fileName;
    } else {
      // 3.1 Se não existe, faz o upload do arquivo para o storage
      const timestamp = Date.now();
      const sanitizedFileName = fileData.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      
      fileName = `${timestamp}-${sanitizedFileName}`;
      const filePath = `contracts/${fileName}`;
      
      console.log(`Uploading file to path: ${filePath}`);
  
      // Upload do buffer para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, buffer, {
          contentType: fileData.type
        });
  
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      
      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);
      
      fileUrl = publicUrlData.publicUrl;
      console.log('Public URL:', fileUrl);
    }
    
    // Processar issues e suggestedClauses
    const issuesData = issues.map(issue => ({
      ...issue,
      id: issue.id || crypto.randomUUID()
    }));

    const suggestedClausesData = suggestedClauses.map(clause => ({
      ...clause,
      id: clause.id || crypto.randomUUID()
    }));

    // Converter para JSON strings
    const issuesJson = JSON.stringify(issuesData);
    const suggestedClausesJson = JSON.stringify(suggestedClausesData);
    const metadataJson = JSON.stringify({
      pageCount,
      updatedAt: new Date().toISOString(),
      analyzedAt: new Date().toISOString(),
      processingTime: Date.now() - (job.createdAt || Date.now())
    });

    // Atualizar todos os campos com SQL direto
    await prisma.$executeRaw`
      UPDATE "Contract" 
      SET 
        "fileUrl" = ${fileUrl},
        "fileName" = ${fileName},
        "content" = ${decodedText},
        "numPages" = ${pageCount},
        "status" = 'under_review',
        "issues" = ${issuesJson}::jsonb,
        "suggestedClauses" = ${suggestedClausesJson}::jsonb,
        "metadata" = ${metadataJson}::jsonb,
        "updatedAt" = ${new Date()}
      WHERE id = ${job.contractId}::uuid
    `;

    console.log(`Contract ${job.contractId} updated successfully with analysis results`);
    console.log(`Job completed for contract: ${job.contractId}`);
    
  } catch (error) {
    console.error('Error processing job:', error);
    
    // Atualizar contrato com status de erro usando SQL direto
    try {
      const errorMetadata = JSON.stringify({
        error: error.message,
        errorTimestamp: new Date().toISOString()
      });

      await prisma.$executeRaw`
        UPDATE "Contract" 
        SET 
          "status" = 'under_review',
          "metadata" = ${errorMetadata}::jsonb,
          "updatedAt" = ${new Date()}
        WHERE id = ${job.contractId}::uuid
      `;
      
      console.log(`Contract ${job.contractId} marked with error status`);
    } catch (statusError) {
      console.error('Failed to update contract status:', statusError);
    }
    
    throw error;
  }
}

// Função principal que executa o worker
async function runWorker() {
  console.log('Starting contract processing worker...');
  
  while (true) {
    try {
      // Obter próximo job da fila
      const job = await getNextJob();
      
      if (job) {
        console.log('Processing new job:', job.contractId);
        emptyQueueCount = 0; // Resetar contador de fila vazia
        checkInterval = MIN_INTERVAL; // Voltar para intervalo mínimo
        
        await processJob(job);
      } else {
        // Aumentar contagem de filas vazias
        emptyQueueCount++;
        
        // Ajustar intervalo baseado na inatividade
        if (emptyQueueCount > 5) {
          // Após 5 verificações vazias, aumentar o intervalo
          checkInterval = Math.min(checkInterval * 2, MAX_INTERVAL);
        }
        
        console.log(`No jobs to process, waiting ${checkInterval/1000} seconds... (Count: ${emptyQueueCount})`);
        
        // Aguardar antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    } catch (error) {
      console.error('Worker error:', error);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Exportar a função processJob para permitir o reuso no cron job
module.exports = {
  processJob,
  runWorker
};

// Iniciar o worker apenas se o arquivo for executado diretamente
if (require.main === module) {
  runWorker().catch(error => {
    console.error('Fatal worker error:', error);
    process.exit(1);
  });
} 
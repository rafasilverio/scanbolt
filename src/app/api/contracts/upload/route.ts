import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import OpenAI from 'openai';
import { Highlight, AIChange } from '@/types/contract';
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

// async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const pdfParser = new PDFParser(null, 1);

//     pdfParser.on("pdfParser_dataError", (errData: any) => {
//       console.error('PDF parsing error:', errData);
//       reject(new Error('Failed to parse PDF'));
//     });

//     pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
//       try {
//         const text = pdfData.Pages
//           .map((page: any) => {
//             return page.Texts
//               .map((item: any) => {
//                 const decodedText = decodeURIComponent(item.R?.[0]?.T || '');
//                 return decodedText.trim();
//               })
//               .filter(Boolean)
//               .join(' ');
//           })
//           .filter(Boolean)
//           .join('\n\n');

//         resolve(text || '');
//       } catch (error) {
//         console.error('PDF text extraction error:', error);
//         reject(new Error('Failed to extract text from PDF structure'));
//       }
//     });

//     try {
//       const buffer8 = Buffer.from(buffer);
//       pdfParser.parseBuffer(buffer8);
//     } catch (error) {
//       console.error('PDF buffer parsing error:', error);
//       reject(new Error('Failed to parse PDF buffer'));
//     }
//   });
// }

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error('PDF parsing error:', errData);
      reject(new Error('Failed to parse PDF'));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        // Melhor tratamento da formatação do texto
        const text = pdfData.Pages
          .map((page: any) => {
            let lastY = -1;
            let lineTexts: string[] = [];
            let pageLines: string[] = [];

            // Organiza os textos por posição Y (linha)
            page.Texts
              .sort((a: any, b: any) => a.y - b.y || a.x - b.x) // Ordena por Y e depois por X
              .forEach((item: any) => {
                const decodedText = decodeURIComponent(item.R?.[0]?.T || '').trim();
                if (!decodedText) return;

                // Se mudou a posição Y, é uma nova linha
                if (item.y !== lastY && lastY !== -1) {
                  pageLines.push(lineTexts.join(' '));
                  lineTexts = [];
                }

                lineTexts.push(decodedText);
                lastY = item.y;
              });

            // Adiciona a última linha
            if (lineTexts.length > 0) {
              pageLines.push(lineTexts.join(' '));
            }

            // Trata títulos e seções especiais
            return pageLines
              .map(line => {
                // Identifica e preserva títulos/cabeçalhos
                if (line.toUpperCase() === line && line.length > 10) {
                  return `\n${line}\n`;
                }
                // Identifica cláusulas e seções
                if (line.includes('CLÁUSULA') || line.includes('CLAUSULA')) {
                  return `\n\n${line}\n`;
                }
                return line;
              })
              .join('\n');
          })
          .join('\n\n'); // Separação entre páginas

        // Limpeza final
        const formattedText = text
          .replace(/\n{3,}/g, '\n\n') // Remove múltiplas quebras de linha
          .replace(/\s{2,}/g, ' ') // Remove múltiplos espaços
          .trim();

        resolve(formattedText);
      } catch (error) {
        console.error('PDF text extraction error:', error);
        reject(new Error('Failed to extract text from PDF structure'));
      }
    });

    try {
      const buffer8 = Buffer.from(buffer);
      pdfParser.parseBuffer(buffer8);
    } catch (error) {
      console.error('PDF buffer parsing error:', error);
      reject(new Error('Failed to parse PDF buffer'));
    }
  });
}

async function extractTextContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  switch (file.type) {
    case 'application/pdf':
      try {
        const text = await extractTextFromPDF(buffer);
        if (!text || text.trim().length === 0) {
          throw new Error('Extracted PDF text is empty');
        }
        return text;
      } catch (error) {
        console.error('PDF processing error:', error);
        throw new Error('Failed to process PDF file. Please ensure it contains readable text.');
      }
    
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    
    default:
      throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF or TXT file.`);
  }
}

// async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
//   try {
//     // Dividir o texto em parágrafos para melhor indexação
//     const paragraphs = text.split(/\n\n+/).map((p, index) => ({
//       text: p.trim(),
//       startIndex: text.indexOf(p),
//       endIndex: text.indexOf(p) + p.length
//     }));

//     const analysisPromise = openai.chat.completions.create({
//       max_tokens: 2000,
//       temperature: 0.1,
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert legal document analyzer specialized in contracts. Your task is to:

// 1. Analyze the provided contract text for issues and improvements
// 2. Suggest additional essential clauses that are missing
// 3. Provide comprehensive feedback regardless of contract length
// 4. Provide more highlights and changes critical types, make more alarming then others
// 5. IMPORTANT INDEXING RULES FOR HIGHLIGHTS AND CHANGES:
// - Each highlight should cover a complete paragraph or clause
// - Use the exact paragraph positions in the text (startIndex and endIndex)
// - For each highlight and change, find the complete paragraph it refers to
// - startIndex should point to the beginning of the paragraph
// - endIndex should point to the end of the paragraph
// - For missing clauses, use the position of the most relevant paragraph

// Analyze essential Contracts Elements how need attention.
// If Essential Contract Elements are present but not complete, suggest a complete with warnings
// If any of the Essential Contract Elements are missing, suggest a complete set of clauses with critical type`
//         },
//         {
//           role: "user",
//           content: `Analyze this contract and provide comprehensive feedback. The text has been divided into paragraphs with the following positions:

// ${paragraphs.map(p => `Position ${p.startIndex}-${p.endIndex}: "${p.text.substring(0, 100)}..."`).join('\n')}

// Use these paragraph positions for your analysis. Return ONLY a valid JSON object with highlights and changes that reference these exact positions.

// Contract to analyze: ${text}`
//         }
//       ],
//       response_format: { type: "json_object" }
//     });

//     const timeoutPromise = new Promise((_, reject) => {
//       setTimeout(() => reject(new Error('Analysis timed out')), 250000); // 60 second timeout
//     });

//     const response = await Promise.race([analysisPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;

//     let analysis;
//     try {
//       analysis = JSON.parse(response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}');
//     } catch (parseError) {
//       console.error('JSON parse error:', parseError);
//       return { highlights: [], changes: [] };
//     }
    
//     const highlights = (analysis.highlights || []).map((h: Omit<Highlight, 'id'>) => {
//       // Encontrar o parágrafo mais próximo para o highlight
//       const relevantParagraph = paragraphs.find(p => 
//         (h.startIndex >= p.startIndex && h.startIndex <= p.endIndex) ||
//         (h.startIndex <= p.startIndex && h.endIndex >= p.endIndex)
//       ) || paragraphs[0];

//       return {
//         ...h,
//         id: crypto.randomUUID(),
//         type: ['critical', 'warning', 'improvement'].includes(h.type) ? h.type : 'improvement',
//         startIndex: relevantParagraph.startIndex,
//         endIndex: relevantParagraph.endIndex
//       };
//     });

//     const changes = (analysis.changes || []).map((c: Omit<AIChange, 'id' | 'status'>) => {
//       // Encontrar o parágrafo mais próximo para a change
//       const relevantParagraph = paragraphs.find(p => 
//         (c.startIndex >= p.startIndex && c.startIndex <= p.endIndex) ||
//         (c.startIndex <= p.startIndex && c.endIndex >= p.endIndex)
//       ) || paragraphs[0];

//       return {
//         ...c,
//         id: crypto.randomUUID(),
//         status: 'pending',
//         type: ['critical', 'warning', 'improvement'].includes(c.type) ? c.type : 'improvement',
//         startIndex: relevantParagraph.startIndex,
//         endIndex: relevantParagraph.endIndex,
//         originalContent: text.substring(relevantParagraph.startIndex, relevantParagraph.endIndex)
//       };
//     });

//     // Garantir que cada highlight tenha um change associado
//     highlights.forEach(highlight => {
//       const hasAssociatedChange = changes.some(
//         change => change.startIndex === highlight.startIndex && 
//                  change.endIndex === highlight.endIndex
//       );

//       if (!hasAssociatedChange) {
//         changes.push({
//           id: crypto.randomUUID(),
//           content: highlight.suggestion,
//           originalContent: text.substring(highlight.startIndex, highlight.endIndex),
//           explanation: highlight.message,
//           suggestion: highlight.suggestion,
//           reason: highlight.message,
//           type: highlight.type,
//           startIndex: highlight.startIndex,
//           endIndex: highlight.endIndex,
//           status: 'pending'
//         });
//       }
//     });

//     if (highlights.length === 0) {
//       highlights.push({
//         id: crypto.randomUUID(),
//         type: 'improvement',
//         message: 'General document review recommended',
//         suggestion: 'Consider having a legal professional review the document for completeness',
//         startIndex: 0,
//         endIndex: text.length
//       });
//     }

//     return { highlights, changes };

//   } catch (error) {
//     console.error('Analysis error:', error);
//     return {
//       highlights: [{
//         id: crypto.randomUUID(),
//         type: 'warning',
//         message: 'Analysis timeout - please try again',
//         suggestion: 'Upload a smaller document or try again later',
//         startIndex: 0,
//         endIndex: text.length
//       }],
//       changes: []
//     };
//   }
// }

function preprocessContractText(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, '\n') // Normaliza quebras de linha
    .replace(/\n{2,}/g, '\n\n') // Limita linhas vazias a uma
    .replace(/([^\n])\n([^\n])/g, '$1 $2') // Remove quebras de linha desnecessárias dentro de frases
    .replace(/(\.|\!|\?)(\s*)([A-Z])/g, '$1\n\n$3') // Adiciona espaçamento entre frases
    .trim();
}

async function formatContractWithOpenAI(text: string): Promise<string> {
  const formattedTextResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2000,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `You are a text formatting expert specialized in legal contracts. Your task is to reformat the provided contract text to improve its readability and structure. Ensure the following:
1. Do not break sentences across lines unless there is a clear paragraph break.
2. Ensure appropriate paragraph spacing after sections, clauses, or major points.
3. Maintain the original contract's content without introducing or removing information.
4. Fix any formatting issues, such as misplaced line breaks, incorrect indentation, or inconsistent spacing.

Output the fully formatted contract text.`
      },
      {
        role: "user",
        content: `Here is the contract text: ${text}`
      }
    ]
  });

  const formattedContent = formattedTextResponse.choices[0]?.message?.content;
  if (!formattedContent) {
    return text;
  }
  return formattedContent.trim();
}


async function analyzeContract(text: string): Promise<{ highlights: Highlight[], changes: AIChange[] }> {
  try {
    // Preprocess do texto antes da análise
    const formattedText = preprocessContractText(text);

    const analysisPromise = openai.chat.completions.create({
      max_tokens: 2000,
      temperature: 0.1,
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert legal document analyzer specialized in contracts. Your task is to:

1. Analyze the provided contract text for issues and improvements.
2. Suggest additional essential clauses that are missing, if any.
3. Provide comprehensive feedback regardless of contract length.
4. Prioritize highlights and changes by type: critical > warning > improvement.
5. When identifying issues, reference the entire sentence or paragraph containing the issue.
6. Ensure proper indexing rules:
   - startIndex and endIndex must encompass the entire sentence or paragraph where the issue occurs.
   - Verify that text.substring(startIndex, endIndex) matches exactly the section being highlighted.
   - For missing clauses, suggest the insertion point by referencing the most logical adjacent paragraph.
7. For short contracts, suggest additional clauses and sections to enhance legal soundness.

Return the result as a valid JSON object with the following structure:
{
  "highlights": [
    {
      "type": "critical" | "warning" | "improvement",
      "message": "Clear description of the issue",
      "suggestion": "Detailed suggestion including complete clause text",
      "startIndex": number,
      "endIndex": number
    }
  ],
  "changes": [
    {
      "content": "Complete suggested text",
      "originalContent": "Exact text to be replaced",
      "explanation": "Detailed explanation",
      "suggestion": "Implementation guidance",
      "reason": "Legal reasoning",
      "type": "critical" | "warning" | "improvement",
      "startIndex": number,
      "endIndex": number,
      "status": "pending"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Analyze this contract: ${formattedText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout')), 60000);
    });

    const response = await Promise.race([analysisPromise, timeoutPromise]) as OpenAI.Chat.Completions.ChatCompletion;
    const analysis = JSON.parse(response.choices[0]?.message?.content || '{"highlights":[],"changes":[]}');

    let { highlights, changes } = analysis;

    // Garantir que cada highlight tenha um change correspondente
    highlights = highlights.map(highlight => {
      const relatedChange = changes.find(change => 
        change.suggestion === highlight.suggestion ||
        (change.startIndex === highlight.startIndex && change.endIndex === highlight.endIndex)
      );

      if (!relatedChange) {
        const newChange: AIChange = {
          id: crypto.randomUUID(),
          content: highlight.suggestion,
          originalContent: formattedText.substring(highlight.startIndex, highlight.endIndex),
          explanation: highlight.message,
          suggestion: highlight.suggestion,
          reason: highlight.message,
          type: highlight.type,
          startIndex: highlight.startIndex,
          endIndex: highlight.endIndex,
          status: 'pending'
        };
        changes.push(newChange);
      }

      return {
        ...highlight,
        id: highlight.id || crypto.randomUUID(),
        startIndex: highlight.startIndex >= 0 ? highlight.startIndex : 0,
        endIndex: highlight.endIndex > highlight.startIndex ? highlight.endIndex : highlight.startIndex + 10
      };
    });

    // Garantir que todos os changes tenham índices válidos
    changes = changes.map(change => ({
      ...change,
      id: change.id || crypto.randomUUID(),
      startIndex: change.startIndex >= 0 ? change.startIndex : 0,
      endIndex: change.endIndex > change.startIndex ? change.endIndex : change.startIndex + 10,
      status: 'pending'
    }));

    // Validações finais
    const validResults = {
      highlights: highlights.filter(h => 
        h.startIndex >= 0 && 
        h.endIndex > h.startIndex &&
        h.type && 
        h.message
      ),
      changes: changes.filter(c => 
        c.startIndex >= 0 && 
        c.endIndex > c.startIndex &&
        c.content &&
        c.type
      )
    };

    // Garantir pelo menos um resultado
    if (!validResults.highlights.length) {
      const defaultHighlight = {
        id: crypto.randomUUID(),
        type: 'warning',
        message: 'Review recommended',
        suggestion: 'Consider legal review',
        startIndex: 0,
        endIndex: formattedText.length
      };

      const defaultChange = {
        id: crypto.randomUUID(),
        type: 'warning',
        content: 'Consider legal review',
        originalContent: formattedText.substring(0, Math.min(100, formattedText.length)),
        explanation: 'Review recommended',
        suggestion: 'Consider legal review',
        reason: 'Document may need professional review',
        startIndex: 0,
        endIndex: formattedText.length,
        status: 'pending'
      };

      validResults.highlights.push(defaultHighlight);
      validResults.changes.push(defaultChange);
    }

    return validResults;

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      highlights: [{
        id: crypto.randomUUID(),
        type: 'warning',
        message: 'Analysis error - please try again',
        suggestion: 'Upload the document again or try a different format',
        startIndex: 0,
        endIndex: text.length
      }],
      changes: [{
        id: crypto.randomUUID(),
        type: 'warning',
        content: 'Please try again',
        originalContent: text.substring(0, Math.min(100, text.length)),
        explanation: 'Analysis error occurred',
        suggestion: 'Try uploading again',
        reason: 'Technical error during analysis',
        startIndex: 0,
        endIndex: text.length,
        status: 'pending'
      }]
    };
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const processingPromise = async () => {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        throw new Error('No file provided');
      }

      // Extract text and analyze
      const extractedText = await extractTextContent(file);
      const { highlights, changes } = await analyzeContract(extractedText);

      // Garante que todos os highlights e changes tenham IDs e índices corretos
      const processedHighlights = highlights.map(h => ({
        ...h,
        id: h.id || crypto.randomUUID(),
        startIndex: typeof h.startIndex === 'number' ? h.startIndex : 0,
        endIndex: typeof h.endIndex === 'number' ? h.endIndex : extractedText.length
      }));

      const processedChanges = changes.map(c => ({
        ...c,
        id: c.id || crypto.randomUUID(),
        startIndex: typeof c.startIndex === 'number' ? c.startIndex : 0,
        endIndex: typeof c.endIndex === 'number' ? c.endIndex : extractedText.length,
        status: c.status || 'pending',
        originalContent: c.originalContent || extractedText.substring(c.startIndex, c.endIndex)
      }));

      // Se não estiver autenticado, gera um ID temporário
      if (!session?.user?.email) {
        const tempId = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const { error: cacheError } = await supabaseAdmin
          .from('preview_cache')
          .insert({
            id: tempId,
            data: {
              tempId,
              content: extractedText,
              highlights: processedHighlights,
              changes: processedChanges,
              fileName: file.name,
              fileType: file.type
            },
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString()
          });

        if (cacheError) {
          console.error('Preview cache error:', cacheError);
          throw cacheError;
        }

        return {
          success: true,
          tempId,
          preview: true
        };
      }

      // Fluxo para usuários autenticados
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        throw new Error('User not found');
      }

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

      // Create contract
      const contract = await prisma.contract.create({
        data: {
          id: crypto.randomUUID(),
          title: file.name,
          fileUrl: publicUrl,
          fileName: file.name,
          status: "under_review",
          fileType: file.type,
          content: extractedText,
          highlights: JSON.stringify(processedHighlights),
          changes: JSON.stringify(processedChanges),
          userId: user.id
        }
      });

      console.log('Contract Data:', {
        highlights: processedHighlights,
        changes: processedChanges,
        indices: processedHighlights.map(h => ({
          id: h.id,
          start: h.startIndex,
          end: h.endIndex,
          text: contract.content.substring(h.startIndex, h.endIndex)
        }))
      });

      return {
        success: true,
        contract: {
          ...contract,
          highlights: processedHighlights,
          changes: processedChanges
        }
      };
    };

    const result = await processingPromise();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Upload error:', error);
    
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
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { tempId: string } }
) {
  try {
    console.log('Fetching preview for tempId:', params.tempId);

    const { data, error } = await supabaseAdmin
      .from('preview_cache')
      .select('data')
      .eq('id', params.tempId)
      .single();

    if (error || !data) {
      console.log('Preview not found:', error);
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    console.log('Preview found:', data);
    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Preview route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tempId: string } }
) {
  try {
    // Primeiro, verificar o Content-Type da requisição
    const contentType = request.headers.get('content-type');

    let file: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Se for um upload de arquivo via FormData
      const formData = await request.formData();
      file = formData.get('file') as File;
    } else {
      // Se for uma requisição JSON (como no caso do migrate)
      const body = await request.json();
      if (body.tempId) {
        // Esta é uma requisição de migração, não de upload
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
      }
    }
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Converter arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extrair texto do PDF com melhor tratamento de erro
    const pdfParser = new PDFParser();
    const { pdfText, pageCount } = await new Promise<{ pdfText: string, pageCount: number }>((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          const text = pdfData.Pages
            .map(page => page.Texts.map(text => text.R.map(r => r.T).join('')).join(' '))
            .join('\n');
          
          resolve({
            pdfText: text,
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

    console.log('PDF Text extracted, length:', pdfText.length);
    console.log('Page count:', pageCount);

    // Preparar dados para cache
    const previewData = {
      fileName: sanitizeFileName(file.name),
      fileType: file.type || 'application/pdf',
      content: buffer.toString('base64'),
      text: pdfText,
      metadata: {
        fileSize: file.size,
        pageCount: pageCount,
        uploadedAt: new Date().toISOString()
      }
    };

    console.log('Preview data prepared:', {
      fileName: previewData.fileName,
      fileType: previewData.fileType,
      textLength: previewData.text.length,
      contentLength: previewData.content.length,
      metadata: previewData.metadata
    });

    // Salvar no preview_cache
    const { error: insertError } = await supabaseAdmin
      .from('preview_cache')
      .insert({
        id: params.tempId,
        data: previewData,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

    if (insertError) {
      console.error('Error saving to preview_cache:', insertError);
      return NextResponse.json(
        { error: 'Failed to save preview' },
        { status: 500 }
      );
    }

    console.log('Preview saved successfully with tempId:', params.tempId);

    return NextResponse.json({
      success: true,
      tempId: params.tempId,
      preview: {
        ...previewData,
        content: undefined,
        stats: DEFAULT_PREVIEW_STATS
      }
    });

  } catch (error) {
    console.error('Preview creation error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create preview' },
      { status: 500 }
    );
  }
}

// Função de sanitização
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
    .toLowerCase();
}
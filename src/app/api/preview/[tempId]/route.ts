import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  req: NextRequest,
  { params }: { params: { tempId: string } }
) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Extrair o conteúdo do arquivo para armazenamento no cache
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer).toString('base64');

    // Armazenar dados no preview_cache para processamento posterior
    const { data, error } = await supabaseAdmin
      .from('preview_cache')
      .insert({
        id: params.tempId,
        data: {
          fileName: file.name,
          fileType: file.type,
          content: buffer,
          metadata: {
            fileSize: file.size,
            createdAt: new Date().toISOString()
          }
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Preview cache storage error:', error);
      throw new Error('Failed to store preview data');
    }

    // Retornar resposta imediata
    return NextResponse.json({
      success: true,
      tempId: params.tempId
    });

  } catch (error) {
    console.error('Preview upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process contract' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
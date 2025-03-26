import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PrismaClient } from '@prisma/client';
import { processContractInBackground } from '@/lib/process';

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

    // 1. Criar contrato inicial com status "queued"
    const contract = await prisma.contract.create({
      data: {
        title: file.name,
        fileUrl: '', // será atualizado após upload
        fileName: file.name,
        status: "queued",
        fileType: file.type,
        content: '',  // será atualizado após extração
        issues: [],   // será atualizado após análise
        suggestedClauses: [], // será atualizado após análise
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date()
        },
        tempId: params.tempId,
        numPages: 0   // será atualizado após extração
      }
    });

    // 2. Iniciar processamento em background
    await processContractInBackground(
      contract.id,
      file,
      'anonymous',
      true,
      params.tempId
    );

    // 3. Retornar resposta imediata
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
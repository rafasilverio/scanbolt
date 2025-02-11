import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { processContractInBackground } from '@/lib/process';
import { Blob, File } from 'fetch-blob/from.js';
import { Contract, ContractIssue, SuggestedClause } from '@/types/contract';

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

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obter tempId do corpo da requisição
    const { tempId } = await request.json();
    if (!tempId) {
      return NextResponse.json({ error: 'Missing tempId' }, { status: 400 });
    }

    // Buscar dados do preview
    const { data: previewCache, error: previewError } = await supabaseAdmin
      .from('preview_cache')
      .select('*')
      .eq('id', tempId)
      .single();

    if (previewError || !previewCache) {
      console.error('Preview cache error:', previewError);
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Verificar se os dados necessários existem
    if (!previewCache.data || !previewCache.data.fileName) {
      console.error('Invalid preview data:', previewCache);
      return NextResponse.json(
        { error: 'Invalid preview data' },
        { status: 400 }
      );
    }

    // Criar contrato seguindo exatamente a interface Contract
    const contract = await prisma.contract.create({
      data: {
        userId: session.user.id,
        fileUrl: '', // Será atualizado durante o processamento
        fileName: previewCache.data.fileName,
        title: previewCache.data.fileName,
        fileType: previewCache.data.fileType || 'application/pdf',
        content: previewCache.data.content || '',
        issues: [], // Array vazio inicial
        suggestedClauses: [], // Array vazio inicial
        status: 'analyzing',
        metadata: {
          pageCount: previewCache.data.metadata?.pageCount || 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          originalFileName: previewCache.data.fileName,
          fileSize: previewCache.data.metadata?.fileSize || 0,
        }
      }
    });

    // Log para debug (omitindo dados sensíveis)
    console.log('Created contract:', {
      ...contract,
      content: '[content omitted]'
    });

    // Iniciar processamento em background
    if (previewCache.data.content) {
      const fileBuffer = Buffer.from(previewCache.data.content, 'base64');
      const file = new File([fileBuffer], previewCache.data.fileName, {
        type: previewCache.data.fileType || 'application/pdf'
      });
      
      processContractInBackground(contract.id, file, session.user.id);
    } else {
      console.error('No content found in preview cache');
    }

    // Limpar cache após sucesso
    await supabaseAdmin
      .from('preview_cache')
      .delete()
      .eq('id', tempId);

    return NextResponse.json({
      success: true,
      contractId: contract.id
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to migrate contract',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

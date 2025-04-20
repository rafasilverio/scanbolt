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

export const maxDuration = 60;
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

    // Verificar se já existe um contrato com este tempId
    const existingContract = await prisma.contract.findUnique({
      where: { tempId }
    });

    if (existingContract) {
      // Contrato já existe, vamos apenas associá-lo ao usuário
      const updatedContract = await prisma.contract.update({
        where: { id: existingContract.id },
        data: {
          userId: session.user.id,
          // Não modificamos o status aqui para não interromper o processamento
        }
      });

      console.log('Contract associated with user:', {
        contractId: updatedContract.id,
        userId: session.user.id
      });

      return NextResponse.json({
        success: true,
        contractId: updatedContract.id,
        isExisting: true
      });
    }

    // Se não encontrou contrato, buscar dados do preview cache
    // e criar um novo (mantendo o comportamento original para compatibilidade)
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
        tempId: tempId, // Armazenar o tempId para referência futura
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

    // Iniciar processamento em background com o userId correto
    if (previewCache.data.content) {
      const fileBuffer = Buffer.from(previewCache.data.content, 'base64');
      const file = new File([fileBuffer], previewCache.data.fileName, {
        type: previewCache.data.fileType || 'application/pdf'
      });
      
      await processContractInBackground(contract.id, file, session.user.id);
      console.log('Started background processing for contract:', contract.id);
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
      contractId: contract.id,
      isExisting: false
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

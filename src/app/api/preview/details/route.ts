import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

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

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tempId = searchParams.get('tempId');

    if (!tempId) {
      return NextResponse.json({ error: 'Missing tempId' }, { status: 400 });
    }

    // Buscar contrato pelo tempId
    const contract = await prisma.contract.findUnique({
      where: { tempId }
    });

    if (contract) {
      return NextResponse.json({
        found: true,
        contract: {
          id: contract.id,
          title: contract.title,
          content: contract.content,
          status: contract.status,
          issues: contract.issues,
          suggestedClauses: contract.suggestedClauses
        }
      });
    }

    // Se não encontrou contrato, verificar se existe no preview_cache
    const { data: previewCache, error } = await supabaseAdmin
      .from('preview_cache')
      .select('id, data')
      .eq('id', tempId)
      .single();

    if (error) {
      return NextResponse.json({
        found: false,
        error: 'Preview not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      inPreviewCache: true,
      previewData: previewCache.data
    });
  } catch (error) {
    console.error('Error fetching preview details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview details' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 
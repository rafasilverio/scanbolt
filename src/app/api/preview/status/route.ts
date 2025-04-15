import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma'; // Importar a instância do Prisma compartilhada

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

    try {
      // Buscar contrato pelo tempId
      const contract = await prisma.contract.findUnique({
        where: { tempId }
      });

      if (contract) {
        return NextResponse.json({
          found: true,
          contractId: contract.id,
          status: contract.status
        });
      }
    } catch (dbError) {
      console.error('Database error when fetching contract:', dbError);
      // Continuar para verificar no preview_cache
    }

    // Se não encontrou contrato ou houve erro, verificar se existe no preview_cache
    const { data: previewCache, error } = await supabaseAdmin
      .from('preview_cache')
      .select('id')
      .eq('id', tempId)
      .single();

    if (error) {
      return NextResponse.json({
        found: false,
        error: 'Preview not found'
      });
    }

    return NextResponse.json({
      found: true,
      inPreviewCache: true
    });
  } catch (error) {
    console.error('Error checking preview status:', error);
    return NextResponse.json(
      { error: 'Failed to check preview status' },
      { status: 500 }
    );
  }
} 
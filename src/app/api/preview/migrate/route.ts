import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tempId } = await req.json();
    if (!tempId) {
      return NextResponse.json({ error: 'No tempId provided' }, { status: 400 });
    }

    // Get the REAL preview data from cache using supabaseAdmin
    const { data: previewCache, error: previewError } = await supabaseAdmin
      .from('preview_cache')
      .select('data')
      .eq('id', tempId)
      .single();

    if (previewError || !previewCache) {
      console.error('Preview cache error:', previewError);
      return NextResponse.json(
        { error: 'Preview data not found' },
        { status: 404 }
      );
    }

    const previewData = previewCache.data;

    // Create contract with the REAL data from upload
    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(),
        title: previewData.title || previewData.fileName,
        content: previewData.content,
        fileUrl: previewData.fileUrl || '',
        fileType: previewData.fileType,
        fileName: previewData.fileName,
        status: "under_review",
        highlights: JSON.stringify(previewData.highlights || []),
        changes: JSON.stringify(previewData.changes || []),
        pdfPositions: previewData.pdfPositions || [],
        numPages: previewData.numPages || 1,
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    // Delete preview from cache after successful migration using supabaseAdmin
    const { error: deleteError } = await supabaseAdmin
      .from('preview_cache')
      .delete()
      .eq('id', tempId);

    if (deleteError) {
      console.error('Error deleting preview cache:', deleteError);
    }

    return NextResponse.json({ 
      success: true,
      contract: {
        ...contract,
        highlights: JSON.parse(contract.highlights),
        changes: JSON.parse(contract.changes),
        pdfPositions: Array.isArray(contract.pdfPositions) 
          ? contract.pdfPositions 
          : JSON.parse(contract.pdfPositions || '[]')
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate preview data', details: error },
      { status: 500 }
    );
  }
}
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
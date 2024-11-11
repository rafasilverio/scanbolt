import { NextRequest, NextResponse } from 'next/server';
import PDFParse from 'pdf-parse';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const extractPdfText = async (buffer: ArrayBuffer): Promise<string> => {
  const pdfBuffer = Buffer.from(buffer);
  const pdfData = await PDFParse(pdfBuffer);
  return pdfData.text;
};

const extractTextContent = async (file: Blob): Promise<string> => {
  const buffer = await file.arrayBuffer();
  
  switch (file.type) {
    case 'application/pdf':
      return extractPdfText(buffer);
    case 'text/plain':
      return new TextDecoder().decode(buffer);
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid file provided' 
      }, { status: 400 });
    }

    const text = await extractTextContent(file);
    return NextResponse.json({ 
      success: true, 
      text: text.slice(0, 5000) 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
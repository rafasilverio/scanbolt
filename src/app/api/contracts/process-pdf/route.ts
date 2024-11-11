import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import PDFParser from 'pdf-parse';

export async function POST(req: Request) {
  try {
    console.log(`entrou aqui`);
    const { contractId, fileUrl } = await req.json();

    // Fetch PDF file
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract PDF content
    const pdfData = await PDFParser(buffer);
    console.log('pdfData', pdfData);
    
    // Update contract with PDF content
    await prisma.contract.update({
      where: { id: contractId },
      data: { content: pdfData.text }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

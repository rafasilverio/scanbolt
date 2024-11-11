import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    
    const updatedContract = await prisma.$transaction(async (tx) => {
      return await tx.contract.update({
        where: { id: params.id },
        data: { status }
      });
    });

    return NextResponse.json({ success: true, contract: updatedContract });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
} 
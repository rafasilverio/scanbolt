import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contract = await prisma.contract.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      select: { 
        status: true,
        issues: true,
        suggestedClauses: true
      }
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: contract.status,
      issues: contract.issues,
      suggestedClauses: contract.suggestedClauses,
      isAnalysisComplete: contract.status === 'under_review' && 
                         Array.isArray(contract.issues) && 
                         contract.issues.length > 0
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
} 
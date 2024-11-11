import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simple findUnique without transaction
    const contract = await prisma.contract.findUnique({
      where: {
        id: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to view this contract
    if (contract.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.$disconnect();
    return NextResponse.json(contract);

  } catch (error) {
    console.error('Server error:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    
    // Simple update without transaction
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      },
    });

    await prisma.$disconnect();
    return NextResponse.json({
      success: true,
      contract: updatedContract,
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    await prisma.$disconnect();
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

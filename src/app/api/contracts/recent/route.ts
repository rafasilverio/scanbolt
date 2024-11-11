import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const contracts = await prisma.contract.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 3, // Get only the last 3 contracts
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      contracts
    });

  } catch (error) {
    console.error('Error fetching recent contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent contracts' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contracts = await prisma.$transaction(async (tx) => {
      return await tx.contract.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching recent contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent contracts' },
      { status: 500 }
    );
  }
}

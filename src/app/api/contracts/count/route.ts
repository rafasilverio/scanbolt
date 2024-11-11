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

    const count = await prisma.$transaction(async (tx) => {
      return await tx.contract.count({
        where: {
          userId: session.user.id
        }
      });
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching contract count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract count' },
      { status: 500 }
    );
  }
}

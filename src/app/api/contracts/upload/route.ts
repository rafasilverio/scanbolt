import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const content = await file.text();

    // Create contract with proper typing based on Contract interface
    const contract = await prisma.contract.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        content,
        userId: session.user.id,
        status: 'under_review',
        highlights: [],
        changes: [],
      },
    });

    // After successful creation, redirect to the contract page
    return NextResponse.json({ 
      success: true, 
      contractId: contract.id,
      redirect: `/contracts/${contract.id}` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

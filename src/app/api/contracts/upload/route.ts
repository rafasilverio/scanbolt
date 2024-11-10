import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No email in session' },
        { status: 401 }
      );
    }

    console.log('Session email:', session.user.email); // Debug log

    // Find the user first
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    console.log('Found user:', user); // Debug log

    if (!user) {
      // More detailed error
      return NextResponse.json(
        { 
          error: 'User not found',
          email: session.user.email,
          sessionInfo: session.user 
        },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    // Create contract record with user connection
    const contract = await prisma.contract.create({
      data: {
        id: crypto.randomUUID(), // Generate a proper UUID
        title: file.name,
        fileUrl: publicUrl,
        fileName: fileName,
        status: "under_review",
        fileType: file.type,
        content: file.name,
        userId: user.id // Use the user's UUID directly
      }
    });

    return NextResponse.json({ 
      success: true, 
      contract
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Criar cliente Supabase com service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: Request) {
  try {
    const { email, password, selectedPlan } = await req.json();

    // Check if user exists usando supabaseAdmin
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Convert plan to uppercase for enum
    const role = selectedPlan?.toUpperCase() || 'FREE';
    const initialContracts = role === 'FREE' ? 3 : -1;

    // Create user with UUID usando supabaseAdmin
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name: email.split('@')[0],
        role: role,
        contracts_remaining: initialContracts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        provider: 'credentials'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

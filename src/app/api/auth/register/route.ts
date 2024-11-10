import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, selectedPlan } = await req.json();

    // Check if user exists
    const { data: existingUser } = await supabase
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
    const role = selectedPlan.toUpperCase() as 'FREE' | 'PRO';
    const initialContracts = role === 'FREE' ? 3 : -1;

    // Create user with UUID
    const { data: newUser, error } = await supabase
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
        { error: 'Failed to create user' },
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

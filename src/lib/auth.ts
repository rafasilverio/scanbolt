import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./supabase";
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Check user in Supabase
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (!user) {
          throw new Error("User not found");
        }

        // Verify password
        const validPassword = await bcryptjs.compare(credentials.password, user.password);
        if (!validPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          contracts_remaining: user.contracts_remaining
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if Google user exists in Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          // Create new user for Google sign-in
          const { error } = await supabase.from('users').insert({
            email: user.email,
            name: user.name,
            role: 'free',
            contracts_remaining: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          if (error) return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        // Get user data from Supabase
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.contracts_remaining = user.contracts_remaining;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
}; 
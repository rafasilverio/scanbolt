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
          throw new Error("Missing credentials");
        }

        try {
          // Check user in Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (error || !user) {
            console.log('User not found:', error); // Debug log
            throw new Error("User not found");
          }

          // Verify password
          const validPassword = await bcryptjs.compare(credentials.password, user.password);
          if (!validPassword) {
            console.log('Invalid password'); // Debug log
            throw new Error("Invalid password");
          }

          console.log('User authenticated:', { 
            id: user.id, 
            email: user.email,
            role: user.role 
          }); // Debug log

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            contracts_remaining: user.contracts_remaining
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - user:', user); // Debug log
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.contracts_remaining = user.contracts_remaining;
      }
      console.log('JWT callback - token:', token); // Debug log
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - token:', token); // Debug log
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.contracts_remaining = token.contracts_remaining as number;
      }
      console.log('Session callback - session:', session); // Debug log
      return session;
    }
  },
  debug: true, // Enable debug mode
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
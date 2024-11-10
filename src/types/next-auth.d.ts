import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: Role;
    contracts_remaining: number;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role: Role;
      contracts_remaining: number;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    contractsRemaining: number;
  }
}

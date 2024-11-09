import 'next-auth';
import { UserRole } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      contractsRemaining: number;
    }
  }

  interface User {
    role: UserRole;
    contractsRemaining: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    contractsRemaining: number;
  }
}

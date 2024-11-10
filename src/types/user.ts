export type UserRole = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  contractsRemaining: number;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
  contracts?: Contract[];
}

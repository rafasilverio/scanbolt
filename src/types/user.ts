export type UserRole = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  contractsRemaining: number; // For free tier limits
}

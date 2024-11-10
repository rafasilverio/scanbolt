import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContractsList } from '@/components/contracts/ContractsList';
import { redirect } from 'next/navigation';

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // First find the user by email
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  // Then use the user's ID to find contracts
  const contracts = await prisma.contract.findMany({
    where: {
      userId: user.id  // This will be the correct UUID format
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Contracts</h1>
      <ContractsList contracts={contracts} />
    </div>
  );
} 
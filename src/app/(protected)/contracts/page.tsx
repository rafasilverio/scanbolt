import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import  prisma  from '@/lib/prisma';
import { ContractsList } from '@/components/contracts/ContractsList';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { user, contracts } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    const contracts = await tx.contract.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { user, contracts };
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Contracts</h1>
        <Link href="/contracts/upload">
          <Button className="bg-[#5000f7] hover:bg-[#2563EB] text-white">
            <Upload className="mr-2 h-4 w-4" />
            Upload Contract
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Contracts</h3>
          <p className="text-2xl font-semibold mt-1">{contracts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Under Review</h3>
          <p className="text-2xl font-semibold mt-1">
            {contracts.filter(c => c.status === 'under_review').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="text-2xl font-semibold mt-1">
            {contracts.filter(c => c.status === 'approved').length}
          </p>
        </div>
      </div>

      <ContractsList contracts={contracts} />
    </div>
  );
} 
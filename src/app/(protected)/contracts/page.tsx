import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ContractsList } from '@/components/contracts/ContractsList';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Contract } from '@prisma/client';

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const { user, contracts } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email: session.user.email }
    });

    const contracts = await tx.contract.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: 'desc' }
    });

    return { user, contracts };
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Contracts</h1>
            <p className="text-white/70">Manage and analyze your legal documents in one place</p>
          </div>
          <Link href="/contracts/upload">
            <Button className="bg-white text-indigo-950 hover:bg-white/90">
              <Upload className="mr-2 h-4 w-4" />
              Upload Contract
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {contracts.filter(c => c.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <ContractsList contracts={contracts} />
      </div>
    </div>
  );
} 
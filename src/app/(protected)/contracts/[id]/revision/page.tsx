"use client";

import { useContractStore } from '@/lib/store/contract-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ContractRevision } from '@/components/contracts/ContractRevision';

export default function RevisionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const hasGeneratedRevision = useContractStore(state => state.hasGeneratedRevision);
  const contract = useContractStore(state => state.contract);

  useEffect(() => {
    if (!hasGeneratedRevision) {
      router.replace(`/contracts/${params.id}`);
    }
  }, [hasGeneratedRevision, router, params.id]);

  if (!hasGeneratedRevision) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <ContractRevision contract={contract} />
    </div>
  );
}

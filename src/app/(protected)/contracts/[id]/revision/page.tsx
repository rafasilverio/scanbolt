"use client";

import { useRouter } from 'next/navigation';
import { useContractStore } from '@/lib/store/contract-store';
import { useEffect } from 'react';
import ContractRevision from '@/components/contracts/ContractRevision';

export default function ContractRevisionPage() {
  const router = useRouter();
  const { contract, setContract, generateRevision } = useContractStore();

  useEffect(() => {
    const fetchAndGenerateRevision = async () => {
      try {
        await generateRevision();
      } catch (error) {
        console.error('Error generating revision:', error);
      }
    };

    if (contract) {
      fetchAndGenerateRevision();
    }
  }, [contract, generateRevision]);

  if (!contract) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <ContractRevision contract={contract} />
    </div>
  );
}

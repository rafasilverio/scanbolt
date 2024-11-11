"use client";

import { useRouter } from 'next/navigation';
import { useContractStore } from '@/lib/store/contract-store';
import { useEffect, useRef } from 'react';
import ContractRevision from '@/components/contracts/ContractRevision';

export default function ContractRevisionPage() {
  const router = useRouter();
  const { contract, setContract, generateRevision } = useContractStore();
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    const fetchAndGenerateRevision = async () => {
      try {
        if (!hasGeneratedRef.current) {
          await generateRevision();
          hasGeneratedRef.current = true;
        }
      } catch (error) {
        console.error('Error generating revision:', error);
      }
    };

    if (contract && !hasGeneratedRef.current) {
      fetchAndGenerateRevision();
    }

    // Cleanup function
    return () => {
      hasGeneratedRef.current = false;
    };
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

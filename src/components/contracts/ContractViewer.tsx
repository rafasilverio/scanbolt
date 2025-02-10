'use client';

import { useEffect } from 'react';
import { Contract, ContractIssue } from '@/types/contract';
import { useRouter } from 'next/navigation';
import { DocumentWrapper } from "./DocumentWrapper";
import { NewContractContent } from "./NewContractContent";
import { useContractStore } from '@/lib/store/contract-store';

interface ContractViewerProps {
  contract: Contract;
  onGenerateRevision: () => void;
  isGenerating: boolean;
}

export default function ContractViewer({ 
  contract: initialContract, 
  onGenerateRevision, 
  isGenerating: externalIsGenerating 
}: ContractViewerProps) {
  const router = useRouter();
  const { 
    contract: storeContract, 
    setContract, 
  } = useContractStore();

  // Initialize store with initial contract data
  useEffect(() => {
    if (initialContract) {
      try {
        setContract(initialContract);
      } catch (error) {
        console.error('Error processing contract data:', error);
      }
    }
  }, [initialContract, setContract]);

  // Add polling for contract updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollForUpdates = async () => {
      if (storeContract?.status === 'under_review') {
        try {
          const response = await fetch(`/api/contracts/${storeContract.id}`);
          const data = await response.json();
          
          if (data.contract) {
            setContract(data.contract);

            if (data.contract.status === 'approved') {
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('Error polling for updates:', error);
          clearInterval(pollInterval);
        }
      }
    };

    if (storeContract?.status === 'under_review') {
      pollInterval = setInterval(pollForUpdates, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [storeContract?.status, storeContract?.id, setContract]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <DocumentWrapper contract={storeContract || undefined}>
            <NewContractContent
              contract={storeContract || undefined} selectedIssue={null} onIssueClick={function (issue: ContractIssue): void {
                throw new Error('Function not implemented.');
              } } isFirstIssue={false} onUpgrade={function (): void {
                throw new Error('Function not implemented.');
              } } onNext={function (): void {
                throw new Error('Function not implemented.');
              } } onClose={function (): void {
                throw new Error('Function not implemented.');
              } }            />
          </DocumentWrapper>
        </div>
      </div>
    </div>
  );
}
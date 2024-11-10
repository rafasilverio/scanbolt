"use client";

import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ContractViewer from "@/components/contracts/ContractViewer";
import ContractRevision from "@/components/contracts/ContractRevision";
import { useParams } from 'next/navigation';
import { mockContract } from "@/lib/mock-data";
import { Contract } from '@prisma/client';

export default function ContractPage() {
  const params = useParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        const data = await response.json();
        setContract(data.contract);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!contract) {
    return <div>Contract not found</div>;
  }

  return (
    <div className="h-full">
      <Tabs.Root defaultValue="review" className="h-full">
        <div className="border-b px-4">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger 
              value="review"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Review
            </Tabs.Trigger>
            {/* <Tabs.Trigger 
              value="revision"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Revision
            </Tabs.Trigger> */}
          </Tabs.List>
        </div>
        
        <Tabs.Content value="review" className="h-[calc(100%-48px)]">
          <ContractViewer contract={mockContract} />
        </Tabs.Content>
        
        {/* <Tabs.Content value="revision" className="h-[calc(100%-48px)]">
          <ContractRevision contract={mockContract} />
        </Tabs.Content> */}
      </Tabs.Root>
    </div>
  );
}

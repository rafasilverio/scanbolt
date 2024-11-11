"use client";

import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ContractViewer from "@/components/contracts/ContractViewer";
import { useParams, useRouter } from 'next/navigation';
import { Contract } from '@/types/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch contract');
        }

        const transformedContract: Contract = {
          id: data.id,
          title: data.title,
          content: data.content,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          highlights: typeof data.highlights === 'string' 
            ? JSON.parse(data.highlights) 
            : data.highlights || [],
          changes: typeof data.changes === 'string' 
            ? JSON.parse(data.changes) 
            : data.changes || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          status: data.status,
        };

        setContract(transformedContract);
      } catch (error) {
        console.error('Error in fetchContract:', error);
        setError(error instanceof Error ? error.message : 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && session?.user) {
      fetchContract();
    }
  }, [params.id, session?.user, status]);

  const handleGenerateRevision = async () => {
    console.log('handleGenerateRevision called');
    
    if (!contract) {
      console.log('No contract available');
      return;
    }
    
    setIsGenerating(true);
    try {
      const acceptedChanges = contract.changes.filter(change => change.status === 'accepted');
      console.log('Accepted changes:', acceptedChanges);

      const response = await fetch(`/api/contracts/${contract.id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: contract.content,
          changes: acceptedChanges,
          highlights: contract.highlights
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate revision');
      }

      const data = await response.json();
      console.log('Revision generated:', data);
      
      const statusResponse = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
        }),
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update contract status');
      }

      toast.success('Contract revision generated successfully');
      router.push(`/contracts/${contract.id}/revision`);
    } catch (error) {
      console.error('Error generating revision:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate revision');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Contract</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return <div className="p-6">Contract not found</div>;
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
            <Tabs.Trigger 
              value="document"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Original Document
            </Tabs.Trigger>
          </Tabs.List>
        </div>
        
        <Tabs.Content value="review" className="h-[calc(100%-48px)]">
          <ContractViewer 
            contract={contract} 
            onGenerateRevision={handleGenerateRevision}
            isGenerating={isGenerating}
          />
        </Tabs.Content>

        <Tabs.Content value="document" className="h-[calc(100%-48px)] p-4">
          {contract.fileType === 'application/pdf' ? (
            <iframe
              src={contract.fileUrl}
              className="w-full h-full rounded-lg border"
              title={contract.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <a 
                href={contract.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Download Original Document
              </a>
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Contract } from '@/types/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewSummary } from '@/components/contracts/ReviewSummary';
import { useHighlights } from '@/lib/hooks/useHighlights';
import { NewContractContent } from '@/components/contracts/NewContractContent';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [zoom, setZoom] = useState(100);

  const {
    selectedHighlight,
    onHighlightClick,
    onNextHighlight,
    onCloseHighlight
  } = useHighlights(contract?.issues || []);

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
          userId: data.userId,
          content: data.content,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          issues: typeof data.issues === 'string'
            ? JSON.parse(data.issues)
            : data.issues || [],
          suggestedClauses: typeof data.suggestedClauses === 'string'
            ? JSON.parse(data.suggestedClauses)
            : data.suggestedClauses || [],
          status: data.status,
          metadata: data.metadata || { pageCount: data.numPages || 1, createdAt: new Date(), updatedAt: new Date() },
          fileName: data.fileName
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
      const acceptedChanges = contract.issues.filter((issue) => issue.status === 'accepted');
      console.log('Accepted changes:', acceptedChanges);

      const response = await fetch(`/api/contracts/${contract.id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: contract.content,
          changes: acceptedChanges,
          highlights: contract.issues
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

  const handleStartReview = () => {
    setShowReview(true);
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
    <div className="flex flex-col h-screen">
      <div className="flex-none w-full bg-gradient-to-b from-[#5000f7] to-[#2563EB] px-6 py-12 relative rounded-t-3xl">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            <h1 className="text-white text-3xl font-bold tracking-tight mb-4">
              AI Contract Analysis Report
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Our AI has analyzed your contract and identified potential risks and opportunities for improvement
            </p>
          </div>
          
            <ReviewSummary 
              contract={contract}
              onStartReview={handleStartReview}
              showReview={showReview}
            />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#2563EB]/50 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <NewContractContent
          contract={contract}
          selectedIssue={selectedHighlight}
          onIssueClick={onHighlightClick}
          isFirstIssue={contract?.status === 'under_review'}
          onUpgrade={handleGenerateRevision}
          onNext={onNextHighlight}
          onClose={onCloseHighlight}
        />
      </div>
    </div>
  );
}

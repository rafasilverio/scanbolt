"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Contract, ContractIssue } from '@/types/contract';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewSummary } from '@/components/contracts/ReviewSummary';
import { NewContractContent } from '@/components/contracts/NewContractContent';
import { CheckCircle } from 'lucide-react';
import ContractProcessingMonitor from '@/components/contracts/ContractProcessingMonitor';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReview, setShowReview] = useState(false);

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
    if (!contract) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: contract.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate revision');
      }

      const data = await response.json();
      
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
      <ContractProcessingMonitor initialStatus={contract?.status} />

      <div className="flex-none w-full px-4 py-4 relative">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl bg-gradient-to-b from-indigo-950/80 to-gray-900/90">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-green-400/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-green-400 text-sm font-medium">Contract Secured</h2>
                <h1 className="text-white text-2xl sm:text-3xl font-bold">
                  Welcome to Peace of Mind
                </h1>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-blue-50 text-lg leading-relaxed">
                Your contract has been thoroughly analyzed by our advanced AI. We've taken care of identifying and addressing all potential concerns, so you can move forward with confidence.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  <div className="text-blue-200 mb-2">Comprehensive Analysis</div>
                  <div className="text-white/90 text-sm">Every detail reviewed with precision</div>
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  <div className="text-blue-200 mb-2">Risk Assessment</div>
                  <div className="text-white/90 text-sm">Potential issues identified & resolved</div>
                </div>
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/10">
                  <div className="text-blue-200 mb-2">Smart Suggestions</div>
                  <div className="text-white/90 text-sm">AI-powered improvements ready</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* <ReviewSummary 
            contract={contract}
            onStartReview={handleStartReview}
            showReview={showReview}
          />  */}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t to-transparent pointer-events-none"></div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <NewContractContent
          contract={contract}
          isFirstIssue={contract?.status === 'under_review'}
          onUpgrade={handleGenerateRevision}
          selectedIssue={null}
          onIssueClick={() => {}}
          onNext={() => {}}
          onClose={() => {}}
        />
      </div>
    </div>
  );
}

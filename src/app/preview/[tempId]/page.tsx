"use client";

import { useState, useEffect } from 'react';
import { Contract, ContractIssue } from '@/types/contract';
import { useRouter } from 'next/navigation';
import { DocumentWrapper } from '@/components/contracts/DocumentWrapper';
import { NewContractContent } from '@/components/contracts/NewContractContent';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PreviewRegisterDialog } from '@/components/auth/PreviewRegisterDialog';
import { BlurredPreview } from '@/components/preview/BlurredPreview';

export default function PreviewPage({ params }: { params: { tempId: string } }) {
  const [previewData, setPreviewData] = useState<Contract | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const response = await fetch(`/api/preview/${params.tempId}`);
        if (!response.ok) {
          router.push('/');
          return;
        }
        const data = await response.json();
        setPreviewData(data);
      } catch (error) {
        console.error('Error fetching preview:', error);
        router.push('/');
      }
    };

    fetchPreviewData();
  }, [params.tempId]);

  const handleViewFullAnalysis = () => {
    setShowRegisterDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#5000f7]">
      {/* Header */}
      <header className="bg-[#5000f7] text-white border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <div className="flex items-center mr-8">
              <span className="text-xl font-bold">
                Scancontract
              </span>
            </div>

            <div className="ml-auto">
              <button 
                onClick={handleViewFullAnalysis}
                className="flex items-center text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors"
              >
                View Full Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Critical Issues Alert - Mais compacto e centralizado */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-100 font-semibold text-lg mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <span className="tracking-tight">Critical Issues Detected</span>
            </div>
            <div className="space-y-3 text-sm text-red-100">
              <p className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="font-medium">
                  Your contract has {DEFAULT_PREVIEW_STATS.critical.count} critical issues that need immediate attention
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span className="font-medium">{DEFAULT_PREVIEW_STATS.critical.message}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
          <DocumentWrapper contract={previewData ?? undefined}>
            <NewContractContent
              contract={previewData ?? undefined}
              isFirstIssue={false}
              onUpgrade={() => {}}
              onNext={() => {}}
              onClose={() => {}}
              selectedIssue={null}
              onIssueClick={() => {}}
            />
            <BlurredPreview 
              tempId={params.tempId}
              onViewFullAnalysis={handleViewFullAnalysis}
              contract={previewData}
            />
          </DocumentWrapper>
        </div>
      </div>

      <PreviewRegisterDialog 
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        tempId={params.tempId}
      />
    </div>
  );
}
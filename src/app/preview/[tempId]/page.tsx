"use client";

import { useState, useEffect } from 'react';
import { Contract } from '@/types/contract';
import { useRouter } from 'next/navigation';
import { DocumentWrapper } from '@/components/contracts/DocumentWrapper';
import { ContractContent } from '@/components/contracts/ContractContent';
import { DocumentToolbar } from '@/components/contracts/DocumentToolbar';
import { AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';
import { DEFAULT_PREVIEW_STATS } from '@/types/preview';
import { PreviewRegisterDialog } from '@/components/auth/PreviewRegisterDialog';
import { BlurredPreview } from '@/components/preview/BlurredPreview';

export default function PreviewPage({ params }: { params: { tempId: string } }) {
  const [previewData, setPreviewData] = useState<Contract | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const router = useRouter();
  const [zoom, setZoom] = useState(110);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const response = await fetch(`/api/preview/${params.tempId}`);
        if (!response.ok) {
          router.push('/'); // Redireciona para home se preview não existir
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
    <div className="h-screen flex flex-col bg-gradient-to-b from-red-900/40 to-red-800/40">
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

      {/* Review Summary Alert */}
      <div>
        <div className="p-6 bg-gradient-to-r from-[#5000f7] via-[#2563EB] to-[#3b81d7]">
          <div className="bg-gradient-to-r from-red-900 to-red-800 backdrop-blur-md rounded-lg p-6 border border-red-700/50 hover:bg-opacity-95 transition-all duration-200">
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
      <div className="flex-1 flex">
        <div className="flex-1">
          <DocumentWrapper contract={previewData}>
            <ContractContent
              contract={previewData}
              highlights={[]}
              onHighlightClick={() => {}}
              selectedHighlight={null}
              selectedChange={null}
              onChangeSelect={() => {}}
            />
            <BlurredPreview 
              tempId={params.tempId}
              onViewFullAnalysis={handleViewFullAnalysis}
              contract={previewData}
            />
          </DocumentWrapper>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-white overflow-y-auto relative">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-red-500" />
                <span className="text-red-500 font-medium">
                  {DEFAULT_PREVIEW_STATS.critical.count} Critical Issues
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-500" />
                <span className="text-yellow-500 font-medium">
                  {DEFAULT_PREVIEW_STATS.warning.count} Warnings
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="text-green-500" />
                <span className="text-green-500 font-medium">
                  {DEFAULT_PREVIEW_STATS.improvement.count} Suggestions
                </span>
              </div>
            </div>
            {/* Blur Overlay for Sidebar */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
          </div>
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
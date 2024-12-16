"use client";

import { useState } from 'react';
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
  const [zoom, setZoom] = useState(110);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const router = useRouter();

  // Dados mockados para preview com highlights baseados no DEFAULT_PREVIEW_STATS
  const previewContract: Contract = {
    id: params.tempId,
    title: 'Software Development Agreement',
    content: `This Software Development Agreement (the "Agreement") is made and entered into on [DATE], by and between:

[CLIENT NAME], organized and existing under the laws of [JURISDICTION], with its principal place of business at [ADDRESS] (hereinafter referred to as the "Client")

and

[DEVELOPER NAME], a software development company organized and existing under the laws of [ADDRESS] (hereinafter referred to as the "Developer")

1. SCOPE OF WORK

1.1 The Developer agrees to design, develop, and deliver a software application (the "Software") according to the specifications provided in Appendix A.

1.2 The Software shall include the following features and functionalities: [LIST OF FEATURES]

2. TIMELINE AND DELIVERABLES`,
    status: 'under_review',
    fileName: 'contract.pdf',
    fileType: 'application/pdf',
    highlights: [
      ...Array(DEFAULT_PREVIEW_STATS.critical.count).fill({ type: 'critical' }),
      ...Array(DEFAULT_PREVIEW_STATS.warning.count).fill({ type: 'warning' }),
      ...Array(DEFAULT_PREVIEW_STATS.improvement.count).fill({ type: 'improvement' })
    ],
    changes: []
  };

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
        {/* Document Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-gray-50 relative">
              <div 
                className="container max-w-4xl mx-auto py-4"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <DocumentWrapper contract={previewContract}>
                  <div className="relative">
                    <ContractContent
                      contract={previewContract}
                      highlights={[]}
                      onHighlightClick={() => {}}
                      selectedHighlight={null}
                      selectedChange={null}
                      onChangeSelect={() => {}}
                    />
                    <BlurredPreview 
                      tempId={params.tempId}
                      onViewFullAnalysis={handleViewFullAnalysis}
                      contract={previewContract}
                    />
                  </div>
                </DocumentWrapper>
              </div>
            </div>
            <DocumentToolbar
              zoom={zoom}
              onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
              onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
              onZoomReset={() => setZoom(100)}
            />
          </div>
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

      {/* Registration Dialog */}
      <PreviewRegisterDialog 
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
        tempId={params.tempId}
      />
    </div>
  );
}
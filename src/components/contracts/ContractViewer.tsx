'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Contract, Highlight, HighlightType, AIChange } from '@/types/contract';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { Diff } from '@/components/contracts/Diff';
import { AIChangeBadge } from '@/components/contracts/AIChangeBadge';
import { motion, AnimatePresence } from 'framer-motion';
import StatsHeader from '@/components/contracts/StatsHeader';
import { DocumentWrapper } from "./DocumentWrapper";
import { ContractContent } from "./ContractContent";
import { DocumentToolbar } from "./DocumentToolbar";
import { InlineComment } from "./InlineComment";
import { cn } from "@/lib/utils";
import { useContractStore } from '@/lib/store/contract-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContractViewerProps {
  contract: Contract;
  onGenerateRevision: () => void;
  isGenerating: boolean;
  onAddComment?: (highlightId: string, content: string) => void;
}

export default function ContractViewer({ 
  contract: initialContract, 
  onGenerateRevision, 
  isGenerating: externalIsGenerating 
}: ContractViewerProps) {
  const router = useRouter();
  const [selectedChange, setSelectedChange] = useState<AIChange | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<HighlightType | null>(null);
  const [zoom, setZoom] = useState(100);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { 
    contract: storeContract, 
    setContract, 
    generateRevision,
    isGenerating: storeIsGenerating
  } = useContractStore();

  // Use this single source of truth for generating state
  const isGenerating = storeContract?.status === 'generating';
  const showGenerateButton = storeContract?.status === 'under_review' && !isGenerating;
  const showViewRevisionButton = storeContract?.status === 'approved';

  const handleIssueClick = (type: HighlightType) => {
    setSelectedIssueType(type === selectedIssueType ? null : type);
  };

  useEffect(() => {
    if (storeContract) {
      console.log('Contract Data:', {
        highlights: storeContract.highlights,
        parsed: typeof storeContract.highlights === 'string' 
          ? JSON.parse(storeContract.highlights) 
          : storeContract.highlights
      });
    }
  }, [storeContract]);

  // Initialize store with initial contract data
  useEffect(() => {
    if (initialContract) {
      const parsedContract = {
        ...initialContract,
        highlights: Array.isArray(initialContract.highlights) 
          ? initialContract.highlights 
          : typeof initialContract.highlights === 'string'
            ? JSON.parse(initialContract.highlights)
            : [],
        changes: Array.isArray(initialContract.changes)
          ? initialContract.changes
          : typeof initialContract.changes === 'string'
            ? JSON.parse(initialContract.changes)
            : []
      };
      setContract(parsedContract);
    }
  }, [initialContract, setContract]);

  const isUnderReview = storeContract?.status === 'under_review';
  const isApproved = storeContract?.status === 'approved';

  const handleViewRevision = () => {
    router.push(`/contracts/${storeContract.id}/revision`);
  };

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    
    const element = document.getElementById(`highlight-${highlight.id}`);
    if (element && contentRef.current) {
      const container = contentRef.current;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      container.scrollTo({
        top: element.offsetTop - containerRect.height / 2 + elementRect.height / 2,
        behavior: 'smooth'
      });

      // Flash effect
      element.classList.add('flash-highlight');
      setTimeout(() => element.classList.remove('flash-highlight'), 1000);
    }
  };

  // Check if there are any changes at all
  const hasChanges = storeContract?.changes && storeContract.changes.length > 0;
  
  // Add polling for contract updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const pollForUpdates = async () => {
      if (storeContract?.status === 'under_review') {
        try {
          const response = await fetch(`/api/contracts/${storeContract.id}`);
          const data = await response.json();
          
          if (data.contract) {
            // Update store with new contract data
            setContract({
              ...data.contract,
              highlights: Array.isArray(data.contract.highlights) 
                ? data.contract.highlights 
                : JSON.parse(data.contract.highlights || '[]'),
              changes: Array.isArray(data.contract.changes)
                ? data.contract.changes
                : JSON.parse(data.contract.changes || '[]')
            });

            // Stop polling if contract is approved
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
      pollInterval = setInterval(pollForUpdates, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [storeContract?.status, storeContract?.id, setContract]);

  const handleGenerateRevision = async () => {
    try {
      setContract({ ...storeContract, status: 'generating' });

      const response = await fetch(`/api/contracts/${storeContract.id}/revision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalContent: storeContract.content,
          changes: storeContract.changes,
          highlights: storeContract.highlights,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.contract) {
        setContract({
          ...data.contract,
          highlights: Array.isArray(data.contract.highlights)
            ? data.contract.highlights
            : JSON.parse(data.contract.highlights || '[]'),
          changes: Array.isArray(data.contract.changes)
            ? data.contract.changes
            : JSON.parse(data.contract.changes || '[]')
        });

        router.push(`/contracts/${storeContract.id}/revision`);
      }
    } catch (error) {
      console.error('Error generating revision:', error);
      // Reset status on error
      setContract({ ...storeContract, status: 'under_review' });
    }
  };

  // Add this function to filter highlights based on selected type
  const filteredHighlights = useMemo(() => {
    if (!storeContract?.highlights || !selectedIssueType) {
      return storeContract?.highlights || [];
    }

    return storeContract.highlights.filter(
      highlight => highlight.type === selectedIssueType
    );
  }, [storeContract?.highlights, selectedIssueType]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <StatsHeader 
          contract={storeContract}
          onIssueClick={handleIssueClick}
          selectedIssueType={selectedIssueType}
        />

        <div className="ml-6 flex-shrink-0">
          {isGenerating ? (
            <Button 
              disabled
              className="bg-[#BFDBFE] text-[#94A3B8] transition-colors"
              size="default"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Revision...
            </Button>
          ) : showGenerateButton ? (
            <Button 
              onClick={handleGenerateRevision}
              className="bg-[#5000f7] hover:bg-[#2563EB] text-white transition-colors"
              size="default"
            >
              Generate Full Contract
            </Button>
          ) : showViewRevisionButton ? (
            <Button 
              onClick={handleViewRevision}
              className="bg-[#2563EB] hover:bg-[#5000f7] text-white transition-colors"
              size="default"
            >
              View Revised Contract
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-16rem)] overflow-hidden">
        {/* Left Analysis Panel */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedIssueType 
                  ? `${selectedIssueType.charAt(0).toUpperCase() + selectedIssueType.slice(1)} Issues`
                  : "Document Analysis"
                }
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredHighlights.length} issues found
              </span>
            </div>

            {/* Filter Reset */}
            {selectedIssueType && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-white"
                onClick={() => setSelectedIssueType(null)}
              >
                Clear Filter
              </Button>
            )}

            {/* Highlights List - Update to use filteredHighlights */}
            <AnimatePresence mode="wait">
              {filteredHighlights.map((highlight) => (
                <motion.button
                  key={highlight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => handleHighlightClick(highlight)}
                  className={cn(
                    "w-full text-left bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-all",
                    selectedHighlight?.id === highlight.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      highlight.type === 'critical' && "bg-red-500",
                      highlight.type === 'warning' && "bg-yellow-500",
                      highlight.type === 'improvement' && "bg-green-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">{highlight.message}</p>
                      {highlight.suggestion && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {highlight.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Document Area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50">
          <div 
            className="container max-w-4xl mx-auto py-8"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <DocumentWrapper contract={storeContract}>
              <ContractContent
                contract={storeContract}
                selectedHighlight={selectedHighlight}
                selectedChange={selectedChange}
                onChangeSelect={setSelectedChange}
              />
            </DocumentWrapper>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Toolbar */}
      <DocumentToolbar
        zoom={zoom}
        onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
        onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
        onZoomReset={() => setZoom(100)}
      />

      {/* Floating Comments */}
      <AnimatePresence>
        {selectedChange && (
          <InlineComment
            change={selectedChange}
            onClose={() => setSelectedChange(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

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
  X,
  ArrowRight,
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
import { toast } from "sonner";

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
  const [zoom, setZoom] = useState(110);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { 
    contract: storeContract, 
    setContract, 
    generateRevision,
    isGenerating: storeIsGenerating
  } = useContractStore();

  // Use this single source of truth for generating state
  const isGenerating = storeContract?.status === 'generating';
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
    if (!storeContract) return;
    router.push(`/contracts/${storeContract.id}/revision`);
  };

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    
    const relatedChange = storeContract?.changes?.find(
      change => change.startIndex === highlight.startIndex && 
                change.endIndex === highlight.endIndex
    );

    if (relatedChange) {
      setSelectedChange(relatedChange);
      
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
    } else {
      // Feedback visual quando não há change associado
      toast.info("No suggested changes available for this highlight", {
        description: "This is an informational highlight only."
      });
    }
  };

  const handleNext = () => {
    if (!storeContract?.changes || !selectedChange) return;
    
    // Find current index
    const currentIndex = storeContract.changes.findIndex(
      change => change.id === selectedChange.id
    );
    
    // Get next change (or wrap around to first)
    const nextIndex = (currentIndex + 1) % storeContract.changes.length;
    const nextChange = storeContract.changes[nextIndex];
    
    // Find corresponding highlight
    const nextHighlight = storeContract.highlights.find(
      h => h.startIndex === nextChange.startIndex && h.endIndex === nextChange.endIndex
    );
    
    if (nextHighlight) {
      handleHighlightClick(nextHighlight);
    }
    
    setSelectedChange(nextChange);
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
      if (!storeContract) return;
      
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
      setContract({ ...storeContract!, status: 'under_review' });
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

  const getPageCount = (content?: string): number => {
    if (!content) return 0;
    return Math.max(1, Math.ceil((content.length) / 3000));
  };

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* <div className="flex items-center justify-end p-4 border-b">
          <div className="flex-shrink-0">
            {isGenerating ? (
              <Button 
                disabled
                className="bg-[#BFDBFE] text-[#94A3B8] transition-colors"
                size="default"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Revision...
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
        </div>*/}

        <div className="flex-1 h-[calc(100vh-16rem)] overflow-hidden">
          <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50">
            <div 
              className="container max-w-4xl mx-auto py-4"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <DocumentWrapper contract={storeContract || undefined}>
                <div className="relative">
                  <ContractContent
                    contract={storeContract || undefined}
                    selectedHighlight={selectedHighlight}
                    selectedChange={selectedChange}
                    onChangeSelect={setSelectedChange}
                    highlights={filteredHighlights}
                    onHighlightClick={handleHighlightClick}
                  />
                  <AnimatePresence>
                    {selectedChange && (
                      <InlineComment
                        change={selectedChange}
                        onClose={() => setSelectedChange(null)}
                        onNext={handleNext}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </DocumentWrapper>
            </div>
          </div>
        </div>

        <DocumentToolbar
          zoom={zoom}
          onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
          onZoomReset={() => setZoom(100)}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l bg-white overflow-y-auto">
        <div className="p-4">
          <StatsHeader 
            contract={{
              ...storeContract,
              pageCount: getPageCount(storeContract?.content)
            }}
            onIssueClick={handleIssueClick}
            selectedIssueType={selectedIssueType}
          />
        </div>
      </div>
    </div>
  );
}

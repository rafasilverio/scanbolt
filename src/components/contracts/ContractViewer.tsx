'use client';

import { useState, useRef } from 'react';
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
} from 'lucide-react';
import { Diff } from '@/components/contracts/Diff';
import { AIChangeBadge } from '@/components/contracts/AIChangeBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { StatsHeader } from "./StatsHeader";
import { DocumentWrapper } from "./DocumentWrapper";
import { ContractContent } from "./ContractContent";
import { DocumentToolbar } from "./DocumentToolbar";
import { InlineComment } from "./InlineComment";
import { cn } from "@/lib/utils";
import { useContractStore } from '@/lib/store/contract-store';

interface ContractViewerProps {
    onAddComment?: (highlightId: string, content: string) => void;
  }

  export default function ContractViewer({ onAddComment }: ContractViewerProps) {
  const contract = useContractStore(state => state.contract);
  const router = useRouter();
  const [selectedChange, setSelectedChange] = useState<AIChange | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [zoom, setZoom] = useState(100);
  const [selectedIssueType, setSelectedIssueType] = useState<HighlightType | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRevision = useContractStore(state => state.hasGeneratedRevision);
  const setHasGeneratedRevision = useContractStore(state => state.setHasGeneratedRevision);

  const handleGenerateContract = async () => {
    setHasGeneratedRevision(true);
    router.push(`/contracts/${contract.id}/revision`);
  };

  const handleViewRevision = () => {
    router.push(`/contracts/${contract.id}/revision`);
  };

  const filteredHighlights = selectedIssueType
    ? contract.highlights.filter(h => h.type === selectedIssueType)
    : contract.highlights;

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Fixed Stats Header */}
      <div className="bg-background border-b px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <StatsHeader 
            contract={contract} 
            onIssueClick={handleHighlightClick}
            selectedIssueType={selectedIssueType}
          />
          <div className="flex gap-2">
            {!hasGeneratedRevision ? (
              <Button onClick={handleGenerateContract}>
                Generate Contract
              </Button>
            ) : (
              <Button onClick={handleViewRevision}>
                View Revised Contract
              </Button>
            )}
          </div>
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
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedIssueType(null)}
              >
                Clear Filter
              </Button>
            )}

            {/* Highlights List */}
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
          <div className="container max-w-4xl mx-auto py-8">
            <DocumentWrapper>
              <ContractContent
                contract={contract}
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

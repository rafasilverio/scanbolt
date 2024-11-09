'use client';

import { useState, useRef } from 'react';
import { Contract, Highlight, HighlightType, AIChange } from '@/types/contract';
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

interface ContractViewerProps {
    contract: Contract;
    onAddComment?: (highlightId: string, content: string) => void;
  }

  export default function ContractViewer({ contract, onAddComment }: ContractViewerProps) {
  const [selectedChange, setSelectedChange] = useState<AIChange | null>(null);
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Fixed Stats Header */}
      <div className="bg-background border-b px-6 py-4 sticky top-0 z-40">
        <StatsHeader 
          contract={contract} 
          onIssueClick={(type) => {
            // Handle issue click
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 h-[calc(100vh-16rem)] overflow-hidden">
        {/* Left Analysis Panel */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Document Analysis</h3>
              <span className="text-xs text-muted-foreground">
                {contract.highlights.length} issues found
              </span>
            </div>
            {contract.highlights.map((highlight) => (
              <motion.div
                key={highlight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  // Handle highlight click
                }}
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Document Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container max-w-4xl mx-auto py-8">
            <DocumentWrapper>
              <ContractContent
                contract={contract}
                selectedChange={selectedChange}
                onChangeSelect={(change) => setSelectedChange(change)}
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

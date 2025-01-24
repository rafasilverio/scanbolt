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
import { DocumentWrapper } from "./DocumentWrapper";
import { NewContractContent } from "./NewContractContent";
import { DocumentToolbar } from "./DocumentToolbar";
import { InlineComment } from "./InlineComment";
import { RestrictedInlineComment } from "./RestrictedInlineComment";
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
  const [zoom, setZoom] = useState(130);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFirstIssue, setIsFirstIssue] = useState(true);
  
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
      try {
        // Processar highlights mantendo as posições existentes
        const processedHighlights = Array.isArray(initialContract.highlights)
          ? initialContract.highlights
          : typeof initialContract.highlights === 'string'
            ? JSON.parse(initialContract.highlights)
            : [];

        const validHighlights = processedHighlights.map(h => ({
          ...h,
          position: h.position,
          startIndex: Number(h.startIndex || 0),
          endIndex: Number(h.endIndex || 10)
        }));

        const parsedContract = {
          ...initialContract,
          highlights: validHighlights,
          changes: initialContract.changes
        };

        setContract(parsedContract);

        // Selecionar o primeiro highlight crítico automaticamente
        const firstCriticalHighlight = validHighlights.find(h => h.type === 'critical');
        if (firstCriticalHighlight) {
          const firstChange = parsedContract.changes?.find(
            c => c.startIndex === firstCriticalHighlight.startIndex && 
                c.endIndex === firstCriticalHighlight.endIndex
          );

          if (firstChange) {
            setIsFirstIssue(true);
            setSelectedHighlight(firstCriticalHighlight);
            setSelectedChange(firstChange);
          }
        }

      } catch (error) {
        console.error('Error processing contract data:', error);
      }
    }
  }, [initialContract, setContract]);

  const isUnderReview = storeContract?.status === 'under_review';
  const isApproved = storeContract?.status === 'approved';

  const handleViewRevision = () => {
    if (!storeContract) return;
    router.push(`/contracts/${storeContract.id}/revision`);
  };

  // Função para verificar se é primeira issue crítica
  const checkIfFirstCritical = (highlight: Highlight) => {
    if (!storeContract?.highlights) return false;
    
    return highlight.type === 'critical' && 
      !storeContract.highlights.some(h => 
        h.type === 'critical' && 
        h.startIndex < highlight.startIndex
      );
  };

  const handleHighlightClick = (highlight: Highlight) => {
    if (!storeContract?.changes) return;

    const change = storeContract.changes.find(
      c => c.startIndex === highlight.startIndex && c.endIndex === highlight.endIndex
    );

    if (change) {
      const isCriticalFirst = checkIfFirstCritical(highlight);
      setIsFirstIssue(isCriticalFirst);
      setSelectedHighlight(highlight);
      setSelectedChange(change);
    }
  };

  const handleNext = () => {
    if (!storeContract?.changes || !selectedHighlight) return;
    
    const currentIndex = filteredHighlights.findIndex(h => h.id === selectedHighlight.id);
    if (currentIndex < filteredHighlights.length - 1) {
      const nextHighlight = filteredHighlights[currentIndex + 1];
      const nextChange = storeContract.changes.find(
        c => c.startIndex === nextHighlight.startIndex && c.endIndex === nextHighlight.endIndex
      );
      
      if (nextChange) {
        const isNextCriticalFirst = checkIfFirstCritical(nextHighlight);
        setIsFirstIssue(isNextCriticalFirst);
        setSelectedHighlight(nextHighlight);
        setSelectedChange(nextChange);
      }
    }
  };

  const handleClose = () => {
    setSelectedHighlight(null);
    setSelectedChange(null);
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

  // Filtrar highlights baseado no tipo selecionado (sem filtrar por índices)
  const filteredHighlights = useMemo(() => {
    if (!storeContract?.highlights) return [];
    
    const highlights = storeContract.highlights.filter(h => 
      h.type && h.id // Mantém apenas a validação básica
    );
    
    return selectedIssueType
      ? highlights.filter(h => h.type === selectedIssueType)
      : highlights;
  }, [storeContract?.highlights, selectedIssueType]);

  const getPageCount = (content?: string): number => {
    if (!content) return 0;
    return Math.max(1, Math.ceil((content.length) / 3000));
  };

  // Adicionar handler para upgrade
  const handleUpgrade = () => {
    // Implementação futura do Stripe
    console.log("Upgrade clicked");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <DocumentWrapper contract={storeContract}>
            <NewContractContent
              contract={storeContract}
              selectedHighlight={selectedHighlight}
              selectedChange={selectedChange}
              onChangeSelect={setSelectedChange}
              highlights={filteredHighlights}
              onHighlightClick={handleHighlightClick}
              isFirstIssue={isFirstIssue}
              onUpgrade={handleUpgrade}
              onNext={handleNext}
              onClose={handleClose}
              zoom={zoom}
            />
          </DocumentWrapper>
        </div>
      </div>
    </div>
  );
}
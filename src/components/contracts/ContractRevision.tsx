"use client";

import { useContractStore } from '@/lib/store/contract-store';
import { Contract } from '@/types/contract';
import { Highlight } from "@/types/contract";
import { DocumentWrapper } from "../ui/document-wrapper";
import { DocumentToolbar } from "./DocumentToolbar";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ContractRevisionProps {
  contract: Contract;
}

export function ContractRevision({ contract: initialContract }: ContractRevisionProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use the contract directly without loading state
  const [contract, setContract] = useState(initialContract);

  // Use the highlights array directly
  const highlights = contract.highlights || [];
  
  const stats = {
    critical: highlights.filter(h => h.type === 'critical').length,
    warning: highlights.filter(h => h.type === 'warning').length,
    improvement: highlights.filter(h => h.type === 'improvement').length,
  };

  // Single fetch with cleanup
  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${initialContract.id}`);
        const data = await response.json();
        if (data.contract && isMounted) {
          setContract(data.contract);
          
          // Stop polling when contract is approved
          if (data.contract.status === 'approved') {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
      }
    };

    // Start polling immediately
    pollInterval = setInterval(fetchContract, 1000); // Poll every second
    fetchContract(); // Initial fetch

    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [initialContract.id]); // Remove contract.status dependency

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 10;

    const verifyAndUpdateStatus = async () => {
      if (!isMounted || attempts >= maxAttempts) return;

      try {
        const response = await fetch(`/api/contracts/${initialContract.id}`);
        const data = await response.json();
        
        if (data.contract) {
          const parsedHighlights = typeof data.contract.highlights === 'string' 
            ? JSON.parse(data.contract.highlights) 
            : data.contract.highlights;
          
          const parsedChanges = typeof data.contract.changes === 'string'
            ? JSON.parse(data.contract.changes)
            : data.contract.changes;

          // If we have the new content and arrays, update status to approved
          if (data.contract.content && parsedHighlights.length > 0) {
            await fetch(`/api/contracts/${initialContract.id}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'approved' })
            });
          } else {
            attempts++;
            setTimeout(verifyAndUpdateStatus, 1000);
          }
        }
      } catch (error) {
        console.error('Error verifying contract:', error);
        attempts++;
        setTimeout(verifyAndUpdateStatus, 1000);
      }
    };

    if (contract.status === 'under_review') {
      verifyAndUpdateStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [initialContract.id, contract.status]);

  const renderHighlightedContent = () => {
    const content = contract.content;
    // Use the already parsed highlights array
    const sortedHighlights = [...highlights].sort((a, b) => a.startIndex - b.startIndex);
    const segments: { text: string; highlight?: Highlight }[] = [];
    
    let lastIndex = 0;
    
    sortedHighlights.forEach(highlight => {
      if (lastIndex < highlight.startIndex) {
        segments.push({ text: content.slice(lastIndex, highlight.startIndex) });
      }
      
      segments.push({
        text: content.slice(highlight.startIndex, highlight.endIndex),
        highlight
      });
      
      lastIndex = highlight.endIndex;
    });
    
    if (lastIndex < content.length) {
      segments.push({ text: content.slice(lastIndex) });
    }

    return segments.map((segment, index) => {
      if (!segment.highlight) {
        return <span key={index}>{segment.text}</span>;
      }

      const highlightColors = {
        critical: 'bg-red-50 text-red-800 hover:bg-red-100',
        warning: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
        improvement: 'bg-green-50 text-green-800 hover:bg-green-100'
      };

      return (
        <span
          key={index}
          id={`highlight-${segment.highlight.id}`}
          className={cn(
            "relative group cursor-pointer transition-colors",
            highlightColors[segment.highlight.type],
            selectedHighlight?.id === segment.highlight.id && "ring-2 ring-primary"
          )}
          title={segment.highlight.message}
        >
          {segment.text}
        </span>
      );
    });
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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Summary Sidebar */}
      <div className="w-80 border-r bg-white h-full flex flex-col overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Changes Summary</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">Critical Issues</span>
              </div>
              <span className="font-semibold text-red-700">{stats.critical}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">Warnings</span>
              </div>
              <span className="font-semibold text-yellow-700">{stats.warning}</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">Improvements</span>
              </div>
              <span className="font-semibold text-green-700">{stats.improvement}</span>
            </div>
          </div>

          {/* Changes List */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Applied Changes</h3>
            <div className="space-y-2">
              {highlights.map(highlight => (
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">
              {contract.title} - Revised Version
            </h1>
          </div>
        </div>

        <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container max-w-4xl mx-auto py-8">
            <DocumentWrapper style={{ zoom: `${zoom}%` }}>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                  {renderHighlightedContent()}
                </pre>
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
  );
}

export default ContractRevision;
"use client";

import { useContractStore } from '@/lib/store/contract-store';
import { Contract, Highlight } from "@/types/contract";
import { DocumentWrapper } from "../ui/document-wrapper";
import { DocumentToolbar } from "./DocumentToolbar";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ContractRevision() {
  const contract = useContractStore(state => state.contract);
  const [zoom, setZoom] = useState(100);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const stats = {
    critical: contract.highlights.filter(h => h.type === 'critical').length,
    warning: contract.highlights.filter(h => h.type === 'warning').length,
    improvement: contract.highlights.filter(h => h.type === 'improvement').length,
  };

  const renderHighlightedContent = () => {
    const content = contract.content;
    const highlights = [...contract.highlights].sort((a, b) => a.startIndex - b.startIndex);
    const segments: { text: string; highlight?: Highlight }[] = [];
    
    let lastIndex = 0;
    
    highlights.forEach(highlight => {
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
        critical: 'bg-red-100 hover:bg-red-200',
        warning: 'bg-yellow-100 hover:bg-yellow-200',
        improvement: 'bg-green-100 hover:bg-green-200'
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
          title={segment.highlight.suggestion || segment.highlight.message}
        >
          {segment.text}
          <span className="absolute hidden group-hover:block bottom-full left-0 w-64 p-2 bg-white border rounded-md shadow-lg text-xs z-10">
            <strong>{segment.highlight.message}</strong>
            {segment.highlight.suggestion && (
              <p className="text-gray-600 mt-1">{segment.highlight.suggestion}</p>
            )}
          </span>
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
              {contract.highlights.map(highlight => (
                <button
                  key={highlight.id}
                  onClick={() => handleHighlightClick(highlight)}
                  className={cn(
                    "text-sm p-2 border rounded-md w-full text-left transition-colors",
                    "hover:bg-gray-50",
                    selectedHighlight?.id === highlight.id && "ring-2 ring-primary",
                    {
                      'border-red-200': highlight.type === 'critical',
                      'border-yellow-200': highlight.type === 'warning',
                      'border-green-200': highlight.type === 'improvement',
                    }
                  )}
                >
                  <p className="font-medium">{highlight.message}</p>
                  {highlight.suggestion && (
                    <p className="text-gray-600 text-xs mt-1">{highlight.suggestion}</p>
                  )}
                </button>
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
        />
      </div>
    </div>
  );
}

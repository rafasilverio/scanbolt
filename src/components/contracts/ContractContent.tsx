"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Contract, AIChange, Highlight } from "@/types/contract";
import { cn } from "@/lib/utils";
import { InlineComment } from "./InlineComment";
import { useMemo } from 'react';

interface ContractContentProps {
  contract?: Contract;
  selectedHighlight: Highlight | null;
  selectedChange: AIChange | null;
  onChangeSelect: (change: AIChange | null) => void;
  highlights: Highlight[];
  onHighlightClick: (highlight: Highlight) => void;
}

export function ContractContent({ 
  contract, 
  selectedHighlight,
  selectedChange, 
  onChangeSelect,
  highlights,
  onHighlightClick
}: ContractContentProps) {
  
  const processedHighlights = useMemo(() => {
    if (!highlights?.length) return [];
    
    return highlights.map(highlight => ({
      ...highlight,
      startIndex: Number(highlight.startIndex || 0),
      endIndex: Number(highlight.endIndex || 10) // Se for zero, marca os primeiros 10 caracteres
    }));
  }, [highlights]);

  const renderHighlightedContent = () => {
    if (!contract?.content) return null;
    
    const content = contract.content;
    const sortedHighlights = [...processedHighlights]
      .sort((a, b) => a.startIndex - b.startIndex);
    
    const segments: { text: string; highlight?: Highlight }[] = [];
    let lastIndex = 0;
    
    sortedHighlights.forEach(highlight => {
      if (lastIndex < highlight.startIndex) {
        segments.push({ text: content.slice(lastIndex, highlight.startIndex) });
      }
      
      segments.push({
        text: content.slice(highlight.startIndex, highlight.endIndex || highlight.startIndex + 10),
        highlight
      });
      
      lastIndex = highlight.endIndex || highlight.startIndex + 10;
    });
    
    if (lastIndex < content.length) {
      segments.push({ text: content.slice(lastIndex) });
    }

    return segments.map((segment, index) => {
      if (!segment.highlight) {
        return <span key={`text-${index}`}>{segment.text}</span>;
      }

      const highlightColors = {
        critical: 'bg-red-100 hover:bg-red-200',
        warning: 'bg-amber-100 hover:bg-amber-200',
        improvement: 'bg-green-100 hover:bg-green-200',
        default: 'bg-amber-100 hover:bg-amber-200'
      };

      return (
        <span
          key={`highlight-${segment.highlight.id}-${index}`}
          id={`highlight-${segment.highlight.id}`}
          onClick={() => onHighlightClick(segment.highlight!)}
          className={cn(
            "relative group cursor-pointer transition-colors",
            highlightColors[segment.highlight.type as keyof typeof highlightColors] || highlightColors.default,
            selectedHighlight?.id === segment.highlight.id && "ring-2 ring-primary"
          )}
        >
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div className="relative prose max-w-none">
      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed relative">
        {renderHighlightedContent()}
      </pre>

      <AnimatePresence>
        {selectedChange && (
          <InlineComment
            change={selectedChange}
            onClose={() => onChangeSelect(null)}
            onNext={() => {
              const currentIndex = highlights.findIndex(h => h.id === selectedHighlight?.id);
              if (currentIndex < highlights.length - 1) {
                onHighlightClick(highlights[currentIndex + 1]);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

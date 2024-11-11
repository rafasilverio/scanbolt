"use client";

import { motion } from "framer-motion";
import { Contract, AIChange, Highlight } from "@/types/contract";
import { cn } from "@/lib/utils";

interface ContractContentProps {
  contract?: Contract;
  selectedHighlight: Highlight | null;
  selectedChange: AIChange | null;
  onChangeSelect: (change: AIChange | null) => void;
}

export function ContractContent({ 
  contract, 
  selectedHighlight,
  selectedChange, 
  onChangeSelect 
}: ContractContentProps) {
  if (!contract) {
    return <div>Loading...</div>;
  }

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

  return (
    <div className="prose max-w-none">
      <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
        {renderHighlightedContent()}
      </pre>
    </div>
  );
}

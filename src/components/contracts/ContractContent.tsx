"use client";

import { motion } from "framer-motion";
import { Contract, AIChange, Highlight } from "@/types/contract";
import { cn } from "@/lib/utils";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  if (!contract) {
    return <div>Loading...</div>;
  }

  const renderHighlightedContent = () => {
    const content = contract.content;
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
        critical: 'bg-red-100 hover:bg-red-200',
        warning: 'bg-yellow-100 hover:bg-yellow-200',
        improvement: 'bg-green-100 hover:bg-green-200'
      };

      return (
        <span
          key={index}
          id={`highlight-${segment.highlight.id}`}
          onClick={() => onHighlightClick(segment.highlight!)}
          className={cn(
            "relative group cursor-pointer transition-colors",
            highlightColors[segment.highlight.type],
            selectedHighlight?.id === segment.highlight.id && "ring-2 ring-primary"
          )}
        >
          {segment.text}
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

interface InlineCommentProps {
  change: AIChange;
  onClose: () => void;
  onNext: () => void;
  hasNext: boolean;
}

export function InlineComment({ change, onClose, onNext, hasNext }: InlineCommentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-6 w-96 bg-white rounded-lg shadow-lg border p-4"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">AI Suggestion</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-500">Current Text:</div>
            <div className="text-sm">{change.originalText}</div>
          </div>
          
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-500">Suggested Change:</div>
            <div className="text-sm">{change.suggestedText}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {change.reason}
          </div>
          {hasNext && (
            <Button
              size="sm"
              onClick={onNext}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

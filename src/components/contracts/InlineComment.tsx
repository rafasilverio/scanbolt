"use client";

import { motion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChange } from "@/types/contract";
import { useEffect, useState } from "react";

interface InlineCommentProps {
  change: AIChange;
  onClose: () => void;
  onNext: () => void;
}

export function InlineComment({ change, onClose, onNext }: InlineCommentProps) {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      const highlightElement = document.getElementById(`highlight-${change.id}`);
      const documentWrapper = document.querySelector('.max-w-4xl');
      
      if (!highlightElement || !documentWrapper) return;

      const highlightRect = highlightElement.getBoundingClientRect();
      const wrapperRect = documentWrapper.getBoundingClientRect();

      // Calculate position relative to the document wrapper
      let top = highlightRect.top - wrapperRect.top;
      
      // Center vertically with the highlight
      top = top + (highlightRect.height / 2) - 200; // 200 is half the height of the float box
      
      // Ensure it stays within the wrapper bounds
      if (top < 0) top = 0;
      if (top > wrapperRect.height - 400) top = wrapperRect.height - 400;

      setPosition({
        top,
        right: -340 // Position it just outside the wrapper on the right
      });

      // Scroll the highlight into view if needed
      highlightElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    };

    // Calculate position initially and on window resize
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    
    return () => window.removeEventListener('resize', calculatePosition);
  }, [change.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-white rounded-lg shadow-lg border"
      style={{
        width: "320px",
        top: position.top,
        right: position.right,
        maxHeight: "400px",
        overflow: "auto"
      }}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <h4 className="text-sm font-medium">Suggested Change</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Original:</span>
            <div className="mt-1 p-2 bg-muted/50 rounded">
              {change.originalContent}
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Suggestion:</span>
            <div className="mt-1 p-2 bg-green-50 text-green-700 rounded border border-green-100">
              {change.content}
            </div>
          </div>
          {change.explanation && (
            <div className="text-sm">
              <span className="text-muted-foreground">Explanation:</span>
              <div className="mt-1 p-2 bg-blue-50 text-blue-700 rounded border border-blue-100">
                {change.explanation}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t sticky bottom-0 bg-white z-10">
          <span className="text-sm text-muted-foreground capitalize">
            {change.type}
          </span>
          <Button
            size="sm"
            onClick={onNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

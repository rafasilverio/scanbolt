// src/components/contracts/RestrictedInlineComment.tsx
import { motion } from "framer-motion";
import { X, ArrowRight, CheckCircle, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChange } from "@/types/contract";
import { useEffect, useState } from "react";

interface RestrictedInlineCommentProps {
  change: AIChange;
  onClose: () => void;
  onNext: () => void;
  onUpgrade: () => void;
}

export function RestrictedInlineComment({ 
  change, 
  onClose, 
  onNext,
  onUpgrade 
}: RestrictedInlineCommentProps) {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      const highlightElement = document.getElementById(`highlight-${change.id}`);
      const documentContent = document.querySelector('.prose');
      
      if (!highlightElement || !documentContent) return;

      const highlightRect = highlightElement.getBoundingClientRect();
      const contentRect = documentContent.getBoundingClientRect();

      let top = highlightRect.top - contentRect.top;
      top = Math.max(0, Math.min(top, contentRect.height - 400));

      setPosition({
        top,
        right: 16
      });

      highlightElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    const contentContainer = document.querySelector('.overflow-y-auto');
    if (contentContainer) {
      contentContainer.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      if (contentContainer) {
        contentContainer.removeEventListener('scroll', calculatePosition);
      }
    };
  }, [change.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        width: "400px",
        top: position.top,
        right: position.right,
        maxHeight: "400px",
        overflow: "auto"
      }}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          <span className="text-sm font-medium capitalize">{change.type}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="text-sm text-gray-600 mb-1.5">Current Text:</div>
          <div className="p-3 bg-gray-50 rounded text-sm border">
            {change.originalContent}
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {change.explanation}
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <div className="space-y-2 mb-3">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Get professional suggestions
              </span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Fix all issues instantly
              </span>
            </div>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Generate Safe Contract ($19)
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-2">
            Instant delivery • Money-back guarantee
          </p>
        </div>

        <div className="flex justify-between items-center pt-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={onNext}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            Next Issue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
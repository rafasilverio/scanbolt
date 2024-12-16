"use client";

import { motion } from "framer-motion";
import { X, ArrowRight, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
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

  const getIssueIcon = () => {
    switch (change.type) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'improvement':
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getIssueColor = () => {
    switch (change.type) {
      case 'critical':
        return 'bg-red-50 text-red-600';
      case 'warning':
        return 'bg-yellow-50 text-yellow-600';
      case 'improvement':
        return 'bg-green-50 text-green-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-white rounded-lg shadow-lg border"
      style={{
        width: "300px",
        top: position.top,
        right: position.right,
        maxHeight: "400px",
        overflow: "auto"
      }}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 bg-white z-10">
        <div className={`flex items-center ${getIssueColor()} px-2.5 py-1 rounded-full`}>
          {getIssueIcon()}
          <span className="text-sm font-medium ml-1.5 capitalize">{change.type}</span>
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
      
      <div className="p-4 space-y-3">
        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-gray-600">Current Text:</span>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm border">
              {change.originalContent}
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Suggestion:</span>
            <div className="mt-1 p-3 bg-green-50 text-green-700 rounded border border-green-100">
              {change.content}
            </div>
          </div>
          {change.explanation && (
            <div className="text-sm">
              <span className="text-gray-600">Explanation:</span>
              <div className="mt-1 p-3 bg-blue-50 text-blue-700 rounded border border-blue-100">
                {change.explanation}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t sticky bottom-0 bg-white z-10">
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
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700"
          >
            Next Issue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

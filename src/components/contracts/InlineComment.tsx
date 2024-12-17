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
      className="absolute z-50 rounded-2xl shadow-xl flex flex-col overflow-hidden"
      style={{
        width: "400px",
        top: position.top,
        right: position.right,
        maxHeight: "500px",
      }}
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-[#4F46E5] z-10">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">
            {change.type === 'critical' ? 'Critical Issues Detected' : 'Issue Detected'}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-[#6366F1]"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#5B54E8]">
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-white/90">Current Text:</span>
              <div className="mt-2 p-3 bg-red-600/25 text-red-50 rounded-xl border border-red-400/40">
                {change.originalContent}
              </div>
            </div>
            {change.explanation && (
              <div>
                <span className="text-sm font-medium text-white/90">Explanation:</span>
                <div className="mt-2 p-3 bg-red-600/25 text-red-50 rounded-xl border border-red-400/40">
                  {change.explanation}
                </div>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-white/90">AI Suggestion:</span>
              <div className="mt-2 p-3 bg-green-500/20 text-green-200 rounded-xl border border-green-500/30">
                {change.content}
              </div>
            </div>
          </div>

          <div className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-300 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">AI-powered analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-300 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">Instant risk identification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-300 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">Professional suggestions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 p-4 border-t border-white/10 bg-[#4F46E5]">
        <div className="flex justify-end items-center">
          <Button
            size="sm"
            onClick={onNext}
            className="bg-white text-[#4F46E5] hover:bg-white/90 flex items-center gap-2"
          >
            Next Issue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

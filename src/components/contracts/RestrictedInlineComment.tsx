// src/components/contracts/RestrictedInlineComment.tsx
import { motion } from "framer-motion";
import { X, ArrowRight, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Highlight } from "@/types/contract";
import { useState, useEffect } from "react";

interface RestrictedInlineCommentProps {
  change: Highlight;
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
      
      if (!highlightElement) return;

      const highlightRect = highlightElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      let top = highlightRect.top + window.scrollY;
      
      if (top < 100) top = 100;
      if (top > viewportHeight - 500) top = viewportHeight - 500;

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
    return () => window.removeEventListener('resize', calculatePosition);
  }, [change.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 w-[400px] rounded-2xl shadow-xl flex flex-col overflow-hidden"
      style={{
        top: position.top,
        right: position.right,
        maxHeight: "500px",
      }}
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-[#4F46E5] z-10">
        <div className="flex items-center gap-3">
          {change.comment?.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
          {change.comment?.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
          {change.comment?.type === 'improvement' && <Lightbulb className="w-4 h-4 text-green-400" />}
          <h2 className="text-xl font-semibold text-white">
            {change.comment?.type === 'critical' ? 'Critical Issue Detected' : 'Issue Detected'}
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
        <div className="p-6 space-y-6">
          <div>
            <span className="text-sm font-medium text-white/90">Selected Text:</span>
            <div className="mt-2 p-3 bg-red-600/25 text-red-50 rounded-xl">
              {change.content.text}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-white/90">AI Analysis:</span>
            <div className="mt-2 p-3 bg-red-600/25 text-red-50 rounded-xl border border-red-400/40">
              {change.comment?.message}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-200 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">AI-powered analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-200 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">Instant risk identification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-200 text-xl">✓</span>
              </div>
              <span className="text-sm text-white/80">Professional suggestions</span>
            </div>
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors text-base font-medium"
          >
            Generate Safe Contract ($19)
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            <span className="w-5 h-5">🔒</span>
            Secure, encrypted, and confidential
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
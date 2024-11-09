"use client";

import { motion } from "framer-motion";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChange } from "@/types/contract";
import { cn } from "@/lib/utils";

interface InlineCommentProps {
  change: AIChange;
  onClose: () => void;
}

export function InlineComment({ change, onClose }: InlineCommentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed z-50 bg-white rounded-lg shadow-lg border"
      style={{
        width: "320px",
        // Position will be calculated based on the selected text
        left: "calc(50% + 160px)", // Adjust based on selection
        top: "50%" // Adjust based on selection
      }}
    >
      <div className="flex items-center justify-between p-3 border-b">
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
              {change.originalText}
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Suggestion:</span>
            <div className="mt-1 p-2 bg-green-50 text-green-700 rounded border border-green-100">
              {change.suggestedText}
            </div>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <span className="text-muted-foreground">Reason:</span>
          <p>{change.reason}</p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            className="w-full text-green-700 hover:bg-green-50"
            variant="outline"
            onClick={() => {
              // Handle accept
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            size="sm"
            className="w-full text-red-700 hover:bg-red-50"
            variant="outline"
            onClick={() => {
              // Handle reject
            }}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

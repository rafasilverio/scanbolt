"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface DocumentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DocumentWrapper({ children, className }: DocumentWrapperProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Paper shadow effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-y-2 right-2 left-1 bg-black/5 rounded-lg" />
        <div className="absolute inset-y-1 right-1 left-0.5 bg-black/10 rounded-lg" />
      </div>

      {/* Document header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-lg border-b border-gray-200 p-4 flex items-center gap-3"
      >
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Contract Document</p>
          <p className="text-xs text-muted-foreground">PDF • 8 pages</p>
        </div>
      </motion.div>

      {/* Main document content */}
      <div
        className={cn(
          "bg-white shadow-lg rounded-b-lg",
          "min-h-[1056px] w-full", // A4 size ratio
          "p-16", // Document margins
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

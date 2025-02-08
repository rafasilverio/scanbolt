"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Contract } from "@/types/contract";
import { Button } from "@/components/ui/button";

interface DocumentWrapperProps {
  children: React.ReactNode;
  className?: string;
  contract?: Contract;
}

export function DocumentWrapper({ children, className, contract }: DocumentWrapperProps) {
  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Paper shadow effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-y-2 right-2 left-1 bg-black/5 rounded-lg" />
        <div className="absolute inset-y-1 right-1 left-0.5 bg-black/10 rounded-lg" />
      </div>

      {/* Document header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-lg border-b border-gray-200 p-4"
      >
        {/* <Button 
          onClick={() => {}}
          className="bg-green-600 hover:bg-green-700 text-white transition-colors"
          size="sm"
        >
          Start Review
        </Button> */}
      </motion.div>

      {/* Main document content */}
      <div
        className={cn(
          "bg-white shadow-lg rounded-b-lg",
          "min-h-[1056px] w-full",
          "p-4 relative",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

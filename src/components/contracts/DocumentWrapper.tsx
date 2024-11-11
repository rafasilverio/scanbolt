"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { Contract } from "@/types/contract";
import { formatDistanceToNow } from "date-fns";

interface DocumentWrapperProps {
  children: React.ReactNode;
  className?: string;
  contract?: Contract;
}

export function DocumentWrapper({ children, className, contract }: DocumentWrapperProps) {
  // Calculate number of pages based on content length (rough estimate)
  const estimatedPages = contract?.content 
    ? Math.ceil(contract.content.length / 3000) // Adjust this number based on your needs
    : 1;

  // Format the date
  const timeAgo = contract?.createdAt 
    ? formatDistanceToNow(new Date(contract.createdAt), { addSuffix: true })
    : '';

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
          <p className="text-sm font-medium">
            {contract?.title || 'Contract Document'}
          </p>
          <p className="text-xs text-muted-foreground">
            {`${estimatedPages} ${estimatedPages === 1 ? 'page' : 'pages'} • Created ${timeAgo}`}
          </p>
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

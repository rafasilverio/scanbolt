"use client";

import { motion } from "framer-motion";
import { Contract, AIChange } from "@/types/contract";
import { cn } from "@/lib/utils";

interface ContractContentProps {
  contract: Contract;
  selectedChange: AIChange | null;
  onChangeSelect: (change: AIChange) => void;
}

export function ContractContent({ 
  contract, 
  selectedChange, 
  onChangeSelect 
}: ContractContentProps) {
  const renderText = (text: string, changes: AIChange[]) => {
    let lastIndex = 0;
    const elements = [];

    // Sort changes by startIndex
    const sortedChanges = [...changes].sort((a, b) => a.startIndex - b.startIndex);

    sortedChanges.forEach((change, index) => {
      // Add text before the change
      if (change.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, change.startIndex)}
          </span>
        );
      }

      // Add the change
      elements.push(
        <span
          key={`change-${change.id}`}
          className={cn(
            "relative group cursor-pointer",
            change.status === 'pending' && "bg-yellow-100 hover:bg-yellow-200",
            change.status === 'accepted' && "bg-green-100",
            change.status === 'rejected' && "bg-red-100",
            selectedChange?.id === change.id && "ring-2 ring-brand-primary rounded"
          )}
          onClick={() => onChangeSelect(change)}
        >
          {text.slice(change.startIndex, change.endIndex)}
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-yellow-400 group-hover:scale-110 transition-transform" />
        </span>
      );

      lastIndex = change.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-8">
      {/* Contract Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold mb-4">{contract.title}</h1>
        <p className="text-sm text-muted-foreground">
          Agreement Date: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Contract Body */}
      <div className="space-y-6 text-[15px] leading-relaxed">
        {contract.content.split('\n\n').map((paragraph, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-justify"
          >
            {renderText(paragraph, contract.aiChanges)}
          </motion.p>
        ))}
      </div>

      {/* Signature Blocks */}
      <div className="mt-16 grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <p className="font-semibold">LANDLORD:</p>
          <div className="border-b-2 border-dashed border-gray-300 py-8" />
          <p className="text-sm text-muted-foreground">Signature</p>
        </div>
        <div className="space-y-4">
          <p className="font-semibold">TENANT:</p>
          <div className="border-b-2 border-dashed border-gray-300 py-8" />
          <p className="text-sm text-muted-foreground">Signature</p>
        </div>
      </div>
    </div>
  );
}

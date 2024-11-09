"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Contract } from "@/types/contract";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Share2,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatsHeaderProps {
  contract: Contract;
  onIssueClick: (highlight: Highlight) => void;
  selectedIssueType: HighlightType | null;
  onGenerateContract: () => void;
}

export function StatsHeader({
  contract,
  onIssueClick,
  selectedIssueType,
  onGenerateContract
}: StatsHeaderProps) {
  const stats = {
    critical: contract.highlights.filter(h => h.type === 'critical').length,
    warning: contract.highlights.filter(h => h.type === 'warning').length,
    improvement: contract.highlights.filter(h => h.type === 'improvement').length,
  };

  const handleTypeClick = (type: HighlightType) => {
    const highlightsOfType = contract.highlights.filter(h => h.type === type);
    if (highlightsOfType.length > 0) {
      onIssueClick(highlightsOfType[0]);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={selectedIssueType === 'critical' ? 'default' : 'outline'}
          className={cn(
            "h-8 px-3 gap-2",
            selectedIssueType === 'critical' 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
          )}
          onClick={() => handleTypeClick('critical')}
        >
          <AlertCircle className="h-4 w-4" />
          {stats.critical} Critical
        </Button>

        <Button
          size="sm"
          variant={selectedIssueType === 'warning' ? 'default' : 'outline'}
          className={cn(
            "h-8 px-3 gap-2",
            selectedIssueType === 'warning' 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
              : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700'
          )}
          onClick={() => handleTypeClick('warning')}
        >
          <AlertTriangle className="h-4 w-4" />
          {stats.warning} Warnings
        </Button>

        <Button
          size="sm"
          variant={selectedIssueType === 'improvement' ? 'default' : 'outline'}
          className={cn(
            "h-8 px-3 gap-2",
            selectedIssueType === 'improvement' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700'
          )}
          onClick={() => handleTypeClick('improvement')}
        >
          <Lightbulb className="h-4 w-4" />
          {stats.improvement} Improvements
        </Button>
      </div>
    </div>
  );
}

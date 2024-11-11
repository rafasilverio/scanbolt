"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Contract, Highlight, HighlightType, AIChange } from '@/types/contract';
import { useMemo } from 'react';

import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Share2,
  FileText,
  Lightbulb,
  AlertCircle,
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
  contract: {
    status?: string;
    highlights?: Highlight[] | string;
    changes?: AIChange[] | string;
  } | null;
  onIssueClick: (type: HighlightType) => void;
  selectedIssueType: HighlightType | null;
}

export default function StatsHeader({ contract, onIssueClick, selectedIssueType }: StatsHeaderProps) {
  // Parse highlights if they're stored as a string
  const highlights = (() => {
    try {
      if (!contract?.highlights) return [];
      
      // If it's already an array, use it directly
      if (Array.isArray(contract.highlights)) {
        return contract.highlights;
      }
      
      // If it's a string, try to parse it
      if (typeof contract.highlights === 'string') {
        return JSON.parse(contract.highlights);
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing highlights:', e);
      return [];
    }
  })();

  // Count all types of highlights using lowercase comparison
  const warningCount = highlights.filter((h: Highlight) => 
    h.type?.toLowerCase() === 'warning'
  ).length;

  const dangerCount = highlights.filter((h: Highlight) => 
    h.type?.toLowerCase() === 'critical'
  ).length;

  const improvementCount = highlights.filter((h: Highlight) => 
    h.type?.toLowerCase() === 'improvement'
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800';
    }
  };

  const getIssueButtonStyle = (type: string, count: number) => {
    const isSelected = selectedIssueType === type;
    const baseStyle = 'border transition-colors font-medium';
    
    switch (type) {
      case 'warning':
        return `${baseStyle} ${
          isSelected 
            ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 hover:text-yellow-900' 
            : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800'
        } ${count === 0 ? 'opacity-50' : ''}`;
      
      case 'critical':
        return `${baseStyle} ${
          isSelected 
            ? 'bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900' 
            : 'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800'
        } ${count === 0 ? 'opacity-50' : ''}`;
      
      case 'improvement':
        return `${baseStyle} ${
          isSelected 
            ? 'bg-green-200 text-green-800 hover:bg-green-300 hover:text-green-900' 
            : 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
        } ${count === 0 ? 'opacity-50' : ''}`;
      
      default:
        return `${baseStyle} bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-800`;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract?.status || 'pending')}`}>
        {contract?.status === 'under_review' ? 'Under Review' : 
         contract?.status === 'approved' ? 'Approved' : 'Pending'}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onIssueClick('warning')}
        className={`${getIssueButtonStyle('warning', warningCount)} border transition-colors`}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        {warningCount} Warnings
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onIssueClick('critical')}
        className={`${getIssueButtonStyle('critical', dangerCount)} border transition-colors`}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        {dangerCount} Critical Issues
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onIssueClick('improvement')}
        className={`${getIssueButtonStyle('improvement', improvementCount)} border transition-colors`}
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        {improvementCount} Improvements
      </Button>
    </div>
  );
}

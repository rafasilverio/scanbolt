"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Contract, ContractIssue, IssueType, SuggestedClause } from '@/types/contract';
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
  Calendar,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface StatsHeaderProps {
  contract: {
    status?: string;
    issues?: ContractIssue[] | string;
    suggestedClauses?: SuggestedClause[] | string;
    title?: string;
    createdAt?: string;
    fileType?: string;
    pageCount?: number;
  } | null;
  onIssueClick: (type: IssueType) => void;
  selectedIssueType: IssueType | null;
}

export default function StatsHeader({ contract, onIssueClick, selectedIssueType }: StatsHeaderProps) {
  // Parse issues if they're stored as a string
  const issues = useMemo(() => {
    try {
      if (!contract?.issues) return [];
      
      // If it's already an array, use it directly
      if (Array.isArray(contract.issues)) {
        return contract.issues;
      }
      
      // If it's a string, try to parse it
      if (typeof contract.issues === 'string') {
        return JSON.parse(contract.issues);
      }
      
      return [];
    } catch (e) {
      console.error('Error parsing issues:', e);
      return [];
    }
  }, [contract?.issues]);

  // Count all types of issues
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const criticalCount = issues.filter(i => i.type === 'critical').length;
  const improvementCount = issues.filter(i => i.type === 'improvement').length;

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

  const getIssueButtonStyle = (type: IssueType, count: number) => {
    const isSelected = selectedIssueType === type;
    const baseStyle = 'border transition-colors font-medium';
    
    switch (type) {
      case 'warning':
        return cn(baseStyle, {
          'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 hover:text-yellow-900': isSelected,
          'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800': !isSelected,
          'opacity-50': count === 0
        });
      
      case 'critical':
        return cn(baseStyle, {
          'bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900': isSelected,
          'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800': !isSelected,
          'opacity-50': count === 0
        });
      
      case 'improvement':
        return cn(baseStyle, {
          'bg-green-200 text-green-800 hover:bg-green-300 hover:text-green-900': isSelected,
          'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800': !isSelected,
          'opacity-50': count === 0
        });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold truncate">
          {contract?.title || 'Untitled Contract'}
        </h2>
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="uppercase">{contract?.fileType || 'DOC'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {contract?.createdAt 
                ? new Date(contract.createdAt).toLocaleDateString() 
                : 'No date'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            <span>
              {contract?.pageCount || 1} {(contract?.pageCount || 1) === 1 ? 'page' : 'pages'}
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIssueClick('critical')}
          className={`${getIssueButtonStyle('critical', criticalCount)} border transition-colors w-full justify-start`}
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {criticalCount} Critical Issues
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIssueClick('warning')}
          className={`${getIssueButtonStyle('warning', warningCount)} border transition-colors w-full justify-start`}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {warningCount} Warnings
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIssueClick('improvement')}
          className={`${getIssueButtonStyle('improvement', improvementCount)} border transition-colors w-full justify-start`}
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          {improvementCount} Improvements
        </Button>
      </div>
    </div>
  );
}

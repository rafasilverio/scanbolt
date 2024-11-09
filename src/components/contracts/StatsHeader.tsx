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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface StatsHeaderProps {
  contract: Contract;
  onIssueClick: (type: HighlightType) => void;
}

export function StatsHeader({ contract, onIssueClick }: StatsHeaderProps) {
  const stats = {
    critical: contract.highlights?.filter((h) => h.type === "critical")?.length || 0,
    warning: contract.highlights?.filter((h) => h.type === "warning")?.length || 0,
    improvement: contract.highlights?.filter((h) => h.type === "improvement")?.length || 0,
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <TooltipProvider>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {/* Title and Actions Row */}
        <div className="flex items-center justify-between">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-xl font-bold"
          >
            {contract.title}
          </motion.h1>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(contract.updatedAt).toLocaleDateString()}
            </p>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards Row */}
        <motion.div 
          variants={container}
          className="grid grid-cols-4 gap-4"
        >
          {/* Total Issues Card */}
          <motion.div variants={item}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onIssueClick('critical')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Issues</p>
                      <p className="text-2xl font-bold">
                        {stats.critical + stats.warning + stats.improvement}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-brand-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Click to view all issues</TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Critical Issues Card */}
          <motion.div variants={item}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="p-4 border-red-200 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onIssueClick('critical')}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm text-red-700">Critical Issues</p>
                      <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Click to view critical issues</TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Warning Card */}
          <motion.div variants={item}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="p-4 border-yellow-200 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onIssueClick('warning')}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm text-yellow-700">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-700">{stats.warning}</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Click to view warnings</TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Improvements Card */}
          <motion.div variants={item}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className="p-4 border-green-200 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onIssueClick('improvement')}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm text-green-700">Improvements</p>
                      <p className="text-2xl font-bold text-green-700">
                        {stats.improvement}
                      </p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Click to view improvements</TooltipContent>
            </Tooltip>
          </motion.div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}

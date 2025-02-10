"use client";

import { 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIChange } from '@/types/contract';
import { motion, AnimatePresence } from 'framer-motion';

interface DiffProps {
  change: AIChange;
  isSelected: boolean;
  onClick: () => void;
}

export function Diff({ change, isSelected, onClick }: DiffProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative group cursor-pointer mb-4 ${
        isSelected ? 'ring-2 ring-brand-primary rounded-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {change.status === 'accepted' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : change.status === 'rejected' ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Clock className="h-4 w-4 text-yellow-500" />
          )}
        </motion.div>
        
        <motion.div
          className="py-1 px-2 hover:bg-muted/50 rounded-md transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <del className="bg-red-100 text-red-700 rounded px-1">
            {change.originalContent}
          </del>
          <ins className="bg-green-100 text-green-700 rounded px-1 ml-1">
            {change.content}
          </ins>
        </motion.div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 bg-muted rounded-md">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <Badge
                    variant="outline"
                    className={`capitalize ${
                      change.type === 'critical'
                        ? 'text-red-700 border-red-300'
                        : change.type === 'warning'
                        ? 'text-yellow-700 border-yellow-300'
                        : 'text-green-700 border-green-300'
                    }`}
                  >
                    {change.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {change.status === 'pending' ? 'Pending Review' : 
                     change.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm font-medium">Why this change?</p>
                  <p className="text-sm text-muted-foreground mb-3">{change.reason}</p>
                </motion.div>
                
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-2"
                >
                  {change.status === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement accept handler
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement reject handler
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement undo handler
                      }}
                    >
                      Undo Decision
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 mb-6"
      >
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="flex gap-6 flex-1">
        <Card className="flex-1">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="w-[400px]">
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

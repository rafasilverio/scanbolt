"use client";

import { Button } from "@/components/ui/button";
import { 
  Download, 
  Printer, 
  Share2, 
  ZoomIn, 
  ZoomOut 
} from "lucide-react";

interface DocumentToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function DocumentToolbar({ onZoomIn, onZoomOut }: DocumentToolbarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border px-4 py-2 flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <Download className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Printer className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Share2 className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
      <Button variant="ghost" size="sm" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm">100%</span>
      <Button variant="ghost" size="sm" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}

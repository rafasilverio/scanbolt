"use client";

import { Button } from "@/components/ui/button";
import { 
  Download, 
  Printer, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Minus, 
  Plus 
} from "lucide-react";

interface DocumentToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function DocumentToolbar({ zoom, onZoomIn, onZoomOut, onZoomReset }: DocumentToolbarProps) {
  return (
    <div className="border-t p-2 bg-white flex items-center justify-end space-x-2">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={zoom <= 50}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomReset}
          className="min-w-[4rem]"
        >
          {zoom}%
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={zoom >= 200}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default DocumentToolbar;
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
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function DocumentToolbar({ zoom, onZoomIn, onZoomOut }: DocumentToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Zoom out"
        >
          -
        </button>
        <span className="min-w-[3rem] text-center">{zoom}%</span>
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 rounded"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default DocumentToolbar;
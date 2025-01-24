"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  PdfHighlighter, 
  Highlight as PdfHighlight, 
  IHighlight,
  Popup,
  AreaHighlight
} from "react-pdf-highlighter";
import { Highlight } from "@/types/contract";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";

interface PDFViewerProps {
  url: string;
  highlights: Highlight[];
  selectedHighlightId: string | null;
  onHighlightClick: (highlight: Highlight) => void;
  zoom: number;
}

export function PDFViewer({
  url,
  highlights,
  selectedHighlightId,
  onHighlightClick,
  zoom
}: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHighlight, setHoveredHighlight] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.position = 'absolute';
      containerRef.current.style.top = '0';
      containerRef.current.style.left = '0';
      containerRef.current.style.right = '0';
      containerRef.current.style.bottom = '0';
    }
  }, []);

  const renderHighlightPopup = (highlight: Highlight) => (
    <div className="bg-white shadow-lg rounded-lg p-2 max-w-[300px]">
      <p className="text-sm font-medium text-gray-900">
        {highlight.comment.message}
      </p>
    </div>
  );

  const renderHighlight = useCallback(
    ({ position, id, ...highlight }: Highlight, index: number) => {
      const isSelected = id === selectedHighlightId;
      const isHovered = id === hoveredHighlight;
      
      return (
        <div
          onMouseEnter={() => setHoveredHighlight(id)}
          onMouseLeave={() => setHoveredHighlight(null)}
        >
          <AreaHighlight
            highlight={{ position, id, ...highlight }}
            onChange={() => {}}
            className={cn(
              "border-2 rounded transition-all duration-200",
              highlight.comment.type === 'critical' && "border-red-500 bg-red-100/30",
              highlight.comment.type === 'warning' && "border-yellow-500 bg-yellow-100/30",
              highlight.comment.type === 'improvement' && "border-green-500 bg-green-100/30",
              (isSelected || isHovered) && "bg-blue-100/50 scale-[1.02]"
            )}
          />
          {isHovered && (
            <Popup
              popupContent={() => renderHighlightPopup(highlight as Highlight)}
              onMouseOver={() => setHoveredHighlight(id)}
              onMouseOut={() => setHoveredHighlight(null)}
            />
          )}
        </div>
      );
    },
    [selectedHighlightId, hoveredHighlight]
  );

  const scrollToHighlight = useCallback(
    (highlight: Highlight) => {
      onHighlightClick(highlight);
    },
    [onHighlightClick]
  );

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef}>
        <PdfHighlighter
          pdfDocument={url}
          enableAreaSelection={false}
          highlights={highlights}
          scrollRef={scrollToHighlight}
          highlightTransform={(highlight, index) => 
            renderHighlight(highlight as Highlight, index)
          }
          onScrollChange={() => {
            setHoveredHighlight(null);
          }}
          zoom={zoom / 100}
        />
      </div>
    </div>
  );
}
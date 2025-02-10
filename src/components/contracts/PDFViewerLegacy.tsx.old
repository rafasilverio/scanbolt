"use client";

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Highlight, PDFHighlightPosition } from '@/types/contract';
import { cn } from '@/lib/utils';

// Configurar worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  highlights: Highlight[];
  pdfPositions: PDFHighlightPosition[];
  selectedHighlightId: string | null;
  onHighlightClick: (highlight: Highlight) => void;
  zoom: number;
}

export function PDFViewer({
  url,
  highlights,
  pdfPositions,
  selectedHighlightId,
  onHighlightClick,
  zoom,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('PDFViewer Props:', { url, highlightsCount: highlights?.length, selectedHighlightId, zoom });
  console.log('Highlights:', highlights);
  console.log('PDF Positions received:', pdfPositions);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF Loaded, Pages:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: any) {
    console.error('PDF Load Error:', error);
    setIsLoading(false);
  }

  const getHighlightColor = (type: string, isSelected: boolean) => {
    // Primeiro, normalize o tipo para lowercase
    const normalizedType = type.toLowerCase();
    
    const baseColors = {
      critical: isSelected 
        ? 'bg-red-500/30 border-red-500' 
        : 'bg-red-300/20 hover:bg-red-400/30 border-red-300',
      warning: isSelected 
        ? 'bg-yellow-500/30 border-yellow-500' 
        : 'bg-yellow-300/20 hover:bg-yellow-400/30 border-yellow-300',
      improvement: isSelected 
        ? 'bg-green-500/30 border-green-500' 
        : 'bg-green-300/20 hover:bg-green-400/30 border-green-300',
    };

    // Adicione logs para debug
    console.log('Highlight type:', type);
    console.log('Normalized type:', normalizedType);
    console.log('Selected color:', baseColors[normalizedType as keyof typeof baseColors]);

    return baseColors[normalizedType as keyof typeof baseColors] || baseColors.improvement;
  };

  const renderHighlight = (highlight: Highlight, pageNumber: number) => {
    if (!highlight.position || highlight.position.pageNumber !== pageNumber) {
      return null;
    }

    // Ajustar escala para valores mais apropriados
    const PDF_SCALE = 0.30; // Fator de escala para converter coordenadas do PDF
    const VIEWER_SCALE = 1.3; // Scale usado no componente Page

    const style = {
      position: 'absolute' as const,
      left: `${highlight.position.x * PDF_SCALE}px`,
      top: `${highlight.position.y * PDF_SCALE}px`,
      width: `${highlight.position.width * PDF_SCALE}px`,
      height: `${Math.max(highlight.position.height, 16) * PDF_SCALE}px`,
      transform: 'translateY(-50%)',
      zIndex: 10,
      cursor: 'pointer',
      pointerEvents: 'auto'
    };

    return (
      <div
        key={highlight.id}
        id={`highlight-${highlight.id}`}
        className={cn(
          "absolute rounded border-2",
          getHighlightColor(highlight.type, highlight.id === selectedHighlightId)
        )}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          onHighlightClick(highlight);
        }}
      />
    );
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-auto bg-[#F5F5F5]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading PDF...</div>
        </div>
      )}
      
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div>Loading PDF...</div>}
        className="flex flex-col items-center py-8"
      >
        {numPages > 0 ? (
          Array.from(new Array(numPages), (_, index) => {
            const pageNumber = index + 1;
            const pageHighlights = highlights.filter(h => h.position?.pageNumber === pageNumber);

            return (
              <div 
                key={`page_${pageNumber}`} 
                className="relative mb-16 rounded-lg overflow-hidden"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  maxWidth: '95%',
                  margin: '0 auto'
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={1.3}
                  className="bg-white"
                  loading={
                    <div className="h-[800px] w-[600px] bg-gray-100 flex items-center justify-center">
                      Loading page {pageNumber}...
                    </div>
                  }
                />
                
                {/* Highlights Layer */}
                <div className="absolute inset-0">
                  {pageHighlights.map(highlight => renderHighlight(highlight, pageNumber))}
                </div>
              </div>
            );
          })
        ) : null}
      </Document>
    </div>
  );
}
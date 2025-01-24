"use client";

import { useCallback, useRef, useEffect, useState } from 'react';
import { 
  PdfHighlighter,
  PdfLoader,
  PdfHighlighterUtils,
  Highlight,
  TextHighlight,
  useHighlightContainerContext,
  usePdfHighlighterContext
} from "react-pdf-highlighter-extended";
import { Contract, ContractIssue } from "@/types/contract";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import * as pdfjs from 'pdfjs-dist';

// Configurar o worker do PDF.js com a versão específica
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
  selectedIssue: ContractIssue | null;
  onIssueClick: (issue: ContractIssue) => void;
  contractInfo?: Contract;
  isFirstIssue: boolean;
  onUpgrade: () => void;
  onNext: () => void;
  onClose: () => void;
}

// Interface para nosso highlight customizado
interface CustomHighlight extends Highlight {
  type: 'text'; // Definindo como literal type 'text' ao invés de string
  riskType: string;
  explanation: string;
}

// Componente do Container de Highlight
const CustomHighlightContainer = () => {
  const {
    highlight,
    isScrolledTo,
  } = useHighlightContainerContext<CustomHighlight>();

  return (
    <TextHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
      style={{
        backgroundColor: isScrolledTo ? 'rgba(255, 226, 143, 1)' : 'rgba(255, 226, 143, 0.6)',
        transition: 'background-color 0.3s',
      }}
    />
  );
};

export function PDFViewer({
  url,
  selectedIssue,
  onIssueClick,
  contractInfo,
  isFirstIssue,
  onUpgrade,
  onNext,
  onClose
}: PDFViewerProps) {
  const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

  // Adicionar useEffect para scroll automático quando selectedIssue mudar
  useEffect(() => {
    if (selectedIssue && highlighterUtilsRef.current) {
      const highlight = convertIssueToHighlight(selectedIssue);
      highlighterUtilsRef.current.scrollToHighlight(highlight);
    }
  }, [selectedIssue]);

  const convertIssueToHighlight = useCallback((issue: ContractIssue): CustomHighlight => {
    // Ajustar escala para o PDF viewer - usar scale do PDF.js
    const scale = 1;
    
    const highlight: CustomHighlight = {
      id: issue.id,
      type: "text", // Sempre usar highlight de texto
      content: {
        text: issue.originalText || ''
      },
      position: {
        boundingRect: {
          x1: issue.position.x1 * scale,
          y1: issue.position.y1 * scale,
          x2: issue.position.x2 * scale,
          y2: issue.position.y2 * scale,
          width: (issue.position.x2 - issue.position.x1) * scale,
          height: (issue.position.y2 - issue.position.y1) * scale,
          pageNumber: issue.position.pageNumber
        },
        rects: [{
          x1: issue.position.x1 * scale,
          y1: issue.position.y1 * scale,
          x2: issue.position.x2 * scale,
          y2: issue.position.y2 * scale,
          width: (issue.position.x2 - issue.position.x1) * scale,
          height: (issue.position.y2 - issue.position.y1) * scale,
          pageNumber: issue.position.pageNumber
        }],
        pageIndex: issue.position.pageNumber - 1,
        text: issue.originalText || ''
      },
      comment: {
        text: issue.explanation || ''
      },
      riskType: issue.riskType,
      explanation: issue.explanation
    };

    return highlight;
  }, []);

  return (
    <div className="relative h-full">
      <div className="h-full">
        <PdfLoader document={url}>
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              utilsRef={(utils) => {
                highlighterUtilsRef.current = utils;
              }}
              highlights={selectedIssue ? [convertIssueToHighlight(selectedIssue)] : []}
              onScrollAway={() => {}}
              pdfScaleValue="page-width"
            >
              <CustomHighlightContainer />
            </PdfHighlighter>
          )}
        </PdfLoader>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
        <Button onClick={isFirstIssue ? onNext : onUpgrade}>
          {isFirstIssue ? 'Next' : 'Upgrade'}
        </Button>
      </div>
    </div>
  );
}

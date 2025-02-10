"use client";

import { PDFViewer } from "@/components/contracts/PDFViewer";
import { InlineComment } from "@/components/contracts/InlineComment";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ContractIssue } from "@/types/contract";

const exampleHighlights = [
  {
    id: "1",
    type: "critical" as const,
    startIndex: 0,
    endIndex: 100,
    pageNumber: 1,
    position: {
      x: 80,
      y: 80,
      width: 750,
      height: 25
    }
  },
  {
    id: "2",
    type: "warning" as const,
    startIndex: 150,
    endIndex: 200,
    pageNumber: 1,
    position: {
      x: 75,
      y: 210,
      width: 650,
      height: 25
    }
  },
  {
    id: "3",
    type: "improvement" as const,
    startIndex: 250,
    endIndex: 300,
    pageNumber: 1,
    position: {
      x: 75,
      y: 645,
      width: 650,
      height: 30
    }
  }
];

const exampleChange = {
  id: "1",
  type: "critical" as const,
  originalContent: "Nome: _______________________",
  content: "O campo 'Nome' do locador deve ser preenchido com o nome completo, exatamente como consta no documento de identificação.",
  explanation: "Campos de identificação incompletos podem invalidar o contrato ou causar problemas legais futuros. É crucial que o nome do locador seja preenchido corretamente.",
};

export default function PDFTestPage() {
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>("1"); // Começamos com o primeiro highlight selecionado

  const handleHighlightClick = (highlightId: string) => {
    setSelectedHighlightId(highlightId);
  };

  const handleCloseComment = () => {
    setSelectedHighlightId(null);
  };

  const handleNextIssue = () => {
    // Simular mudança para o próximo highlight
    if (selectedHighlightId === "1") setSelectedHighlightId("2");
    else if (selectedHighlightId === "2") setSelectedHighlightId("3");
    else setSelectedHighlightId("1");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gray-50 rounded-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto relative">
            <PDFViewer 
              url="/sample.pdf" selectedIssue={null} onIssueClick={function (issue: ContractIssue): void {
                throw new Error("Function not implemented.");
              } } isFirstIssue={false} onUpgrade={function (): void {
                throw new Error("Function not implemented.");
              } } onNext={function (): void {
                throw new Error("Function not implemented.");
              } } onClose={function (): void {
                throw new Error("Function not implemented.");
              } }            />
            {selectedHighlightId && (
              <div className="mt-20">
                <InlineComment
                  change={{
                    ...exampleChange,
                    content: {
                      text: exampleChange.content
                    }
                  }}
                  onClose={handleCloseComment}
                  onNext={handleNextIssue}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900">Issues</h2>
            <div className="mt-4 space-y-2">
              {exampleHighlights.map(highlight => (
                <div 
                  key={highlight.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer",
                    selectedHighlightId === highlight.id 
                      ? "bg-gray-100 border-[#4F46E5]" 
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => handleHighlightClick(highlight.id)}
                >
                  <div className={cn(
                    "text-sm font-medium",
                    highlight.type === 'critical' && "text-red-600",
                    highlight.type === 'warning' && "text-amber-600",
                    highlight.type === 'improvement' && "text-green-600"
                  )}>
                    {highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Page {highlight.pageNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
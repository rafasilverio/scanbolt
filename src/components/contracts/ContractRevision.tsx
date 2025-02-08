"use client";

import { useState, useEffect, useMemo, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { Contract, ContractIssue, IssueType, SuggestedClause } from "@/types/contract";
import { PDFViewer } from "./PDFViewer";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Lightbulb, Plus, FileText, CheckIcon, MessageSquare, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

interface ContractRevisionProps {
  contract?: Contract;
}

export function ContractRevision({ contract }: ContractRevisionProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'suggested'>('issues');
  const [filteredType, setFilteredType] = useState<IssueType | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ContractIssue | null>(null);
  const [zoom, setZoom] = useState(100);
  const router = useRouter();

  // Processar issues
  const issues = useMemo(() => {
    if (!contract) return [];
    try {
      return Array.isArray(contract.issues) 
        ? contract.issues 
        : JSON.parse(contract.issues || '[]');
    } catch (e) {
      console.error('Error processing issues:', e);
      return [];
    }
  }, [contract]);

  // Processar suggested clauses
  const suggestedClauses = useMemo(() => {
    if (!contract) return [];
    try {
      return Array.isArray(contract.suggestedClauses) 
        ? contract.suggestedClauses 
        : JSON.parse(contract.suggestedClauses || '[]');
    } catch (e) {
      console.error('Error processing suggested clauses:', e);
      return [];
    }
  }, [contract]);

  // Garantir que temos uma URL válida
  const pdfUrl = useMemo(() => {
    if (!contract?.fileUrl) return '';
    try {
      return new URL(contract.fileUrl).toString();
    } catch (error) {
      console.error('Invalid PDF URL:', error);
      return '';
    }
  }, [contract?.fileUrl]);

  const handleBack = () => {
    if (contract?.id) {
      router.push(`/contracts/${contract.id}`);
    }
  };

  return (
    <div className="flex h-full">
      {/* Container do PDF */}
      <div className="flex-1 relative h-full">
        {/* Botão Voltar */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contract
          </Button>
        </div>

        {/* Info do arquivo */}
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-lg p-3 mb-4">
          <FileText className="w-4 h-4 text-gray-500" />
          <div className="flex-1 text-sm text-gray-600">
            {contract?.fileName || 'Untitled'} • {contract?.fileType || 'Unknown'} • {contract?.metadata?.pageCount || '-'} pages
          </div>
        </div>

        <PDFViewer
          url={pdfUrl}
          selectedIssue={selectedIssue}
          onIssueClick={setSelectedIssue}
          zoom={zoom}
          contractInfo={contract}
          onFilterByType={setFilteredType}
        />
      </div>

      {/* Barra lateral */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Contadores Grandes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {issues.length}
              </div>
              <div className="text-sm text-red-600/80 font-medium">
                Total Issues
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {suggestedClauses.length}
              </div>
              <div className="text-sm text-blue-600/80 font-medium">
                New Clauses
              </div>
            </div>
          </div>

          {/* Issues Summary */}
          <div className="space-y-2">
            <button
              onClick={() => setFilteredType(filteredType === 'critical' ? null : 'critical')}
              className={cn(
                "flex items-center justify-between w-full p-2 rounded",
                filteredType === 'critical' ? "bg-red-50" : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Critical Issues</span>
              </div>
              <Badge variant="destructive">
                {issues.filter(i => i.type === 'critical').length}
              </Badge>
            </button>

            <button
              onClick={() => setFilteredType(filteredType === 'warning' ? null : 'warning')}
              className={cn(
                "flex items-center justify-between w-full p-2 rounded",
                filteredType === 'warning' ? "bg-yellow-50" : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>Warnings</span>
              </div>
              <Badge variant="secondary">
                {issues.filter(i => i.type === 'warning').length}
              </Badge>
            </button>

            <button
              onClick={() => setFilteredType(filteredType === 'improvement' ? null : 'improvement')}
              className={cn(
                "flex items-center justify-between w-full p-2 rounded",
                filteredType === 'improvement' ? "bg-green-50" : "hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-500" />
                <span>Improvements</span>
              </div>
              <Badge variant="outline">
                {issues.filter(i => i.type === 'improvement').length}
              </Badge>
            </button>
          </div>

          {/* Lista de Issues */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Contract Issues ({issues.length})</h3>
            {issues
              .filter(issue => !filteredType || issue.type === filteredType)
              .map((issue, index) => (
                <div
                  key={issue.id}
                  className={cn(
                    "p-4 rounded-lg cursor-pointer transition-all",
                    selectedIssue?.id === issue.id ? "ring-2 ring-primary" : "hover:bg-gray-50",
                    {
                      'bg-red-50': issue.type === 'critical',
                      'bg-yellow-50': issue.type === 'warning',
                      'bg-green-50': issue.type === 'improvement'
                    }
                  )}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {issue.type === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {issue.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                    {issue.type === 'improvement' && <Lightbulb className="w-4 h-4 text-green-500" />}
                    <span className="font-medium">Issue #{index + 1}</span>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="text-gray-600">
                      <p className="font-medium mb-1">Selected Text:</p>
                      <p className="italic whitespace-pre-wrap">{issue.originalText}</p>
                    </div>
                    
                    <div className="text-gray-600">
                      <p className="font-medium mb-1">AI Analysis:</p>
                      <p className="whitespace-pre-wrap">{issue.explanation}</p>
                    </div>

                    <div className="text-gray-600">
                      <p className="font-medium mb-1">Suggested Fix:</p>
                      <p className="whitespace-pre-wrap">{issue.newText}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Lista de Suggested Clauses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Suggested New Clauses ({suggestedClauses.length})</h3>
            {suggestedClauses.map((clause, index) => (
              <div key={clause.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-green-500" />
                  <span className="font-medium">New Clause Suggestion #{index + 1}</span>
                </div>
                
                <div className="text-sm space-y-2">
                  <p className="font-medium">{clause.title}</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{clause.explanation}</p>
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-gray-600 whitespace-pre-wrap">{clause.suggestedText}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
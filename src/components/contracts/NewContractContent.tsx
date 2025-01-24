"use client";

import { useState, useEffect, useMemo } from 'react';
import { Contract, ContractIssue, IssueType, SuggestedClause } from "@/types/contract";
import { PDFViewer } from "./PDFViewer";
import { InlineComment } from "./InlineComment";
import { RestrictedInlineComment } from "./RestrictedInlineComment";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Lightbulb, Plus, FileText, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


interface NewContractContentProps {
  contract?: Contract;
  selectedIssue: ContractIssue | null;
  onIssueClick: (issue: ContractIssue) => void;
  isFirstIssue: boolean;
  onUpgrade: () => void;
  onNext: () => void;
  onClose: () => void;
}

// Componente para o cabeçalho de contagem de issues
function IssuesSummary({ issues, filteredType, setFilteredType }: {
  issues: ContractIssue[];
  filteredType: IssueType | null;
  setFilteredType: (type: IssueType | null) => void;
}) {
  const criticalCount = issues.filter(i => i.type === 'critical').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const improvementCount = issues.filter(i => i.type === 'improvement').length;

  return (
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
        <Badge variant="destructive">{criticalCount}</Badge>
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
        <Badge variant="warning">{warningCount}</Badge>
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
        <Badge variant="success">{improvementCount}</Badge>
      </button>
    </div>
  );
}

// Componente para renderizar uma issue individual
function IssueItem({ 
  issue, 
  index, 
  isSelected, 
  isUnlocked,
  onIssueClick
}: {
  issue: ContractIssue;
  index: number;
  isSelected: boolean;
  isUnlocked: boolean;
  onIssueClick: (issue: ContractIssue) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onIssueClick(issue);
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-all",
        isSelected ? "ring-2 ring-primary" : "hover:bg-gray-50",
        {
          'bg-red-50': issue.type === 'critical',
          'bg-yellow-50': issue.type === 'warning',
          'bg-green-50': issue.type === 'improvement'
        }
      )}
      onClick={handleClick}
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
          <p className="line-clamp-2">{issue.originalText}</p>
        </div>
        
        <div className="text-gray-600">
          <p className="font-medium mb-1">AI Analysis:</p>
          <p className="line-clamp-2">{issue.explanation}</p>
        </div>

        <div className="text-gray-600">
          <p className="font-medium mb-1">Fixed Clause:</p>
          {isUnlocked ? (
            <p className="line-clamp-2">{issue.newText}</p>
          ) : (
            <p className="line-clamp-2 text-green-600 italic">[unlock correction]</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para renderizar uma suggested clause
function SuggestedClauseItem({
  clause,
  index,
  isUnlocked,
  onUpgrade
}: {
  clause: SuggestedClause;
  index: number;
  isUnlocked: boolean;
  onUpgrade: () => void;
}) {
  return (
    <div className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Plus className="w-4 h-4 text-green-500" />
        <span className="font-medium">New Clause Suggestion #{index + 1}</span>
      </div>
      
      <div className="text-sm space-y-2">
        <p className="font-medium">{clause.title}</p>
        <p className="text-gray-600">{clause.explanation}</p>
        
        {isUnlocked ? (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <p className="text-gray-600">{clause.suggestedText}</p>
          </div>
        ) : (
          <button
            onClick={onUpgrade}
            className="w-full mt-2 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Unlock Suggestion ($19)
          </button>
        )}
      </div>
    </div>
  );
}

export function NewContractContent({
  contract,
  selectedIssue,
  onIssueClick,
  isFirstIssue,
  onUpgrade,
  onNext,
  onClose
}: NewContractContentProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'suggested'>('issues');
  const [filteredType, setFilteredType] = useState<IssueType | null>(null);
  const [zoom, setZoom] = useState(100);
  const [localSelectedIssue, setLocalSelectedIssue] = useState<ContractIssue | null>(selectedIssue);

  // Sincronizar o estado local com a prop
  useEffect(() => {
    setLocalSelectedIssue(selectedIssue);
  }, [selectedIssue]);

  // Handler para clique na issue
  const handleIssueClick = (issue: ContractIssue) => {
    console.log('NewContractContent - Issue clicked:', issue);
    setLocalSelectedIssue(issue);
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  // Debug log para ver o contrato completo
  useEffect(() => {
    console.log('Raw contract data:', contract);
  }, [contract]);

  // Debug: Verificar se o contract e a URL existem
  useEffect(() => {
    console.log('Contract:', contract);
    console.log('PDF URL:', contract?.fileUrl);
  }, [contract]);

  // Processar issues (anteriormente highlights)
  const issues = useMemo(() => {
    if (!contract) return [];

    let processedIssues = [];

    try {
      // Tentar obter do campo issues primeiro
      if (Array.isArray(contract.issues)) {
        processedIssues = contract.issues;
      }
      // Tentar obter do campo highlights (nome antigo)
      else if (Array.isArray(contract.highlights)) {
        processedIssues = contract.highlights;
      }
      // Se for string, tentar parse
      else if (typeof contract.highlights === 'string') {
        processedIssues = JSON.parse(contract.highlights);
      }
      // Se for string no campo issues
      else if (typeof contract.issues === 'string') {
        processedIssues = JSON.parse(contract.issues);
      }

      console.log('Processed issues from:', {
        fromIssues: contract.issues,
        fromHighlights: contract.highlights,
        result: processedIssues
      });

      return processedIssues;
    } catch (e) {
      console.error('Error processing issues:', e);
      return [];
    }
  }, [contract]);

  // Processar suggested clauses (anteriormente changes)
  const suggestedClauses = useMemo(() => {
    if (!contract) return [];

    let processedClauses = [];

    try {
      // Tentar obter do campo suggestedClauses primeiro
      if (Array.isArray(contract.suggestedClauses)) {
        processedClauses = contract.suggestedClauses;
      }
      // Tentar obter do campo changes (nome antigo)
      else if (Array.isArray(contract.changes)) {
        processedClauses = contract.changes;
      }
      // Se for string, tentar parse
      else if (typeof contract.changes === 'string') {
        processedClauses = JSON.parse(contract.changes);
      }
      // Se for string no campo suggestedClauses
      else if (typeof contract.suggestedClauses === 'string') {
        processedClauses = JSON.parse(contract.suggestedClauses);
      }

      console.log('Processed clauses from:', {
        fromSuggestedClauses: contract.suggestedClauses,
        fromChanges: contract.changes,
        result: processedClauses
      });

      return processedClauses;
    } catch (e) {
      console.error('Error processing suggested clauses:', e);
      return [];
    }
  }, [contract]);

  // Debug log para os dados processados
  useEffect(() => {
    console.log('Processed data:', {
      issuesCount: issues.length,
      suggestedClausesCount: suggestedClauses.length,
      firstIssue: issues[0],
      firstClause: suggestedClauses[0]
    });
  }, [issues, suggestedClauses]);

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

  // Debug: Monitorar mudanças no selectedIssue
  useEffect(() => {
    console.log('Selected issue changed:', selectedIssue);
  }, [selectedIssue]);

  return (
    <div className="flex h-full">
      {/* Container do PDF */}
      <div className="flex-1 relative h-full">
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-lg p-3 mb-4">
          <FileText className="w-4 h-4 text-gray-500" />
          <div className="flex-1 text-sm text-gray-600">
            {contract?.title || 'Untitled'} • {contract?.fileType || 'Unknown'} • {contract?.numPages || '-'} pages
          </div>
        </div>
        <PDFViewer
          url={pdfUrl}
          selectedIssue={localSelectedIssue}
          onIssueClick={handleIssueClick}
          zoom={zoom}
          contractInfo={contract}
          onFilterByType={setFilteredType}
          isFirstIssue={isFirstIssue}
          onUpgrade={onUpgrade}
          onNext={onNext}
          onClose={onClose}
        />
      </div>

      {/* Barra lateral */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('issues')}
                className={cn(
                  "py-2 px-4 text-sm font-medium border-b-2",
                  activeTab === 'issues'
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                Issues ({issues?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('suggested')}
                className={cn(
                  "py-2 px-4 text-sm font-medium border-b-2",
                  activeTab === 'suggested'
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                New Clauses ({suggestedClauses?.length || 0})
              </button>
            </nav>
          </div>

          {/* Conteúdo das tabs */}
          {activeTab === 'issues' ? (
            <div className="space-y-6">
              {/* Premium CTA */}
              <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg p-6 border border-green-500/20">
                <h3 className="text-xl font-semibold text-green-600 mb-3">
                  Generate New Contract Now
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p>Revised Clauses with Security for You</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-500" />
                    <p>With New Importants Clauses</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <p>Commented for Other Parties/Lawyers</p>
                  </div>
                </div>
                <Button 
                  onClick={onUpgrade}
                  className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  Generate New Contract only $19
                </Button>
              </div>

              <IssuesSummary 
                issues={issues || []}
                filteredType={filteredType}
                setFilteredType={setFilteredType}
              />
              
              <div className="space-y-4">
                {(issues || [])
                  .filter(issue => !filteredType || issue.type === filteredType)
                  .map((issue, index) => (
                    <IssueItem
                      key={issue.id}
                      issue={issue}
                      index={index}
                      isSelected={localSelectedIssue?.id === issue.id}
                      isUnlocked={index === 0}
                      onIssueClick={handleIssueClick}
                    />
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {(suggestedClauses || []).map((clause, index) => (
                <SuggestedClauseItem
                  key={clause.id}
                  clause={clause}
                  index={index}
                  isUnlocked={index === 0}
                  onUpgrade={onUpgrade}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AnimatePresence para os comentários inline */}
      <AnimatePresence>
        {selectedIssue && (
          isFirstIssue ? (
            <InlineComment
              change={selectedIssue}
              onClose={onClose}
              onNext={onNext}
            />
          ) : (
            <RestrictedInlineComment
              change={selectedIssue}
              onClose={onClose}
              onNext={onNext}
              onUpgrade={onUpgrade}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
}
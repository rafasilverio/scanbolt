// Tipos base
type IssueType = 'critical' | 'warning' | 'improvement';
type IssueStatus = 'pending' | 'accepted' | 'skipped';
type RiskType = 'financial' | 'legal' | 'compliance' | 'operational';

// Mantendo compatibilidade com PDF Highlighter Extended
export interface PDFPosition {
  boundingRect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
  };
  rects: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
    pageNumber: number;
  }>;
}

export interface ContractIssue {
  id: string;
  type: IssueType;
  originalText: string;
  newText: string;
  explanation: string;
  riskType: RiskType;
  status: IssueStatus;
  position: {
    startIndex: number;
    endIndex: number;
    pageNumber: number;
    // Coordenadas diretas do PDF
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
}

export interface SuggestedClause {
  id: string;
  title: string;
  explanation: string;
  suggestedText: string;
  riskType: RiskType;
  status: IssueStatus;
  suggestedPosition: {
    afterClause?: string;
    pageNumber?: number;
  };
}

export interface Contract {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  content: string;
  issues: ContractIssue[];
  suggestedClauses: SuggestedClause[];
  status: 'analyzing' | 'under_review' | 'completed';
  metadata: {
    pageCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

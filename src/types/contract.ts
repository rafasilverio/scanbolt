export type HighlightType = 'warning' | 'improvement' | 'critical';

export interface AIChange {
  id: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  startIndex: number;
  endIndex: number;
  status: 'pending' | 'accepted' | 'rejected';
  type: HighlightType;
}

export interface Highlight {
  id: string;
  type: HighlightType;
  startIndex: number;
  endIndex: number;
  message: string;
  suggestion?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  highlightId?: string;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  highlights: Highlight[];
  comments: Comment[];
  aiChanges: AIChange[];
  status: 'pending' | 'analyzing' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const createEmptyContract = (): Contract => ({
  id: '',
  title: '',
  content: '',
  highlights: [],
  comments: [],
  aiChanges: [],
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

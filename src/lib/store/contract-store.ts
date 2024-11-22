import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Contract, AIChange, Highlight } from '@/types/contract';

interface ContractStore {
  contract: Contract | null;
  isGenerating: boolean;
  setContract: (contract: Contract) => void;
  generateRevision: () => Promise<void>;
}

export const useContractStore = create<ContractStore>((set, get) => ({
  contract: null,
  isGenerating: false,

  setContract: (contract: Contract) => {
    // Generate changes from highlights if changes array is empty
    const changes = contract.changes.length === 0 
      ? contract.highlights.map(highlight => ({
          id: uuidv4(),
          content: highlight.suggestion || '',
          originalContent: contract.content.slice(highlight.startIndex, highlight.endIndex),
          explanation: highlight.message,
          suggestion: highlight.suggestion || '',
          status: 'pending' as const,
          reason: highlight.message,
          type: highlight.type,
          startIndex: highlight.startIndex,
          endIndex: highlight.endIndex
        }))
      : contract.changes;

    // Ensure all highlights and changes have valid IDs
    const processedContract = {
      ...contract,
      highlights: (contract.highlights || []).map(h => ({
        ...h,
        id: h.id || uuidv4()
      })),
      changes: changes.map(c => ({
        ...c,
        id: c.id || uuidv4()
      }))
    };
    
    set({ contract: processedContract });
  },

  generateRevision: async () => {
    set({ isGenerating: true });
    try {
      // Implement your revision generation logic here
    } finally {
      set({ isGenerating: false });
    }
  }
}));

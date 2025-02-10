import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from '@/types/contract';

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
    // Ensure all issues have valid IDs
    const processedContract = {
      ...contract,
      issues: (contract.issues || []).map(issue => ({
        ...issue,
        id: issue.id || uuidv4(),
        status: issue.status || 'pending'
      })),
      suggestedClauses: (contract.suggestedClauses || []).map(clause => ({
        ...clause,
        id: clause.id || uuidv4(),
        status: clause.status || 'pending'
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

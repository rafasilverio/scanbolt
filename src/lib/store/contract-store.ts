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
    // Ensure all highlights and changes have valid IDs
    const processedContract = {
      ...contract,
      highlights: (contract.highlights || []).map(h => ({
        ...h,
        id: h.id || uuidv4()
      })),
      changes: (contract.changes || []).map(c => ({
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

import { create } from 'zustand';
import { exampleContract, Contract } from '@/types/contract';

interface ContractStore {
  contract: Contract;
  hasGeneratedRevision: boolean;
  setContract: (contract: Contract) => void;
  setHasGeneratedRevision: (value: boolean) => void;
  generateRevision: () => Promise<void>;
}

export const useContractStore = create<ContractStore>((set) => ({
  contract: exampleContract,
  hasGeneratedRevision: false,
  setContract: (contract) => set({ contract }),
  setHasGeneratedRevision: (value) => set({ hasGeneratedRevision: value }),
  generateRevision: async () => {
    try {
      // Implement your revision generation logic here
      // Example:
      // const response = await api.generateRevision(useContractStore.getState().contract.id);
      // set({ contract: response.data });
      set({ hasGeneratedRevision: true });
    } catch (error) {
      console.error('Error generating revision:', error);
    }
  },
}));

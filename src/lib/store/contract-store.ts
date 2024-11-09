import { create } from 'zustand';
import { exampleContract, Contract } from '@/types/contract';

interface ContractStore {
  contract: Contract;
  hasGeneratedRevision: boolean;
  setContract: (contract: Contract) => void;
  setHasGeneratedRevision: (value: boolean) => void;
}

export const useContractStore = create<ContractStore>((set) => ({
  contract: exampleContract,
  hasGeneratedRevision: false,
  setContract: (contract) => set({ contract }),
  setHasGeneratedRevision: (value) => set({ hasGeneratedRevision: value }),
}));

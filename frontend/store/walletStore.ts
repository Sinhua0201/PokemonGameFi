import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: string;
  connected: boolean;
  setWallet: (address: string, balance: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: '0',
  connected: false,
  setWallet: (address, balance) => set({ address, balance, connected: true }),
  disconnect: () => set({ address: null, balance: '0', connected: false }),
}));

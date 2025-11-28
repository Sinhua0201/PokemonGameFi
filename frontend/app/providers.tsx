'use client';

import { WalletProvider, SuiClientProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// OneChain Testnet configuration
const ONECHAIN_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-testnet.onelabs.cc:443';

const networks = {
  'onechain-testnet': { url: ONECHAIN_RPC_URL },
  testnet: { url: ONECHAIN_RPC_URL }, // Alias for compatibility
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="onechain-testnet">
        <WalletProvider>
          {children}
          <Toaster position="top-right" richColors />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

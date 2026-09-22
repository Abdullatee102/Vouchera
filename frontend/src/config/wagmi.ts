import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';

// Bohr Testnet definition
export const bohrTestnet = defineChain({
  id: 968,
  name: 'Bohr Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BOT_RPC_URL || 'https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Bohr Explorer',
      url: import.meta.env.VITE_BOT_EXPLORER_URL || 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

// Reown AppKit Project ID
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set');
}

// Query client for TanStack React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,       // 10 seconds
      refetchInterval: 30_000, // refetch every 30 seconds
    },
  },
});

// Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [bohrTestnet],
  projectId,
  ssr: false,
});

// Create AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bohrTestnet],
  projectId,
  metadata: {
    name: 'Vouchera',
    description: 'Controlled digital subsidy/voucher system on Bohr Testnet',
    url: import.meta.env.VITE_APP_URL || 'https://vouchera.app',
    icons: ['/favicon.ico'],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#06b6d4',
    '--w3m-border-radius-master': '8px',
  },
  features: {
    analytics: false,
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;


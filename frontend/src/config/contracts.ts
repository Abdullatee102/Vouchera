import VoucheraABI from '../abi/Vouchera.json';

export const VOUCHERA_CONTRACT_ADDRESS = (
  import.meta.env.VITE_VOUCHERA_CONTRACT_ADDRESS || '0xCad5b0572f4bD9732d26B319530254b477dA9711'
) as `0x${string}`;

export const VOUCHERA_ABI = VoucheraABI as readonly object[];

export const CONTRACT_CONFIG = {
  address: VOUCHERA_CONTRACT_ADDRESS,
  abi: VOUCHERA_ABI,
} as const;

export const BOHR_CHAIN_ID = parseInt(import.meta.env.VITE_BOT_CHAIN_ID || '968');
export const BOHR_EXPLORER = import.meta.env.VITE_BOT_EXPLORER_URL || 'https://scan.bohr.life/';


import { formatEther } from 'viem';

export function formatBOT(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  if (num === 0) return '0 BOT';
  if (num < 0.0001) return `< 0.0001 BOT`;
  return `${num.toFixed(decimals).replace(/\.?0+$/, '')} BOT`;
}

export function formatBOTShort(wei: bigint): string {
  const eth = parseFloat(formatEther(wei));
  if (eth >= 1000000) return `${(eth / 1000000).toFixed(1)}M BOT`;
  if (eth >= 1000) return `${(eth / 1000).toFixed(1)}K BOT`;
  return `${eth.toFixed(2)} BOT`;
}

export function formatAddress(address: string, chars: number = 6): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: bigint): string {
  if (timestamp === 0n) return 'N/A';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: bigint): string {
  if (timestamp === 0n) return 'N/A';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTimeUntilExpiry(expiresAt: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = Number(expiresAt);
  if (exp === 0) return 'No expiry';
  const diff = exp - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 30) return `Expires ${formatDate(expiresAt)}`;
  if (days > 0) return `Expires in ${days}d ${hours}h`;
  if (hours > 0) return `Expires in ${hours}h`;
  const minutes = Math.floor((diff % 3600) / 60);
  return `Expires in ${minutes}m`;
}

export function isExpired(expiresAt: bigint): boolean {
  if (expiresAt === 0n) return false;
  return Number(expiresAt) < Math.floor(Date.now() / 1000);
}

export function percentageUsed(used: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.min(100, Number((used * 100n) / total));
}

export function explorerUrl(txOrAddress: string, type: 'tx' | 'address' = 'tx'): string {
  const base = import.meta.env.VITE_BOT_EXPLORER_URL || 'https://scan.bohr.life/';
  return `${base}${type}/${txOrAddress}`;
}

export function keccak256Category(name: string): `0x${string}` {
  // These match the Solidity keccak256 values used in the contract
  const categories: Record<string, `0x${string}`> = {
    FOOD: '0x7e24bdddb5b9c4abd1459ee58e33c13eace9fa4eb3e7e1c47a2d18bc13e93af1',
    EDUCATION: '0xd77b08e31e2d7d85f2f88e6b55d16a56d19d47e9fd6ef05e7b7f0555ec64e8b6',
    HEALTHCARE: '0x90c4e4a76b88b8d7c98d8cca6ea1fd4b0e4c1527e8b8d6c02889d93a0dff2f0',
    TRANSPORT: '0x72a5e82a7e2e34ba8c5e2db9eb5dfb08c3a4e7b6f1d9c0e4a3b7f2e1d5c8a9b',
    ESSENTIALS: '0x5e2d4a1c8b3f6e9d0a7c4b2e5f8a1d4c7b0e3f6a9d2c5b8e1f4a7d0c3b6e9f',
  };
  return categories[name.toUpperCase()] || '0x0000000000000000000000000000000000000000000000000000000000000000';
}


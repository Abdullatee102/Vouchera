export interface WelcomeRequest {
  address: `0x${string}`;
  timestamp: number;
  status: 'pending' | 'approved';
}

const CLAIMED_STORAGE_KEY = 'vouchera_claimed_welcome_wallets';

function getStoredClaimedWallets(): Set<string> {
  try {
    const raw = localStorage.getItem(CLAIMED_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map((a: string) => a.toLowerCase()));
      }
    }
  } catch (e) {
    // ignore
  }
  return new Set();
}

function saveClaimedWallet(address: string) {
  try {
    const set = getStoredClaimedWallets();
    set.add(address.toLowerCase());
    localStorage.setItem(CLAIMED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    // ignore
  }
}

// In-memory session store for welcome point requests
const welcomeRequests: Map<string, WelcomeRequest> = new Map();
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function submitWelcomeRequest(address: `0x${string}`): boolean {
  if (!address || address.length !== 42) return false;
  const key = address.toLowerCase();
  
  welcomeRequests.set(key, {
    address,
    timestamp: Date.now(),
    status: 'pending',
  });
  
  notifyListeners();
  return true;
}

export function markWelcomeRequestApproved(address: `0x${string}`) {
  const key = address.toLowerCase();
  saveClaimedWallet(key);
  if (welcomeRequests.has(key)) {
    welcomeRequests.set(key, {
      ...welcomeRequests.get(key)!,
      status: 'approved',
    });
  } else {
    welcomeRequests.set(key, {
      address,
      timestamp: Date.now(),
      status: 'approved',
    });
  }
  notifyListeners();
}

export function isWelcomeClaimed(address: `0x${string}` | undefined, onChainScore?: bigint): boolean {
  if (!address) return false;
  const key = address.toLowerCase();
  // If on-chain activity score is already > 0 (e.g. 2 or higher), they already have activity points
  if (onChainScore !== undefined && onChainScore > 0n) {
    return true;
  }
  // If marked approved in this session or local storage
  if (getStoredClaimedWallets().has(key)) {
    return true;
  }
  const req = welcomeRequests.get(key);
  return req !== undefined && req.status === 'approved';
}

export function getWelcomeRequests(): WelcomeRequest[] {
  return Array.from(welcomeRequests.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export function getPendingWelcomeRequests(): WelcomeRequest[] {
  return getWelcomeRequests().filter(r => r.status === 'pending');
}

export function hasPendingWelcomeRequest(address: `0x${string}` | undefined): boolean {
  if (!address) return false;
  const req = welcomeRequests.get(address.toLowerCase());
  return req !== undefined && req.status === 'pending';
}

export function subscribeWelcomeRequests(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function generateWelcomeRequestMessage(address: string): string {
  return `[Vouchera Welcome Reward Request]\nWallet Address: ${address}\nRequested Amount: +2 Activity Points (One-Time Fixed Starter Reward)\nNetwork: Bohr Testnet (Chain ID 968)\nContract: 0xCad5b0572f4bD9732d26B319530254b477dA9711`;
}

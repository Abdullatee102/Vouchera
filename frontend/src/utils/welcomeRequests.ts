export interface WelcomeRequest {
  address: `0x${string}`;
  timestamp: number;
  status: 'pending' | 'approved';
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
  if (welcomeRequests.has(key)) {
    welcomeRequests.set(key, {
      ...welcomeRequests.get(key)!,
      status: 'approved',
    });
    notifyListeners();
  }
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
  return `[Vouchera Welcome Reward Request]\nWallet Address: ${address}\nRequested Amount: +2 Activity Points (Fixed Starter Reward)\nNetwork: Bohr Testnet (Chain ID 968)\nContract: 0xCad5b0572f4bD9732d26B319530254b477dA9711`;
}


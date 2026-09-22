// Vouchera Type Definitions
// Using const objects instead of enums (erasableSyntaxOnly compatibility)

export const ProgramStatus = {
  Draft: 0,
  Active: 1,
  Paused: 2,
  Closed: 3,
} as const;
export type ProgramStatus = typeof ProgramStatus[keyof typeof ProgramStatus];

export const VoucherStatus = {
  Active: 0,
  PartiallyRedeemed: 1,
  FullyRedeemed: 2,
  Expired: 3,
  Cancelled: 4,
} as const;
export type VoucherStatus = typeof VoucherStatus[keyof typeof VoucherStatus];

export interface Organization {
  id: bigint;
  owner: `0x${string}`;
  name: string;
  description: string;
  createdAt: bigint;
  active: boolean;
}

export interface VoucherProgram {
  id: bigint;
  organizationId: bigint;
  name: string;
  description: string;
  categoryCode: `0x${string}`;
  totalFunded: bigint;
  totalAllocated: bigint;
  totalRedeemed: bigint;
  totalRefunded: bigint;
  createdAt: bigint;
  startsAt: bigint;
  expiresAt: bigint;
  status: ProgramStatus;
}

export interface Voucher {
  id: bigint;
  organizationId: bigint;
  programId: bigint;
  beneficiary: `0x${string}`;
  allocatedAmount: bigint;
  remainingAmount: bigint;
  redeemedAmount: bigint;
  categoryCode: `0x${string}`;
  allowedMerchant: `0x${string}`;
  issuedAt: bigint;
  expiresAt: bigint;
  status: VoucherStatus;
}

export interface Merchant {
  account: `0x${string}`;
  name: string;
  categoryCode: `0x${string}`;
  active: boolean;
}

export interface Redemption {
  id: bigint;
  voucherId: bigint;
  organizationId: bigint;
  programId: bigint;
  beneficiary: `0x${string}`;
  merchant: `0x${string}`;
  amount: bigint;
  purchaseReference: string;
  redeemedAt: bigint;
}

export function getProgramStatusLabel(status: ProgramStatus): string {
  const map: Record<number, string> = {
    [ProgramStatus.Draft]: 'Draft',
    [ProgramStatus.Active]: 'Active',
    [ProgramStatus.Paused]: 'Paused',
    [ProgramStatus.Closed]: 'Closed',
  };
  return map[status] ?? 'Unknown';
}

export function getVoucherStatusLabel(status: VoucherStatus): string {
  const map: Record<number, string> = {
    [VoucherStatus.Active]: 'Active',
    [VoucherStatus.PartiallyRedeemed]: 'Partially Redeemed',
    [VoucherStatus.FullyRedeemed]: 'Fully Redeemed',
    [VoucherStatus.Expired]: 'Expired',
    [VoucherStatus.Cancelled]: 'Cancelled',
  };
  return map[status] ?? 'Unknown';
}

export function getVoucherStatusColor(status: VoucherStatus): string {
  const map: Record<number, string> = {
    [VoucherStatus.Active]: '#22c55e',
    [VoucherStatus.PartiallyRedeemed]: '#06b6d4',
    [VoucherStatus.FullyRedeemed]: '#64748b',
    [VoucherStatus.Expired]: '#f59e0b',
    [VoucherStatus.Cancelled]: '#ef4444',
  };
  return map[status] ?? '#64748b';
}

export function getProgramStatusColor(status: ProgramStatus): string {
  const map: Record<number, string> = {
    [ProgramStatus.Draft]: '#64748b',
    [ProgramStatus.Active]: '#22c55e',
    [ProgramStatus.Paused]: '#f59e0b',
    [ProgramStatus.Closed]: '#ef4444',
  };
  return map[status] ?? '#64748b';
}


import { useReadContract } from 'wagmi';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS } from '../config/contracts';
import type { Organization, VoucherProgram, Voucher, Merchant, Redemption } from '../types';

const CONTRACT_CONFIG = {
  address: VOUCHERA_CONTRACT_ADDRESS,
  abi: VOUCHERA_ABI,
};

export function useProtocolAdmin() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'protocolAdmin',
  }) as { data: `0x${string}` | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrganizationThreshold() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'organizationCreationThreshold',
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };
}

export function useActivityScore(address: `0x${string}` | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'activityScore',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => void };
}

export function useIsEligible(address: `0x${string}` | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'isEligibleToCreateOrganization',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: boolean | undefined; isLoading: boolean; refetch: () => void };
}

export function useAllOrganizations() {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getAllOrganizations',
  }) as { data: Organization[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrganizationsByOwner(owner: `0x${string}` | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrganizationsByOwner',
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  }) as { data: Organization[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrganization(orgId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrganization',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: Organization | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrganizationStats(orgId: bigint | undefined) {
  const result = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrganizationStats',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: readonly [bigint, bigint, bigint, bigint] | undefined; isLoading: boolean; refetch: () => void };

  return result.data ? {
    programCount: result.data[0],
    merchantCount: result.data[1],
    beneficiaryCount: result.data[2],
    redemptionCount: result.data[3]
  } : undefined;
}

export function useProgram(programId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getProgram',
    args: programId !== undefined ? [programId] : undefined,
    query: { enabled: programId !== undefined },
  }) as { data: VoucherProgram | undefined; isLoading: boolean; refetch: () => void };
}

export function useProgramsByOrganization(orgId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getProgramsByOrganization',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: VoucherProgram[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useProgramStats(programId: bigint | undefined) {
  const result = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getProgramStats',
    args: programId !== undefined ? [programId] : undefined,
    query: { enabled: programId !== undefined },
  }) as { data: readonly [bigint, bigint, bigint, bigint, bigint] | undefined; isLoading: boolean; refetch: () => void };

  return result.data ? {
    totalFunded: result.data[0],
    totalAllocated: result.data[1],
    totalRedeemed: result.data[2],
    totalRefunded: result.data[3],
    availableFunds: result.data[4]
  } : undefined;
}

export function useVouchersByBeneficiary(address: `0x${string}` | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getVouchersByBeneficiary',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) as { data: Voucher[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useVoucher(voucherId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getVoucher',
    args: voucherId !== undefined ? [voucherId] : undefined,
    query: { enabled: voucherId !== undefined },
  }) as { data: Voucher | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrgMerchants(orgId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrgMerchants',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: Merchant[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrgBeneficiaries(orgId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrgBeneficiaries',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: `0x${string}`[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useIsBeneficiaryApproved(orgId: bigint | undefined, address: `0x${string}` | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'isBeneficiaryApproved',
    args: orgId !== undefined && address ? [orgId, address] : undefined,
    query: { enabled: orgId !== undefined && !!address },
  }) as { data: boolean | undefined; isLoading: boolean; refetch: () => void };
}

export function useAllRedemptions(offset: bigint = 0n, limit: bigint = 100n) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getAllRedemptions',
    args: [offset, limit],
  }) as { data: Redemption[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useOrgRedemptions(orgId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getOrgRedemptions',
    args: orgId !== undefined ? [orgId] : undefined,
    query: { enabled: orgId !== undefined },
  }) as { data: Redemption[] | undefined; isLoading: boolean; refetch: () => void };
}

export function useVoucherRedemptions(voucherId: bigint | undefined) {
  return useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getVoucherRedemptions',
    args: voucherId !== undefined ? [voucherId] : undefined,
    query: { enabled: voucherId !== undefined },
  }) as { data: Redemption[] | undefined; isLoading: boolean; refetch: () => void };
}

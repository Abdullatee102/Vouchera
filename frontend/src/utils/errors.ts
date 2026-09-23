import { BaseError, UserRejectedRequestError } from 'viem';

/**
 * Decodes Solidity custom errors, RPC errors, user rejection, and network errors
 * into human-readable, plain-language explanations for Vouchera.
 */
export function decodeContractError(error: unknown): string {
  if (!error) return '';

  const err = error as any;
  const msg = err?.message || String(error);

  // 1. User rejection
  if (
    err instanceof UserRejectedRequestError ||
    err?.name === 'UserRejectedRequestError' ||
    msg.includes('User rejected') ||
    msg.includes('user rejected') ||
    msg.includes('rejected the request') ||
    msg.includes('User denied transaction')
  ) {
    return 'Transaction cancelled: You rejected the confirmation in your wallet.';
  }

  // 2. Insufficient BOT funds / gas
  if (
    msg.includes('insufficient funds') ||
    msg.includes('exceeds balance') ||
    msg.includes('gas required exceeds allowance')
  ) {
    return 'Insufficient balance: Your wallet does not have enough native BOT to cover this transaction amount and gas fees.';
  }

  // 3. Custom Solidity contract errors from Vouchera.sol
  if (msg.includes('NotProtocolAdmin')) {
    return 'Unauthorized: Only the Protocol Admin wallet can perform this protocol-level action.';
  }
  if (msg.includes('NotOrganizationOwner')) {
    return 'Unauthorized: Only the sovereign owner of this organization can perform this action.';
  }
  if (msg.includes('NotBeneficiary')) {
    return 'Unauthorized: Only the designated beneficiary wallet can redeem or manage this voucher.';
  }
  if (msg.includes('NotEligibleToCreateOrganization')) {
    return 'Eligibility requirement not met: Your activity score is below the required organization creation threshold.';
  }
  if (msg.includes('ProgramNotActive')) {
    return 'Program is not active: You must deposit BOT funds and activate this program before vouchers can be issued.';
  }
  if (msg.includes('ProgramAlreadyClosed')) {
    return 'This subsidy program has been permanently closed.';
  }
  if (msg.includes('OrganizationInactive')) {
    return 'This organization is currently inactive.';
  }
  if (msg.includes('OrganizationNotFound')) {
    return 'The requested organization was not found on-chain.';
  }
  if (msg.includes('ProgramNotFound')) {
    return 'The requested subsidy program was not found on-chain.';
  }
  if (msg.includes('VoucherNotFound')) {
    return 'The requested voucher was not found on-chain.';
  }
  if (msg.includes('InsufficientProgramFunds')) {
    return 'Insufficient program liquidity: The program pool does not have enough unallocated BOT to back this voucher.';
  }
  if (msg.includes('InsufficientVoucherBalance')) {
    return 'Insufficient voucher balance: Requested redemption amount exceeds the remaining voucher value.';
  }
  if (msg.includes('AmountIsZero')) {
    return 'Invalid amount: Amount must be strictly greater than 0 BOT.';
  }
  if (msg.includes('BeneficiaryAlreadyApproved')) {
    return 'This wallet is already an approved beneficiary for this organization.';
  }
  if (msg.includes('BeneficiaryNotApproved')) {
    return 'This recipient wallet is not an approved beneficiary under this organization.';
  }
  if (msg.includes('MerchantAlreadyApproved')) {
    return 'This merchant wallet is already registered for this organization.';
  }
  if (msg.includes('MerchantNotApproved')) {
    return 'This merchant is not registered or approved under this organization.';
  }
  if (msg.includes('MerchantNotActive')) {
    return 'This merchant store is currently deactivated by the organization.';
  }
  if (msg.includes('MerchantCategoryMismatch')) {
    return 'Category mismatch: Merchant category does not match this voucher\'s restricted subsidy category.';
  }
  if (msg.includes('WrongMerchant')) {
    return 'Merchant restricted: This voucher can only be redeemed at the designated merchant store address.';
  }
  if (msg.includes('VoucherExpired')) {
    return 'Voucher expired: This voucher has passed its expiration timestamp.';
  }
  if (msg.includes('VoucherNotExpired')) {
    return 'Voucher is not expired yet. Funds can only be reclaimed after expiration.';
  }
  if (msg.includes('VoucherIsCancelled') || msg.includes('VoucherAlreadyCancelled')) {
    return 'This voucher has been cancelled.';
  }
  if (msg.includes('VoucherFullyRedeemed')) {
    return 'This voucher has already been 100% redeemed.';
  }
  if (msg.includes('BeneficiaryCannotSelfApprove')) {
    return 'Self-approval not allowed: Organization owners cannot approve their own wallet as a beneficiary.';
  }
  if (msg.includes('MerchantCannotSelfApprove')) {
    return 'Self-approval not allowed: Organization owners cannot approve their own wallet as a merchant.';
  }
  if (msg.includes('InvalidProgramTransition')) {
    return 'Invalid program transition: Cannot activate a program that is already active or closed.';
  }
  if (msg.includes('InvalidExpiry') || msg.includes('ProgramExpired')) {
    return 'Invalid expiration: Expiration timestamp must be in the future.';
  }
  if (msg.includes('EmptyName')) {
    return 'Invalid input: Name cannot be blank.';
  }
  if (msg.includes('EmptyDescription')) {
    return 'Invalid input: Description cannot be blank.';
  }
  if (msg.includes('InvalidAddress')) {
    return 'Invalid Ethereum address provided.';
  }
  if (msg.includes('NativeTrasferFailed')) {
    return 'Native BOT token transfer failed on Bohr Testnet.';
  }

  // 4. Viem / Wagmi BaseError shortMessage
  if (err instanceof BaseError) {
    if (err.shortMessage) {
      return err.shortMessage;
    }
  }

  // Fallback
  return err.shortMessage || (msg.length > 180 ? `${msg.slice(0, 180)}...` : msg);
}


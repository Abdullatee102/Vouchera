import { useAccount } from 'wagmi';
import { useProtocolAdmin, useActivityScore, useOrganizationThreshold, useOrganizationsByOwner, useVouchersByBeneficiary } from '../hooks/useVouchera';
import Tooltip from './Tooltip';

export default function RoleBadge() {
  const { address, isConnected } = useAccount();
  const { data: protocolAdmin } = useProtocolAdmin();
  const { data: score } = useActivityScore(address);
  const { data: threshold } = useOrganizationThreshold();
  const { data: myOrgs } = useOrganizationsByOwner(address);
  const { data: myVouchers } = useVouchersByBeneficiary(address);

  if (!isConnected || !address) {
    return (
      <div className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>👤 Guest (Disconnected)</span>
        <Tooltip content="Connect your wallet to participate in the Vouchera protocol." />
      </div>
    );
  }

  const isAdmin = protocolAdmin && address.toLowerCase() === protocolAdmin.toLowerCase();
  const orgCount = myOrgs?.length || 0;
  const isOwner = orgCount > 0;
  const voucherCount = myVouchers?.length || 0;
  const isBeneficiary = voucherCount > 0;
  const isEligible = score !== undefined && threshold !== undefined && score >= threshold;

  if (isAdmin) {
    return (
      <div className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>👑 Protocol Admin</span>
        <Tooltip content="You have protocol-level administrative authority to record activity and configure eligibility thresholds." />
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>🏛️ Organization Owner ({orgCount})</span>
        <Tooltip content={`You manage ${orgCount} organization(s). You can create subsidy programs, fund them with BOT, and issue restricted vouchers.`} />
      </div>
    );
  }

  if (isBeneficiary) {
    return (
      <div className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>🎫 Beneficiary ({voucherCount} Vouchers)</span>
        <Tooltip content="Your wallet is an approved recipient of subsidy vouchers. You can redeem vouchers with approved merchants." />
      </div>
    );
  }

  if (isEligible) {
    return (
      <div className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span>✓ Eligible Creator ({score?.toString()} pts)</span>
        <Tooltip content="You have achieved the required on-chain activity score. You can create your own organization now." />
      </div>
    );
  }

  return (
    <div className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span>⏳ Participant ({score !== undefined ? score.toString() : '0'}/{threshold !== undefined ? threshold.toString() : '10'} pts)</span>
      <Tooltip content="Your wallet is below the organization creation threshold. Learn how activity is recorded to unlock organization creation." />
    </div>
  );
}


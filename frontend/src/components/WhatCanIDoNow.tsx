import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import {
  useProtocolAdmin,
  useActivityScore,
  useOrganizationThreshold,
  useOrganizationsByOwner,
  useVouchersByBeneficiary
} from '../hooks/useVouchera';
import Tooltip from './Tooltip';
import WelcomeRequestCard from './WelcomeRequestCard';

export default function WhatCanIDoNow() {
  const { address, isConnected } = useAccount();
  const { data: protocolAdmin } = useProtocolAdmin();
  const { data: score } = useActivityScore(address);
  const { data: threshold } = useOrganizationThreshold();
  const { data: myOrgs } = useOrganizationsByOwner(address);
  const { data: myVouchers } = useVouchersByBeneficiary(address);

  const isAdmin = isConnected && !!address && !!protocolAdmin && address.toLowerCase() === protocolAdmin.toLowerCase();
  const orgCount = myOrgs?.length || 0;
  const isOwner = orgCount > 0;
  const voucherCount = myVouchers?.length || 0;
  const isBeneficiary = voucherCount > 0;
  const isEligible = score !== undefined && threshold !== undefined && score >= threshold;

  // Render Disconnected State
  if (!isConnected || !address) {
    return (
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-border)', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              🧭 What Can I Do Right Now?
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              You are currently viewing Vouchera as an anonymous guest.
            </p>
          </div>
          <span className="badge badge-muted">Status: Disconnected</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
              ✓ Unlocked Actions:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li>Browse all verified organizations</li>
              <li>Inspect active subsidy programs</li>
              <li>View live on-chain redemptions</li>
              <li>Learn how Vouchera works</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
              🔒 Requires Wallet Connection:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
              <li>Check your organization eligibility score</li>
              <li>Create & manage subsidy organizations</li>
              <li>View and redeem assigned vouchers</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Recommended Next Step:</strong>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>Connect your Web3 wallet using the button at the top right to start.</p>
          </div>
          <Link to="/how-it-works" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            📖 How Vouchera Works &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Render Connected: Protocol Admin State
  if (isAdmin) {
    return (
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-warning)', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-warning)' }}>
              ⚡ Protocol Admin Active
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              You are connected with the root protocol governance wallet.
            </p>
          </div>
          <span className="badge badge-warning">Protocol Admin</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
              ✓ Protocol Governance Privileges:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li>Record on-chain activity scores for community participants</li>
              <li>Adjust organization creation threshold requirements</li>
              <li>Inspect global protocol metrics across all organizations</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              🛡️ Decentralization Boundary:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
              <li>Cannot seize or redirect individual organization funds</li>
              <li>Cannot issue vouchers on behalf of independent organizations</li>
              <li>Organizations operate sovereignly once created</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Recommended Admin Action:</strong>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>Open the Protocol Admin dashboard to record user activity or update thresholds.</p>
          </div>
          <Link to="/admin" className="btn btn-warning" style={{ fontSize: '0.85rem' }}>
            ⚡ Open Admin Dashboard &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Render Connected: Organization Owner State
  if (isOwner && myOrgs && myOrgs.length > 0) {
    const firstOrg = myOrgs[0];
    return (
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-primary)', background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              🏛️ Organization Owner Active
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              You own <strong>{orgCount}</strong> organization(s). You have sovereign control over your subsidy pools.
            </p>
          </div>
          <span className="badge badge-primary">Owner Mode</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
              ✓ You Can Do Right Now:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li>Create new voucher subsidy programs</li>
              <li>Fund programs with native BOT</li>
              <li>Approve verified beneficiaries & merchants</li>
              <li>Issue restricted, non-transferable vouchers</li>
              <li>Reclaim expired/cancelled voucher funds</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              🛡️ Invariant Rules Enforced:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
              <li>Cannot issue unfunded vouchers (liabilities &le; BOT pool)</li>
              <li>Cannot self-approve as beneficiary of own org</li>
              <li>Cannot manage or withdraw other organizations' funds</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Recommended Next Step:</strong>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>
              Open your organization dashboard to manage programs, fund pools, and issue vouchers.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/organizations/${firstOrg.id}`} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              Manage {firstOrg.name} &rarr;
            </Link>
            <Link to="/organizations" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              All Orgs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Connected: Beneficiary State
  if (isBeneficiary) {
    return (
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-success)', background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-success)' }}>
              🎫 Beneficiary Active — {voucherCount} Voucher(s) Available
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Your wallet has verified subsidy vouchers allocated by approved organizations.
            </p>
          </div>
          <span className="badge badge-success">Beneficiary</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
              ✓ You Can Do:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li>View all allocated voucher balances</li>
              <li>Inspect voucher category restrictions (Food, Healthcare, etc.)</li>
              <li>Select approved merchants & redeem vouchers</li>
              <li>Settle native BOT directly to merchants</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
              🔒 Protected Rules:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
              <li>Vouchers are non-transferable (cannot be sent to others)</li>
              <li>Can only be spent at approved category merchants</li>
              <li>Redemptions cannot exceed remaining balance</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Recommended Next Step:</strong>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>Check your voucher details and select an approved merchant for redemption.</p>
          </div>
          <Link to="/my-vouchers" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            Go to My Vouchers &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Render Connected: Eligible Wallet (Eligible to create Org)
  if (isEligible) {
    return (
      <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-success)', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-success)' }}>
              🎉 You Are Eligible to Create an Organization!
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Activity Score: <strong>{score?.toString()}</strong> / {threshold?.toString()} points. You satisfy the on-chain threshold gate.
            </p>
          </div>
          <span className="badge badge-success">✓ Eligible</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
              ✓ Unlocked Right Now:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
              <li>Create your independent organization on Bohr Testnet</li>
              <li>Become sovereign Organization Owner</li>
              <li>Set up and manage your own subsidy programs</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.5rem' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              🔒 What's Next (After Creation):
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
              <li>Define program rules (Food, Healthcare, Education)</li>
              <li>Deposit native BOT into program funding pool</li>
              <li>Approve beneficiaries & merchants</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Recommended Next Step:</strong>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>Create your organization now to become an authorized issuer.</p>
          </div>
          <Link to="/organizations" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            + Create Organization Now &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Render Connected: Below Eligibility Threshold (New / Standard Participant)
  const currentScore = score !== undefined ? score : 0n;
  const currentThreshold = threshold !== undefined ? threshold : 10n;
  const pointsNeeded = currentThreshold > currentScore ? currentThreshold - currentScore : 0n;
  const progressPercent = currentThreshold > 0n
    ? Math.min(100, Number((currentScore * 100n) / currentThreshold))
    : 0;

  return (
    <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-border)', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>
            🧭 What Can I Do Right Now?
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            Wallet Status: <strong>Connected Participant</strong> ({currentScore.toString()} / {currentThreshold.toString()} points)
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-warning">
            {pointsNeeded > 0n ? `Needs ${pointsNeeded.toString()} More Points` : 'Threshold Reached'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.785rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
          <span>Organization Creation Gate</span>
          <span>{progressPercent}% completed ({currentScore.toString()} / {currentThreshold.toString()} pts)</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Free Welcome Activity Points Card */}
      <WelcomeRequestCard />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-success)', fontSize: '0.9rem' }}>
            ✓ Currently Available to You:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
            <li>Browse verified organizations & subsidy programs</li>
            <li>Inspect on-chain redemptions and contract settlements</li>
            <li>Receive vouchers if an organization approves your wallet</li>
            <li>Check your real-time activity score on Bohr Testnet</li>
          </ul>
        </div>

        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
            🔒 Locked (Requires Eligibility):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--color-muted)', lineHeight: '1.6' }}>
            <li>
              <strong>Create Organization</strong> — You need {pointsNeeded.toString()} more activity points to become eligible.
              <Tooltip content="Enforces on-chain spam prevention and verified subsidy governance." />
            </li>
            <li>
              <strong>Issue Vouchers</strong> — Requires creating and owning an organization.
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>
            You need {pointsNeeded.toString()} more activity points to become eligible.
          </strong>
          <p style={{ margin: '0.15rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.825rem' }}>
            Activity points are recorded on-chain by the Protocol Admin for verified protocol participants and partner institutions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/how-it-works#eligibility" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Learn How Eligibility Works &rarr;
          </Link>
          <Link to="/organizations" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Browse Orgs
          </Link>
        </div>
      </div>
    </div>
  );
}

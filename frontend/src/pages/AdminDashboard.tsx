import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS, BOHR_EXPLORER } from '../config/contracts';
import { useProtocolAdmin, useOrganizationThreshold, useAllOrganizations, useActivityScore, useIsEligible } from '../hooks/useVouchera';
import TransactionStatus from '../components/TransactionStatus';
import { useQueryClient } from '@tanstack/react-query';
import { formatAddress } from '../utils/formatting';

function UserActivityPreview({
  targetAddress,
  threshold,
  additionalAmount,
}: {
  targetAddress: `0x${string}` | undefined;
  threshold: bigint | undefined;
  additionalAmount: string;
}) {
  const { data: score, isLoading } = useActivityScore(targetAddress);
  const { data: isEligible } = useIsEligible(targetAddress);

  if (!targetAddress || targetAddress.length !== 42) {
    return null;
  }

  const currentScore = score !== undefined ? score : 0n;
  const currentThreshold = threshold !== undefined ? threshold : 10n;
  const added = additionalAmount && !isNaN(parseInt(additionalAmount)) ? BigInt(parseInt(additionalAmount)) : 0n;
  const expectedScore = currentScore + added;
  const willBeEligible = expectedScore >= currentThreshold && currentThreshold > 0n;

  return (
    <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', border: '1px solid var(--color-border)', margin: '1rem 0', fontSize: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <strong style={{ color: 'var(--color-primary)' }}>Target Wallet Real-Time State</strong>
        <span className={`badge ${isEligible ? 'badge-success' : 'badge-warning'}`}>
          {isLoading ? 'Checking...' : isEligible ? '✓ Currently Eligible' : '⏳ Not Eligible'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.785rem' }}>Current Activity Score:</span>
          <p style={{ margin: '0.1rem 0 0 0', fontWeight: 'bold' }}>
            {isLoading ? '...' : `${currentScore.toString()} / ${currentThreshold.toString()} pts`}
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.785rem' }}>Missing to Threshold:</span>
          <p style={{ margin: '0.1rem 0 0 0', color: currentScore >= currentThreshold ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 'bold' }}>
            {currentScore >= currentThreshold ? '0 pts (Met)' : `${(currentThreshold - currentScore).toString()} pts`}
          </p>
        </div>
      </div>

      {added > 0n && (
        <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.35rem', border: '1px solid rgba(6, 182, 212, 0.2)', marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--color-text)', fontSize: '0.8rem' }}>
            ⚡ Preview after +${added.toString()} pts: <strong>${expectedScore.toString()} / ${currentThreshold.toString()} pts</strong> ({willBeEligible ? '🎉 Will Become Eligible' : 'Still Needs Points'})
          </span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: admin } = useProtocolAdmin();
  const { data: threshold, refetch: refetchThreshold } = useOrganizationThreshold();
  const { data: orgs, refetch: refetchOrgs } = useAllOrganizations();

  const [newThreshold, setNewThreshold] = useState('');
  const [activityUser, setActivityUser] = useState('');
  const [activityAmount, setActivityAmount] = useState('2');

  const { writeContract: writeThreshold, data: hashThresh, isPending: pendingThresh, error: errThresh } = useWriteContract();
  const { writeContract: writeActivity, data: hashAct, isPending: pendingAct, error: errAct } = useWriteContract();

  const isAdmin = address && admin && address.toLowerCase() === admin.toLowerCase();

  const validAddress = activityUser.startsWith('0x') && activityUser.length === 42
    ? (activityUser as `0x${string}`)
    : undefined;

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--color-danger)' }}>Unauthorized Access</h2>
        <p style={{ color: 'var(--color-muted)' }}>You must be connected with the Protocol Admin wallet ({admin ? formatAddress(admin) : 'Deployer'}) to access protocol settings.</p>
      </div>
    );
  }

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreshold) return;
    writeThreshold({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'setOrganizationCreationThreshold',
      args: [BigInt(newThreshold)],
    });
  };

  const handleRecordActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validAddress || !activityAmount || parseInt(activityAmount) <= 0) return;
    writeActivity({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'recordActivity',
      args: [validAddress, BigInt(activityAmount)],
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    refetchThreshold();
    refetchOrgs();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>Protocol Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Manage protocol-level parameters and record verified on-chain activity scores for participants.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleRefresh} style={{ fontSize: '0.85rem' }}>
          ↻ Refresh State
        </button>
      </div>

      <div className="grid md:grid-cols-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card 1: Protocol Threshold Setting */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-warning)' }}>⚙️ Protocol Threshold</h2>
            <span className="badge badge-warning">Admin Only</span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Minimum activity points required before any wallet can call <code>createOrganization</code>.
          </p>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.45rem', marginBottom: '1.25rem' }}>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Current On-Chain Threshold:</span>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
              {threshold !== undefined ? `${threshold.toString()} points` : 'Loading...'}
            </p>
          </div>
          <form onSubmit={handleUpdateThreshold}>
            <label className="label">Update Threshold (Points)</label>
            <input 
              type="number" 
              className="input" 
              value={newThreshold} 
              onChange={e => setNewThreshold(e.target.value)} 
              placeholder={threshold ? threshold.toString() : '10'}
              min="0"
              required 
            />
            <button type="submit" className="btn btn-warning" style={{ width: '100%' }} disabled={pendingThresh || !newThreshold}>
              {pendingThresh ? 'Submitting to Bohr...' : 'Update Threshold'}
            </button>
            <TransactionStatus hash={hashThresh} isPending={pendingThresh} error={errThresh} onSuccess={handleRefresh} />
          </form>
        </div>

        {/* Card 2: Contextual User Activity Awarding */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>🏅 Record User Activity</h2>
            <span className="badge badge-primary">On-Chain Activity Gate</span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Grant activity points on-chain for verified participants or partner organizations.
          </p>

          {/* Quick-select candidate org owners if available */}
          {orgs && orgs.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Quick Select Known Organization Owner:</label>
              <select
                className="input"
                style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}
                onChange={e => {
                  if (e.target.value) setActivityUser(e.target.value);
                }}
                defaultValue=""
              >
                <option value="">-- Choose Known Org Owner or Enter Below --</option>
                {orgs.map(o => (
                  <option key={o.id.toString()} value={o.owner}>
                    {o.name} (Owner: {formatAddress(o.owner)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Participant Wallet Address *</label>
            <input 
              type="text" 
              className="input" 
              value={activityUser} 
              onChange={e => setActivityUser(e.target.value.trim())} 
              placeholder="0x..." 
              required 
            />

            {/* Contextual Live Preview of User State */}
            <UserActivityPreview
              targetAddress={validAddress}
              threshold={threshold}
              additionalAmount={activityAmount}
            />

            {/* Quick Action: 2 Welcome Points */}
            {validAddress && (
              <div style={{ padding: '0.85rem', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ color: '#c084fc', fontSize: '0.9rem' }}>🎁 Award 2 Welcome Points</strong>
                  <span className="badge badge-primary">+2 Points</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
                  Grant 2 initial activity points to new participants on-chain via <code>recordActivity(user, 2)</code>.
                </p>

                {/* Prevention Notice */}
                <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.35rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--color-warning)', lineHeight: '1.3' }}>
                  ⚠️ <em>Welcome points are administered manually on-chain. Confirm this wallet has not already received its welcome reward before awarding again.</em>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', border: 'none', color: '#fff', fontSize: '0.85rem' }}
                  disabled={pendingAct || !validAddress}
                  onClick={() => {
                    writeActivity({
                      address: VOUCHERA_CONTRACT_ADDRESS,
                      abi: VOUCHERA_ABI,
                      functionName: 'recordActivity',
                      args: [validAddress, 2n],
                    });
                  }}
                >
                  {pendingAct ? 'Submitting to Bohr...' : '🎁 Confirm & Award 2 Welcome Points'}
                </button>
              </div>
            )}

            <form onSubmit={handleRecordActivity} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <label className="label">Custom Points Adjustment (Integer) *</label>
              <input 
                type="number" 
                className="input" 
                value={activityAmount} 
                onChange={e => setActivityAmount(e.target.value)} 
                min="1"
                placeholder="e.g. 5"
                required 
              />

              {validAddress && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
                  Custom Adjustment: You are awarding <strong>{activityAmount || 0} activity points</strong> to <code>{formatAddress(validAddress)}</code>.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={pendingAct || !validAddress || !activityAmount || parseInt(activityAmount) <= 0}
              >
                {pendingAct ? 'Submitting to Bohr...' : `Award Custom ${activityAmount || 0} Points`}
              </button>
            </form>

            <TransactionStatus
              hash={hashAct}
              isPending={pendingAct}
              error={errAct}
              successMessage="✓ Activity score updated successfully on Bohr Testnet!"
              onSuccess={() => {
                setActivityAmount('2');
                handleRefresh();
              }}
            />
          </div>
        </div>
      </div>

      {/* System Organizations Table */}
      <div className="card">
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>All Registered Organizations (System View)</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Independent organizations established on Bohr Testnet. Note: Protocol Admin cannot withdraw or alter organization funding pools.
        </p>
        {orgs && orgs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Owner Wallet</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map(org => (
                  <tr key={org.id.toString()} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>#{org.id.toString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{org.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>
                      <a href={`${BOHR_EXPLORER}address/${org.owner}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                        {formatAddress(org.owner)}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${org.active ? 'badge-success' : 'badge-danger'}`}>
                        {org.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setActivityUser(org.owner)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Inspect Owner Activity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--color-muted)', padding: '2rem 0', textAlign: 'center' }}>
            No organizations registered yet on the protocol.
          </p>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS, BOHR_EXPLORER } from '../config/contracts';
import { useProtocolAdmin, useOrganizationThreshold, useAllOrganizations, useActivityScore, useIsEligible } from '../hooks/useVouchera';
import TransactionStatus from '../components/TransactionStatus';
import { useQueryClient } from '@tanstack/react-query';
import { formatAddress } from '../utils/formatting';
import { getPendingWelcomeRequests, markWelcomeRequestApproved, subscribeWelcomeRequests, isWelcomeClaimed, type WelcomeRequest } from '../utils/welcomeRequests';

function UserActivityPreview({
  targetAddress,
  threshold,
  additionalAmount,
  isWelcome = false,
}: {
  targetAddress: `0x${string}` | undefined;
  threshold: bigint | undefined;
  additionalAmount: string;
  isWelcome?: boolean;
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
  const pointsRemaining = currentThreshold > currentScore ? currentThreshold - currentScore : 0n;
  const alreadyClaimed = isWelcome && isWelcomeClaimed(targetAddress, score);

  return (
    <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', border: '1px solid var(--color-border)', margin: '1rem 0', fontSize: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <strong style={{ color: 'var(--color-primary)' }}>Target Wallet Real-Time State</strong>
        <span className={`badge ${alreadyClaimed ? 'badge-success' : isEligible ? 'badge-success' : 'badge-warning'}`}>
          {isLoading ? 'Checking...' : alreadyClaimed ? '✓ Welcome Claimed' : isEligible ? '✓ Currently Eligible' : '⏳ Below Threshold'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.785rem' }}>Current Score:</span>
          <p style={{ margin: '0.1rem 0 0 0', fontWeight: 'bold' }}>
            {isLoading ? '...' : `${currentScore.toString()} / ${currentThreshold.toString()} pts`}
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.785rem' }}>Points Remaining:</span>
          <p style={{ margin: '0.1rem 0 0 0', color: currentScore >= currentThreshold ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 'bold' }}>
            {pointsRemaining === 0n ? '0 pts (Met)' : `${pointsRemaining.toString()} pts`}
          </p>
        </div>
        {isWelcome && (
          <div>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.785rem' }}>Welcome Status:</span>
            <p style={{ margin: '0.1rem 0 0 0', color: alreadyClaimed ? 'var(--color-success)' : '#c084fc', fontWeight: 'bold' }}>
              {alreadyClaimed ? 'Claimed (1x Max)' : '+2 Points (Unclaimed)'}
            </p>
          </div>
        )}
      </div>

      {added > 0n && !alreadyClaimed && (
        <div style={{ padding: '0.5rem', background: isWelcome ? 'rgba(124, 58, 237, 0.1)' : 'rgba(6, 182, 212, 0.08)', borderRadius: '0.35rem', border: `1px solid ${isWelcome ? 'rgba(124, 58, 237, 0.25)' : 'rgba(6, 182, 212, 0.2)'}`, marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.8rem' }}>
            <span>
              ⚡ Projected Score after <strong>+${added.toString()} pts</strong>: <strong style={{ color: 'var(--color-text)' }}>${expectedScore.toString()} / ${currentThreshold.toString()} pts</strong>
            </span>
            <span style={{ color: willBeEligible ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600 }}>
              {willBeEligible ? '🎉 Will Satisfy Org Creation Gate' : `Needs ${(currentThreshold - expectedScore).toString()} more pts`}
            </span>
          </div>
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

  // Welcome Requests State
  const [welcomeQueue, setWelcomeQueue] = useState<WelcomeRequest[]>([]);
  const [welcomeUser, setWelcomeUser] = useState('');

  // General Activity State
  const [newThreshold, setNewThreshold] = useState('');
  const [generalUser, setGeneralUser] = useState('');
  const [generalAmount, setGeneralAmount] = useState('5');

  const validWelcomeAddress = welcomeUser.startsWith('0x') && welcomeUser.length === 42
    ? (welcomeUser as `0x${string}`)
    : undefined;

  const validGeneralAddress = generalUser.startsWith('0x') && generalUser.length === 42
    ? (generalUser as `0x${string}`)
    : undefined;

  const { data: welcomeScore, refetch: refetchWelcomeScore } = useActivityScore(validWelcomeAddress);
  const isWelcomeAlreadyClaimed = isWelcomeClaimed(validWelcomeAddress, welcomeScore);

  // Contract Writes
  const { writeContract: writeThreshold, data: hashThresh, isPending: pendingThresh, error: errThresh } = useWriteContract();
  const { writeContract: writeWelcome, data: hashWelcome, isPending: pendingWelcome, error: errWelcome } = useWriteContract();
  const { writeContract: writeGeneral, data: hashGeneral, isPending: pendingGeneral, error: errGeneral } = useWriteContract();

  const isAdmin = address && admin && address.toLowerCase() === admin.toLowerCase();

  // Subscribe to in-memory welcome requests queue
  useEffect(() => {
    const update = () => setWelcomeQueue(getPendingWelcomeRequests());
    update();
    return subscribeWelcomeRequests(update);
  }, []);

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

  const handleApproveWelcome = (targetAddr: `0x${string}`) => {
    if (!targetAddr || isWelcomeAlreadyClaimed) return;
    writeWelcome({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'recordActivity',
      args: [targetAddr, 2n],
    });
  };

  const handleRecordGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validGeneralAddress || !generalAmount || parseInt(generalAmount) <= 0) return;
    writeGeneral({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'recordActivity',
      args: [validGeneralAddress, BigInt(generalAmount)],
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    refetchThreshold();
    refetchOrgs();
    if (validWelcomeAddress) {
      refetchWelcomeScore();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>Protocol Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Protocol Governance: Manage creation thresholds, approve one-time welcome rewards (+2 pts), and award custom activity points.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleRefresh} style={{ fontSize: '0.85rem' }}>
          ↻ Refresh State
        </button>
      </div>

      {/* Top Protocol Gate Setting */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-warning)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-warning)' }}>⚙️ Organization Creation Threshold Gate</h2>
          <span className="badge badge-warning">Protocol Level</span>
        </div>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          The minimum on-chain activity score required before any wallet can establish a new subsidy organization.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Current On-Chain Threshold:</span>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
              {threshold !== undefined ? `${threshold.toString()} points` : 'Loading...'}
            </p>
          </div>

          <form onSubmit={handleUpdateThreshold} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label className="label" style={{ marginBottom: '0.25rem' }}>Update Threshold (Points)</label>
              <input 
                type="number" 
                className="input" 
                value={newThreshold} 
                onChange={e => setNewThreshold(e.target.value)} 
                placeholder={threshold ? threshold.toString() : '10'}
                min="0"
                required 
              />
            </div>
            <button type="submit" className="btn btn-warning" style={{ padding: '0.6rem 1.25rem' }} disabled={pendingThresh || !newThreshold}>
              {pendingThresh ? 'Submitting to Bohr...' : 'Update Threshold'}
            </button>
          </form>
        </div>
        
        <TransactionStatus hash={hashThresh} isPending={pendingThresh} error={errThresh} onSuccess={handleRefresh} />
      </div>

      {/* Two Core Action Areas: A. Welcome Requests vs B. General Activity Award */}
      <div className="grid md:grid-cols-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* SECTION A: Welcome Activity Requests (Fixed 2 Points, One-Time Max) */}
        <div className="card" style={{ borderLeft: '4px solid #c084fc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🎁</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#c084fc' }}>Welcome Activity Requests</h2>
            </div>
            <span className="badge badge-primary">One-Time (+2 pts)</span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Review new participant requests and award the fixed <strong>2 Welcome Points</strong> starter reward once via <code>recordActivity(user, 2)</code>.
          </p>

          {/* Active Queue from Session */}
          {welcomeQueue.length > 0 ? (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(124, 58, 237, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc' }}>
                📬 Active Incoming Requests ({welcomeQueue.length}):
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {welcomeQueue.map(req => (
                  <div key={req.address} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.35rem 0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.35rem' }}>
                    <span style={{ fontFamily: 'monospace' }}>{formatAddress(req.address)}</span>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => setWelcomeUser(req.address)}
                    >
                      Select & Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '0.45rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              ℹ️ No active in-browser requests in queue. Enter any new wallet address below to review and award welcome points.
            </div>
          )}

          <div>
            <label className="label">Applicant Wallet Address *</label>
            <input 
              type="text" 
              className="input" 
              value={welcomeUser} 
              onChange={e => setWelcomeUser(e.target.value.trim())} 
              placeholder="0x..." 
            />

            {/* Contextual Live Preview for Welcome Request */}
            <UserActivityPreview
              targetAddress={validWelcomeAddress}
              threshold={threshold}
              additionalAmount="2"
              isWelcome={true}
            />

            {validWelcomeAddress && (
              <div style={{ marginTop: '1rem' }}>
                {isWelcomeAlreadyClaimed ? (
                  <div>
                    <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.4rem', marginBottom: '0.85rem', fontSize: '0.8rem', color: 'var(--color-danger)', lineHeight: '1.4' }}>
                      ⛔ <strong>One-Time Limit Reached:</strong> This wallet already has <strong>{welcomeScore?.toString() || 0} activity points</strong> on-chain. Welcome reward cannot be awarded more than once. Use the General Activity Award section on the right for additional points.
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', fontSize: '0.85rem' }}
                      disabled={true}
                    >
                      🚫 Welcome Reward Already Claimed (1x Limit)
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Duplicate Prevention Notice */}
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '0.4rem', marginBottom: '0.85rem', fontSize: '0.785rem', color: 'var(--color-warning)', lineHeight: '1.35' }}>
                      ⚠️ <strong>One-Time Allocation:</strong> Confirm this wallet is a first-time participant. Approving grants exactly 2 activity points on Bohr Testnet.
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', border: 'none', color: '#fff', padding: '0.65rem', fontWeight: 600 }}
                      disabled={pendingWelcome || !validWelcomeAddress}
                      onClick={() => handleApproveWelcome(validWelcomeAddress)}
                    >
                      {pendingWelcome ? 'Submitting +2 Points to Bohr...' : `🎁 Approve +2 Welcome Points for ${formatAddress(validWelcomeAddress)}`}
                    </button>
                  </div>
                )}
              </div>
            )}

            <TransactionStatus
              hash={hashWelcome}
              isPending={pendingWelcome}
              error={errWelcome}
              successMessage="✓ Welcome points (+2 pts) awarded successfully on Bohr Testnet!"
              onSuccess={() => {
                if (validWelcomeAddress) {
                  markWelcomeRequestApproved(validWelcomeAddress);
                }
                handleRefresh();
              }}
            />
          </div>
        </div>

        {/* SECTION B: General Protocol Admin Activity Award (Custom Arbitrary Amount) */}
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏅</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary)' }}>General Activity Award</h2>
            </div>
            <span className="badge badge-primary">Custom Points</span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Award arbitrary activity points (e.g. 5, 10, 25, 100) to verified community contributors, validators, or partner organizations.
          </p>

          {/* Quick-select candidate org owners if available */}
          {orgs && orgs.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" style={{ fontSize: '0.8rem' }}>Quick Select Known Organization Owner:</label>
              <select
                className="input"
                style={{ fontSize: '0.85rem' }}
                onChange={e => {
                  if (e.target.value) setGeneralUser(e.target.value);
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

          <form onSubmit={handleRecordGeneral}>
            <label className="label">Participant Wallet Address *</label>
            <input 
              type="text" 
              className="input" 
              value={generalUser} 
              onChange={e => setGeneralUser(e.target.value.trim())} 
              placeholder="0x..." 
              required 
            />

            {/* Contextual Live Preview for Custom Activity Award */}
            <UserActivityPreview
              targetAddress={validGeneralAddress}
              threshold={threshold}
              additionalAmount={generalAmount}
              isWelcome={false}
            />

            <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
              <label className="label">Points to Award (Integer) *</label>
              <input 
                type="number" 
                className="input" 
                value={generalAmount} 
                onChange={e => setGeneralAmount(e.target.value)} 
                min="1"
                placeholder="e.g. 10"
                required 
              />
            </div>

            {/* Quick Preset Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {['1', '5', '10', '25', '50', '100'].map(val => (
                <button
                  type="button"
                  key={val}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.75rem',
                    background: generalAmount === val ? 'var(--color-primary)' : undefined,
                    color: generalAmount === val ? '#fff' : undefined,
                  }}
                  onClick={() => setGeneralAmount(val)}
                >
                  +{val} pts
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={pendingGeneral || !validGeneralAddress || !generalAmount || parseInt(generalAmount) <= 0}
            >
              {pendingGeneral ? 'Submitting to Bohr...' : `Award ${generalAmount || 0} Points on Bohr Testnet`}
            </button>
          </form>

          <TransactionStatus
            hash={hashGeneral}
            isPending={pendingGeneral}
            error={errGeneral}
            successMessage="✓ Activity score updated successfully on Bohr Testnet!"
            onSuccess={handleRefresh}
          />
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
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Quick Actions</th>
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
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setGeneralUser(org.owner)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Inspect Custom
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setWelcomeUser(org.owner)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Review Welcome
                        </button>
                      </div>
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

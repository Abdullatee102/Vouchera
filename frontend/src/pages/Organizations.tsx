import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Link } from 'react-router-dom';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS } from '../config/contracts';
import { useAllOrganizations, useOrganizationsByOwner, useActivityScore, useOrganizationThreshold } from '../hooks/useVouchera';
import OrgCard from '../components/OrgCard';
import Tooltip from '../components/Tooltip';
import TransactionStatus from '../components/TransactionStatus';
import { useQueryClient } from '@tanstack/react-query';

export default function Organizations() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { data: allOrgs, isLoading: allLoading } = useAllOrganizations();
  const { data: myOrgs, refetch: refetchMyOrgs } = useOrganizationsByOwner(address);
  const { data: score } = useActivityScore(address);
  const { data: threshold } = useOrganizationThreshold();

  const currentScore = score !== undefined ? score : 0n;
  const currentThreshold = threshold !== undefined ? threshold : 10n;
  const isEligible = currentScore >= currentThreshold && currentThreshold > 0n;
  const pointsNeeded = currentThreshold > currentScore ? currentThreshold - currentScore : 0n;

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    writeContract({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'createOrganization',
      args: [name.trim(), description.trim()],
    });
  };

  const handleDoneCreation = () => {
    setShowCreate(false);
    setName('');
    setDescription('');
    queryClient.invalidateQueries();
    refetchMyOrgs();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>Subsidy Organizations</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Browse active organizations or establish your own subsidy distribution platform.
          </p>
        </div>

        {isConnected && isEligible && !showCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Organization
          </button>
        )}
      </div>

      {/* Eligibility Explanation Card */}
      {isConnected && (
        <section className="card" style={{ marginBottom: '2.5rem', background: isEligible ? 'rgba(34, 197, 94, 0.05)' : 'rgba(245, 158, 11, 0.05)', border: `1px solid ${isEligible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '1.05rem', color: isEligible ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {isEligible ? '✓ You Are Eligible to Create an Organization' : `⏳ You need ${pointsNeeded.toString()} more activity points to become eligible.`}
                </strong>
                <Tooltip content="Vouchera requires an on-chain activity score to prevent spam and ensure verified subsidy distribution." />
              </div>
              <p style={{ margin: '0 0 0.75rem 0', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                Your Activity Score: <strong>{currentScore.toString()}</strong> / {currentThreshold.toString()} points required.
              </p>
            </div>

            {isEligible ? (
              <span className="badge badge-success">✓ Eligible</span>
            ) : (
              <span className="badge badge-warning">Needs {pointsNeeded.toString()} More Points</span>
            )}
          </div>

          {!isEligible && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.825rem', color: 'var(--color-muted)' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Why does this requirement exist?</strong> Vouchera enforces an on-chain activity gate (<code>isEligibleToCreateOrganization</code>) so that verified entities manage public subsidy funds.
              </p>
              <Link to="/how-it-works#eligibility" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                Learn how activity points are recorded &rarr;
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Create Organization Form Modal / Section */}
      {showCreate && (
        <section className="card" style={{ marginBottom: '2.5rem', border: '1px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>🏛️ Establish New Organization</h3>
            <button onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            You will become the sovereign owner of this organization. You will be able to create programs, deposit BOT, and issue restricted vouchers.
          </p>

          {isConfirmed ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-success)' }}>Organization Created Successfully!</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Your organization is registered on Bohr blockchain. Next, open your organization to create your first subsidy program.
              </p>
              <button className="btn btn-primary" onClick={handleDoneCreation}>
                View My Organizations &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <label className="label">
                Organization Name *
                <Tooltip content="The public name for your foundation, institution, or subsidy program." />
              </label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Community Health & Food Initiative"
                required
                maxLength={100}
                disabled={isPending || isConfirming}
              />

              <label className="label">
                Description & Purpose *
                <Tooltip content="Explain the humanitarian purpose, scope, and rules of your subsidy distributions." />
              </label>
              <textarea
                className="input"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Providing targeted nutritional and medical voucher assistance to low-income families."
                required
                rows={3}
                maxLength={500}
                disabled={isPending || isConfirming}
              />

              <TransactionStatus
                hash={hash}
                isPending={isPending}
                error={error}
                successMessage="✓ Organization created and registered on Bohr Testnet!"
                onSuccess={() => {
                  queryClient.invalidateQueries();
                  refetchMyOrgs();
                }}
              />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isPending || isConfirming || !name.trim() || !description.trim()}>
                  {isPending || isConfirming ? 'Creating...' : 'Confirm & Register Organization'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)} disabled={isPending || isConfirming}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Your Managed Organizations */}
      {isConnected && myOrgs && myOrgs.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: '1.4rem' }}>
              Your Organizations ({myOrgs.length})
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Click an organization to manage programs & vouchers
            </span>
          </div>

          <div className="grid md:grid-cols-2">
            {myOrgs.map(org => (
              <OrgCard key={org.id.toString()} org={org} />
            ))}
          </div>
        </section>
      )}

      {/* All Organizations Discovery */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '1.4rem' }}>
            All Verified Organizations
          </h2>
        </div>

        {allLoading ? (
          <div className="spinner" style={{ margin: '2rem auto', display: 'block' }}></div>
        ) : allOrgs && allOrgs.length > 0 ? (
          <div className="grid md:grid-cols-3">
            {allOrgs.map(org => (
              <OrgCard key={org.id.toString()} org={org} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>
              No organizations found on Bohr Testnet yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useActivityScore, useOrganizationThreshold } from '../hooks/useVouchera';
import { submitWelcomeRequest, hasPendingWelcomeRequest, isWelcomeClaimed, generateWelcomeRequestMessage, subscribeWelcomeRequests } from '../utils/welcomeRequests';
import Tooltip from './Tooltip';

export default function WelcomeRequestCard() {
  const { address, isConnected } = useAccount();
  const { data: score, isLoading: scoreLoading } = useActivityScore(address);
  const { data: threshold } = useOrganizationThreshold();
  const [copied, setCopied] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    const update = () => {
      if (address) {
        setIsRequested(hasPendingWelcomeRequest(address));
      }
    };
    update();
    return subscribeWelcomeRequests(update);
  }, [address]);

  if (!isConnected || !address) {
    return null;
  }

  const currentScore = score !== undefined ? score : 0n;
  const currentThreshold = threshold !== undefined ? threshold : 10n;
  const alreadyClaimed = isWelcomeClaimed(address, score);

  const handleRequest = () => {
    if (alreadyClaimed) return;
    submitWelcomeRequest(address);
    setIsRequested(true);
  };

  const handleCopy = () => {
    const message = generateWelcomeRequestMessage(address);
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="card"
      style={{
        marginBottom: '1.5rem',
        border: alreadyClaimed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(124, 58, 237, 0.35)',
        background: alreadyClaimed
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 78, 59, 0.35) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.85) 100%)',
        padding: '1.25rem',
        borderRadius: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{alreadyClaimed ? '✅' : '🎁'}</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: alreadyClaimed ? 'var(--color-success)' : '#c084fc' }}>
              {alreadyClaimed ? 'Welcome Reward Received' : 'Free 2 Welcome Activity Points'}
            </h3>
            <span className={`badge ${alreadyClaimed ? 'badge-success' : 'badge-primary'}`}>
              {alreadyClaimed ? 'One-Time Reward Claimed' : 'One-Time Reward (+2 pts)'}
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>
            {alreadyClaimed
              ? 'You have already claimed your one-time 2 Welcome Activity Points on Bohr Testnet.'
              : 'New participants are entitled to 2 starter activity points once to begin progressing toward organization creation eligibility.'}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Current Score:</span>
          <p style={{ margin: 0, fontWeight: 'bold', color: currentScore > 0n ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {scoreLoading ? '...' : `${currentScore.toString()} / ${currentThreshold.toString()} pts`}
          </p>
        </div>
      </div>

      <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.825rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>One-Time Claim Policy:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-muted)' }}>
          <li>
            <strong>Single Claim Only</strong>: Welcome points can only be granted once per wallet address.
          </li>
          <li>
            Amount is fixed at <strong>2 points</strong> (cannot be claimed repeatedly).
          </li>
          <li>
            Points are recorded directly on-chain by the Protocol Admin calling <code>recordActivity(yourWallet, 2)</code> on Bohr Testnet.
          </li>
        </ul>
      </div>

      {alreadyClaimed ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.65rem 0.85rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.875rem' }}>
            <span>✓</span>
            <strong>One-Time 2 Welcome Points Already Granted to this Wallet</strong>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            No further welcome claims permitted for this wallet.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {isRequested ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontSize: '0.875rem' }}>
              <span>✓</span>
              <strong>Welcome Request Active (Awaiting Admin On-Chain Transaction)</strong>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleRequest}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                border: 'none',
                padding: '0.55rem 1.15rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              🎁 Request 2 Welcome Activity Points (1x Only)
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          >
            {copied ? '✓ Request Copied to Clipboard!' : '📋 Copy Request Details'}
            <Tooltip content="Copies your standardized request message to share directly with the protocol admin." />
          </button>
        </div>
      )}

      {!alreadyClaimed && isRequested && (
        <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '0.4rem', fontSize: '0.785rem', color: 'var(--color-success)' }}>
          ℹ️ Your wallet address (<code>{address}</code>) has been submitted for review. Once approved by the Protocol Admin, your on-chain score will automatically update to <strong>{(currentScore + 2n).toString()} points</strong>.
        </div>
      )}
    </div>
  );
}

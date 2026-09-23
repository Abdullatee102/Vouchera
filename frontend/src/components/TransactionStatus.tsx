import { useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { decodeContractError } from '../utils/errors';
import { BOHR_EXPLORER } from '../config/contracts';

interface TransactionStatusProps {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  error: Error | null;
  successMessage?: string;
  onSuccess?: () => void;
}

export default function TransactionStatus({
  hash,
  isPending,
  error,
  successMessage = '✓ Transaction confirmed on Bohr Testnet!',
  onSuccess,
}: TransactionStatusProps) {
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  if (isPending) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
          <div>
            <strong style={{ color: 'var(--color-warning)', fontSize: '0.875rem' }}>Waiting for Wallet Confirmation...</strong>
            <p style={{ margin: '0.15rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Please review and sign the transaction prompt in your wallet extension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-primary)', background: 'rgba(6, 182, 212, 0.08)', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="spinner" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }}></div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <strong style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>Transaction Submitted — Confirming...</strong>
            <p style={{ margin: '0.15rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
              Awaiting block inclusion on Bohr Testnet (Chain ID 968).
            </p>
          </div>
          {hash && (
            <a
              href={`${BOHR_EXPLORER}tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.785rem', padding: '0.3rem 0.65rem' }}
            >
              View Explorer ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-success)', background: 'rgba(34, 197, 94, 0.1)', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>✅</span>
            <strong style={{ color: 'var(--color-success)', fontSize: '0.875rem' }}>{successMessage}</strong>
          </div>
          {hash && (
            <a
              href={`${BOHR_EXPLORER}tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '0.785rem', padding: '0.3rem 0.65rem' }}
            >
              View Explorer ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    const friendlyError = decodeContractError(error);
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.12)', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>❌</span>
          <div>
            <strong style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>Transaction Feedback:</strong>
            <p style={{ color: 'var(--color-text)', margin: '0.2rem 0 0 0', fontSize: '0.825rem', lineHeight: '1.4' }}>
              {friendlyError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

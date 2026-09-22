import { useWaitForTransactionReceipt } from 'wagmi';
import { BaseError } from 'viem';

interface TransactionStatusProps {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming?: boolean;
  error: Error | null;
  onSuccess?: () => void;
}

export default function TransactionStatus({ hash, isPending, error, onSuccess }: TransactionStatusProps) {
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  if (isSuccess && onSuccess) {
    // Note: We use a small timeout to avoid updating state during render
    setTimeout(onSuccess, 0);
  }

  if (isPending) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="spinner"></div>
          <span>Confirm in wallet...</span>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="spinner"></div>
          <span>Transaction processing on Bohr...</span>
          {hash && (
            <a href={`https://scan.bohr.life/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: '0.875rem' }}>
              View Explorer ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)' }}>
          <span>✅ Confirmed</span>
          {hash && (
            <a href={`https://scan.bohr.life/tx/${hash}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: '0.875rem' }}>
              View Explorer ↗
            </a>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <p style={{ color: 'var(--color-danger)', margin: 0 }}>
          ❌ Error: {(error as BaseError).shortMessage || error.message}
        </p>
      </div>
    );
  }

  return null;
}

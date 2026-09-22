import { Link } from 'react-router-dom';
import type { VoucherProgram } from '../types';
import { useProgramStats } from '../hooks/useVouchera';
import { formatBOT, formatTimestamp } from '../utils/formatting';
import { getCategoryByCode } from '../utils/categories';

export default function ProgramCard({ program }: { program: VoucherProgram }) {
  const stats = useProgramStats(program.id);
  const category = getCategoryByCode(program.categoryCode);
  
  const statusLabels = ['Draft', 'Active', 'Paused', 'Closed'];
  const statusColors = ['badge-muted', 'badge-success', 'badge-warning', 'badge-danger'];

  const isDraft = program.status === 0;
  const isActive = program.status === 1;
  const isPaused = program.status === 2;
  const isClosed = program.status === 3;

  const totalFunded = stats ? stats.totalFunded : program.totalFunded;
  const isFunded = totalFunded > 0n;

  const progress = stats && stats.totalFunded > 0n
    ? Number((stats.totalAllocated * 100n) / stats.totalFunded)
    : 0;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{program.name}</h3>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`badge ${statusColors[program.status]}`}>{statusLabels[program.status]}</span>
            {category && (
              <span className="badge badge-primary">{category.emoji} {category.name}</span>
            )}
            {isDraft && (
              <span className={`badge ${isFunded ? 'badge-success' : 'badge-warning'}`}>
                {isFunded ? '💰 Funded' : '⏳ Unfunded'}
              </span>
            )}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '2.2rem', lineHeight: '1.4' }}>
        {program.description}
      </p>

      {/* Program Lifecycle Indicator */}
      <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.45rem', border: '1px solid var(--color-border)', marginBottom: '1rem', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--color-muted)' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Created</span>
          <span style={{ color: isFunded ? 'var(--color-success)' : 'var(--color-muted)', fontWeight: isFunded ? 600 : 400 }}>
            {isFunded ? '✓ Funded' : '○ Fund'}
          </span>
          <span style={{ color: isActive ? 'var(--color-success)' : 'var(--color-muted)', fontWeight: isActive ? 600 : 400 }}>
            {isActive ? '✓ Active' : '○ Activate'}
          </span>
        </div>
        {isDraft && !isFunded && (
          <p style={{ margin: 0, color: 'var(--color-warning)', fontSize: '0.75rem' }}>
            ℹ️ Fund this program before activating it.
          </p>
        )}
        {isDraft && isFunded && (
          <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.75rem' }}>
            ✓ Program funded and ready to be activated.
          </p>
        )}
        {isActive && (
          <p style={{ margin: 0, color: 'var(--color-success)', fontSize: '0.75rem' }}>
            ✓ Program active — ready to issue vouchers.
          </p>
        )}
        {isPaused && (
          <p style={{ margin: 0, color: 'var(--color-warning)', fontSize: '0.75rem' }}>
            ⏸️ Program paused — voucher redemptions temporarily suspended.
          </p>
        )}
        {isClosed && (
          <p style={{ margin: 0, color: 'var(--color-danger)', fontSize: '0.75rem' }}>
            🔒 Program closed permanently.
          </p>
        )}
      </div>

      {stats && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Allocated: <strong>{formatBOT(stats.totalAllocated)}</strong></span>
            <span>Funded: <strong>{formatBOT(stats.totalFunded)}</strong></span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.35rem' }}>
            <span>Available: {formatBOT(stats.availableFunds)}</span>
            <span>Redeemed: {formatBOT(stats.totalRedeemed)}</span>
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
        Expires: {formatTimestamp(program.expiresAt)}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
        {isDraft && !isFunded && (
          <Link
            to={`/organizations/${program.organizationId}?tab=funding&programId=${program.id.toString()}`}
            className="btn btn-primary"
            style={{ flex: 1, textAlign: 'center', fontSize: '0.825rem' }}
          >
            💰 Fund Program
          </Link>
        )}
        {isDraft && isFunded && (
          <Link
            to={`/organizations/${program.organizationId}?tab=programs&activateId=${program.id.toString()}`}
            className="btn btn-primary"
            style={{ flex: 1, textAlign: 'center', fontSize: '0.825rem' }}
          >
            ⚡ Activate Program
          </Link>
        )}
        {isActive && (
          <Link
            to={`/organizations/${program.organizationId}?tab=beneficiaries&programId=${program.id.toString()}`}
            className="btn btn-primary"
            style={{ flex: 1, textAlign: 'center', fontSize: '0.825rem' }}
          >
            🎫 Issue Voucher
          </Link>
        )}
        <Link
          to={`/organizations/${program.organizationId}?tab=programs`}
          className="btn btn-secondary"
          style={{ textAlign: 'center', fontSize: '0.825rem' }}
        >
          Details
        </Link>
      </div>
    </div>
  );
}

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

  const progress = stats && stats.totalFunded > 0n
    ? Number((stats.totalAllocated * 100n) / stats.totalFunded)
    : 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>{program.name}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={`badge ${statusColors[program.status]}`}>{statusLabels[program.status]}</span>
            {category && (
              <span className="badge badge-primary">{category.emoji} {category.name}</span>
            )}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '2.5rem' }}>
        {program.description}
      </p>

      {stats && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <span>Allocated: {formatBOT(stats.totalAllocated)}</span>
            <span>Funded: {formatBOT(stats.totalFunded)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
            <span>Available: {formatBOT(stats.availableFunds)} BOT</span>
            <span>Redeemed: {formatBOT(stats.totalRedeemed)} BOT</span>
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
        Expires: {formatTimestamp(program.expiresAt)}
      </div>

      <Link to={`/organizations/${program.organizationId}?tab=programs`} className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
        View Details
      </Link>
    </div>
  );
}

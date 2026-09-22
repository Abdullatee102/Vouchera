import { Link } from 'react-router-dom';
import type { Voucher } from '../types';
import { formatBOT, formatTimestamp, formatAddress } from '../utils/formatting';
import { getCategoryByCode } from '../utils/categories';
import { useProgram, useOrganization } from '../hooks/useVouchera';

export default function VoucherCard({ voucher }: { voucher: Voucher }) {
  const { data: program } = useProgram(voucher.programId);
  const { data: org } = useOrganization(voucher.organizationId);
  
  const category = program ? getCategoryByCode(program.categoryCode) : null;
  
  const statusLabels = ['Active', 'Partially Redeemed', 'Fully Redeemed', 'Expired', 'Cancelled'];
  const statusColors = ['badge-success', 'badge-warning', 'badge-muted', 'badge-danger', 'badge-danger'];

  const progress = Number((voucher.remainingAmount * 100n) / (voucher.allocatedAmount === 0n ? 1n : voucher.allocatedAmount));

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, fontSize: '10rem', pointerEvents: 'none' }}>
        {category?.emoji || '🎫'}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <span className={`badge ${statusColors[voucher.status]}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
            {statusLabels[voucher.status]}
          </span>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{formatBOT(voucher.allocatedAmount)} BOT</h3>
        </div>
        {category && (
          <span className="badge badge-primary">{category.emoji} {category.name}</span>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-muted)' }}>Organization</p>
        <p style={{ margin: 0, fontWeight: 500 }}>{org ? org.name : 'Loading...'}</p>
        <p style={{ margin: '1rem 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--color-muted)' }}>Program</p>
        <p style={{ margin: 0 }}>{program ? program.name : 'Loading...'}</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <span>Remaining: {formatBOT(voucher.remainingAmount)}</span>
          <span>Original: {formatBOT(voucher.allocatedAmount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
        <p style={{ margin: '0 0 0.25rem 0' }}>Valid until: {formatTimestamp(voucher.expiresAt)}</p>
        {voucher.allowedMerchant !== '0x0000000000000000000000000000000000000000' && (
          <p style={{ margin: 0, color: 'var(--color-warning)' }}>
            ⚠️ Restricted to merchant: {formatAddress(voucher.allowedMerchant)}
          </p>
        )}
      </div>

      <Link to={`/vouchers/${voucher.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
        View Voucher
      </Link>
    </div>
  );
}

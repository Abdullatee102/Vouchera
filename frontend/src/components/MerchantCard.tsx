import type { Merchant } from '../types';
import { formatAddress } from '../utils/formatting';
import { getCategoryByCode } from '../utils/categories';
import { Link } from 'react-router-dom';

export default function MerchantCard({ merchant, orgId }: { merchant: Merchant; orgId?: bigint }) {
  const category = getCategoryByCode(merchant.categoryCode);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{merchant.name}</h3>
        {merchant.active ? (
          <span className="badge badge-success">Active</span>
        ) : (
          <span className="badge badge-danger">Inactive</span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {category && (
          <span className="badge badge-primary">{category.emoji} {category.name}</span>
        )}
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}><strong>Address:</strong> {formatAddress(merchant.account)}</p>
      </div>

      {orgId && (
        <Link to={`/organizations/${orgId}?tab=merchants`} className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
          View in Organization
        </Link>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { Organization } from '../types';
import { useOrganizationStats } from '../hooks/useVouchera';
import { formatAddress, formatTimestamp } from '../utils/formatting';
import { useAccount } from 'wagmi';

export default function OrgCard({ org }: { org: Organization }) {
  const { address } = useAccount();
  const stats = useOrganizationStats(org.id);
  const isOwner = address && address.toLowerCase() === org.owner.toLowerCase();

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>{org.name}</h3>
        {org.active ? (
          <span className="badge badge-success">Active</span>
        ) : (
          <span className="badge badge-danger">Inactive</span>
        )}
      </div>
      
      <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        {org.description}
      </p>

      <div style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        <p><strong>Owner:</strong> {formatAddress(org.owner)}</p>
        <p><strong>Created:</strong> {formatTimestamp(org.createdAt)}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2" style={{ gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '0.375rem' }}>
            <div style={{ color: 'var(--color-muted)' }}>Programs</div>
            <div style={{ fontWeight: 'bold' }}>{stats.programCount.toString()}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '0.375rem' }}>
            <div style={{ color: 'var(--color-muted)' }}>Merchants</div>
            <div style={{ fontWeight: 'bold' }}>{stats.merchantCount.toString()}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '0.375rem' }}>
            <div style={{ color: 'var(--color-muted)' }}>Beneficiaries</div>
            <div style={{ fontWeight: 'bold' }}>{stats.beneficiaryCount.toString()}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.5rem', borderRadius: '0.375rem' }}>
            <div style={{ color: 'var(--color-muted)' }}>Redemptions</div>
            <div style={{ fontWeight: 'bold' }}>{stats.redemptionCount.toString()}</div>
          </div>
        </div>
      )}

      <Link to={`/organizations/${org.id}`} className={`btn ${isOwner ? 'btn-primary' : 'btn-secondary'}`} style={{ display: 'block', textAlign: 'center' }}>
        {isOwner ? 'Manage Organization' : 'View Details'}
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAllOrganizations, useOrgMerchants } from '../hooks/useVouchera';
import MerchantCard from '../components/MerchantCard';
import Tooltip from '../components/Tooltip';

function OrgMerchants({ orgId, orgName }: { orgId: bigint, orgName: string }) {
  const { data: merchants, isLoading } = useOrgMerchants(orgId);

  if (isLoading) return <div className="spinner"></div>;
  if (!merchants || merchants.length === 0) return null;

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0 }}>
          {orgName}
        </h3>
        <Link to={`/organizations/${orgId}`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
          View Org & Programs →
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3">
        {merchants.map(m => (
          <MerchantCard key={m.account} merchant={m} orgId={orgId} />
        ))}
      </div>
    </div>
  );
}

export default function Merchants() {
  const { data: orgs, isLoading: orgsLoading } = useAllOrganizations();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ margin: '0 0 0.5rem 0' }}>Approved Merchants Directory</h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>
          Directory of verified merchants authorized to receive direct BOT settlements when beneficiaries redeem category-matched vouchers.
        </p>
      </div>

      {/* Educational Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.9))', borderColor: 'rgba(6, 182, 212, 0.3)', marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏪</span>
          <div>
            <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-primary)' }}>
              How Merchant Verification & Settlement Works
              <Tooltip content="Merchants do not hold vouchers or BOT tokens in advance. When a voucher is redeemed, the smart contract sends BOT native tokens directly from the program reserve to the merchant's address." />
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>
              1. <strong>Organization Level:</strong> Each organization evaluates and whitelists merchants by category (Food, Health, Education, Transport, Housing, Utilities).<br />
              2. <strong>Redemption Check:</strong> When a beneficiary redeems a voucher, the contract verifies the merchant is active and category-matched.<br />
              3. <strong>Instant Settlement:</strong> Native BOT is transferred directly to the merchant wallet on-chain. No intermediate voucher holding.
            </p>
          </div>
        </div>
      </div>

      {orgsLoading ? (
        <div className="spinner"></div>
      ) : orgs && orgs.length > 0 ? (
        orgs.map(org => (
          <OrgMerchants key={org.id.toString()} orgId={org.id} orgName={org.name} />
        ))
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Merchants Approved Yet</h3>
          <p style={{ color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Organizations approve verified merchants within specific categories to receive voucher redemptions.
          </p>
          <Link to="/organizations" className="btn btn-primary">
            Explore Organizations →
          </Link>
        </div>
      )}
    </div>
  );
}

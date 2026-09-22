import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useVouchersByBeneficiary } from '../hooks/useVouchera';
import VoucherCard from '../components/VoucherCard';

export default function MyVouchers() {
  const { address, isConnected } = useAccount();
  const { data: vouchers, isLoading } = useVouchersByBeneficiary(address);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  if (!isConnected || !address) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>My Vouchers</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            View and redeem your allocated subsidy vouchers.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--color-primary)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🔌</span>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Wallet Not Connected</h2>
          <p style={{ color: 'var(--color-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem', lineHeight: '1.5' }}>
            Please connect your Web3 wallet using the button in the navigation bar to view vouchers assigned to your address.
          </p>
          <Link to="/how-it-works" className="btn btn-secondary">
            Learn How Vouchers Work &rarr;
          </Link>
        </div>
      </div>
    );
  }

  const filteredVouchers = vouchers?.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'active') return v.status === 0 || v.status === 1; // Active or Partially Redeemed
    return v.status > 1; // Fully Redeemed, Expired, Cancelled
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>My Subsidy Vouchers</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Restricted vouchers allocated to your wallet (<code>{address.slice(0, 6)}...{address.slice(-4)}</code>).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>
            All ({vouchers?.length || 0})
          </button>
          <button className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('active')}>
            Active
          </button>
          <button className={`btn ${filter === 'past' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('past')}>
            Past
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="spinner" style={{ margin: '4rem auto', display: 'block' }}></div>
      ) : filteredVouchers && filteredVouchers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {filteredVouchers.map(v => (
            <VoucherCard key={v.id.toString()} voucher={v} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🎫</span>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Vouchers Found</h3>
          <p style={{ color: 'var(--color-muted)', maxWidth: '520px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
            You do not have any {filter !== 'all' ? filter : ''} vouchers assigned to this wallet. To receive vouchers, an organization owner must approve your address as a beneficiary and issue a voucher.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/organizations" className="btn btn-primary">
              Explore Active Organizations &rarr;
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              Beneficiary FAQ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

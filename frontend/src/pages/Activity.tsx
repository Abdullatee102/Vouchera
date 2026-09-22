import { Link } from 'react-router-dom';
import { useAllRedemptions } from '../hooks/useVouchera';
import { formatBOT, formatAddress, formatTimestamp, explorerUrl } from '../utils/formatting';
import Tooltip from '../components/Tooltip';

export default function Activity() {
  const { data: redemptions, isLoading } = useAllRedemptions(0n, 100n);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ margin: '0 0 0.5rem 0' }}>Live On-Chain Activity Ledger</h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}>
          Real-time, immutable record of all voucher redemptions and direct BOT token settlements verified on Bohr Testnet.
        </p>
      </div>

      {/* Info Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(15, 23, 42, 0.9))', borderColor: 'rgba(34, 197, 94, 0.3)', marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⛓️</span>
          <div>
            <h4 style={{ margin: '0 0 0.35rem 0', color: 'var(--color-success)' }}>
              Transparent Subsidy Accounting
              <Tooltip content="Every row below represents an atomic execution where voucher entitlement was verified, burnt on-chain, and matched native BOT was paid out to an approved merchant." />
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>
              All redemptions are verifiable via public transactions on the Bohr blockchain. Funds move atomically from the program pool directly to the merchant, preventing double-spending and unauthorized diversions.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div className="spinner"></div>
        ) : redemptions && redemptions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>ID</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Date</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Voucher</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Beneficiary</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Merchant</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Amount</th>
                <th style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>Invoice / Ref</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id.toString()} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>#{r.id.toString()}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{formatTimestamp(r.redeemedAt)}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Link to={`/vouchers/${r.voucherId}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                      Voucher #{r.voucherId.toString()}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <a href={explorerUrl(r.beneficiary)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text)', textDecoration: 'underline' }}>
                      {formatAddress(r.beneficiary)}
                    </a>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <a href={explorerUrl(r.merchant)} target="_blank" rel="noreferrer" style={{ color: 'var(--color-text)', textDecoration: 'underline' }}>
                      {formatAddress(r.merchant)}
                    </a>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                    {formatBOT(r.amount)}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--color-muted)' }}>{r.purchaseReference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>No Redemptions Recorded Yet</h4>
            <p style={{ color: 'var(--color-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              Redemptions will appear here in real-time as beneficiaries redeem vouchers at approved merchants.
            </p>
            <Link to="/my-vouchers" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
              View My Vouchers →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

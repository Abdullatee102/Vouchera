import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { useVoucher, useProgram, useOrganization, useVoucherRedemptions } from '../hooks/useVouchera';
import { formatBOT, formatAddress, formatTimestamp, explorerUrl } from '../utils/formatting';
import { getCategoryByCode } from '../utils/categories';
import RedemptionModal from '../components/RedemptionModal';
import { VoucherStatus } from '../types';

export default function VoucherDetail() {
  const { voucherId } = useParams<{ voucherId: string }>();
  const { address } = useAccount();
  const vId = voucherId ? BigInt(voucherId) : undefined;

  const { data: voucher, isLoading: vLoading, refetch: refetchVoucher } = useVoucher(vId);
  const { data: program } = useProgram(voucher?.programId);
  const { data: org } = useOrganization(voucher?.organizationId);
  const { data: redemptions } = useVoucherRedemptions(vId);

  const [showRedeem, setShowRedeem] = useState(false);

  if (vLoading) return <div className="spinner" style={{ margin: '4rem auto', display: 'block' }} />;
  if (!voucher) return <div className="card">Voucher not found</div>;

  const category = program ? getCategoryByCode(program.categoryCode) : null;
  const isBeneficiary = address && voucher.beneficiary.toLowerCase() === address.toLowerCase();

  const statusLabels = ['Active', 'Partially Redeemed', 'Fully Redeemed', 'Expired', 'Cancelled'];
  const statusColors = ['badge-success', 'badge-warning', 'badge-muted', 'badge-danger', 'badge-danger'];

  const isExpiredOnChain = Number(voucher.expiresAt) * 1000 < Date.now();
  const canRedeem = isBeneficiary &&
    (voucher.status === VoucherStatus.Active || voucher.status === VoucherStatus.PartiallyRedeemed) &&
    !isExpiredOnChain;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      {/* Left Column: Visual Artwork & Quick Actions */}
      <div>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '5rem', marginBottom: '0.75rem' }}>
            {category?.emoji || '🎫'}
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{formatBOT(voucher.allocatedAmount)}</h2>
          <span className={`badge ${statusColors[voucher.status]}`}>{statusLabels[voucher.status]}</span>
          {category && <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginTop: '0.75rem', fontSize: '1.1rem' }}>{category.name} Subsidy</p>}

          <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '0.5rem', fontSize: '0.825rem', textAlign: 'left' }}>
            <p style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              🔒 Cryptographically Restricted Voucher
            </p>
            <p style={{ margin: 0, color: 'var(--color-muted)', lineHeight: '1.4' }}>
              Redeemable solely with approved {category?.name || 'category'} merchants. Backed by native BOT locked in contract.
            </p>
          </div>
        </div>

        {canRedeem && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', fontSize: '1.1rem' }}
            onClick={() => setShowRedeem(true)}
          >
            💳 Redeem Voucher with Merchant
          </button>
        )}

        {isExpiredOnChain && voucher.status !== VoucherStatus.FullyRedeemed && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--color-danger)' }}>
            ⏰ This voucher has expired. Unused funds can be reclaimed by the organization owner.
          </div>
        )}

        {/* Verification & Compliance Notice */}
        <div className="card" style={{ marginTop: '1.5rem', fontSize: '0.825rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>🔍 Verification & Audit Trail</h4>
          <p style={{ margin: 0, color: 'var(--color-muted)', lineHeight: '1.5' }}>
            Every redemption verifies beneficiary signature, merchant category code, and program active status before transferring native BOT on Bohr Testnet. Merchant invoices are anchored via purchase references.
          </p>
        </div>
      </div>

      {/* Right Column: Complete Details & History */}
      <div>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">Voucher Specification</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <p className="label">Voucher ID</p>
              <p style={{ margin: 0, fontWeight: 700 }}>#{voucher.id.toString()}</p>
            </div>
            <div>
              <p className="label">Beneficiary</p>
              <p style={{ margin: 0 }}>
                <a href={explorerUrl(voucher.beneficiary, 'address')} target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace' }}>
                  {formatAddress(voucher.beneficiary)}
                </a>
              </p>
            </div>
            <div>
              <p className="label">Organization</p>
              <p style={{ margin: 0 }}>
                <Link to={`/organizations/${voucher.organizationId}`}>
                  {org?.name || `Org #${voucher.organizationId}`}
                </Link>
              </p>
            </div>
            <div>
              <p className="label">Program</p>
              <p style={{ margin: 0 }}>{program?.name || `Program #${voucher.programId}`}</p>
            </div>
            <div>
              <p className="label">Allocated Amount</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{formatBOT(voucher.allocatedAmount)}</p>
            </div>
            <div>
              <p className="label">Remaining Balance</p>
              <p style={{ margin: 0, color: 'var(--color-success)', fontWeight: 800, fontSize: '1.15rem' }}>
                {formatBOT(voucher.remainingAmount)}
              </p>
            </div>
            <div>
              <p className="label">Redeemed Amount</p>
              <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 600 }}>
                {formatBOT(voucher.redeemedAmount)}
              </p>
            </div>
            <div>
              <p className="label">Expires At</p>
              <p style={{ margin: 0 }}>{formatTimestamp(voucher.expiresAt)}</p>
            </div>
            <div>
              <p className="label">Category</p>
              <p style={{ margin: 0 }}>{category ? `${category.emoji} ${category.name}` : 'Unknown'}</p>
            </div>
            <div>
              <p className="label">Merchant Restriction</p>
              {voucher.allowedMerchant === '0x0000000000000000000000000000000000000000' ? (
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  Any approved {category?.name} merchant
                </p>
              ) : (
                <p style={{ margin: 0, color: 'var(--color-warning)', fontFamily: 'monospace' }}>
                  <a href={explorerUrl(voucher.allowedMerchant, 'address')} target="_blank" rel="noreferrer">
                    {formatAddress(voucher.allowedMerchant)}
                  </a>
                </p>
              )}
            </div>
            <div>
              <p className="label">Issued At</p>
              <p style={{ margin: 0 }}>{formatTimestamp(voucher.issuedAt)}</p>
            </div>
          </div>
        </div>

        {/* Redemption Audit Table */}
        <div className="card">
          <h2 className="section-title">On-Chain Redemption History</h2>
          {redemptions && redemptions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Merchant</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Invoice / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map(r => (
                    <tr key={r.id.toString()} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{formatTimestamp(r.redeemedAt)}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <a href={explorerUrl(r.merchant, 'address')} target="_blank" rel="noreferrer" style={{ fontFamily: 'monospace' }}>
                          {formatAddress(r.merchant)}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                        {formatBOT(r.amount)}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>
                        {r.purchaseReference || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-muted)', margin: '1rem 0' }}>No redemptions recorded for this voucher yet.</p>
          )}
        </div>
      </div>

      {/* Interactive Redemption Modal */}
      {showRedeem && voucher && (
        <RedemptionModal
          voucher={voucher}
          onClose={() => setShowRedeem(false)}
          onSuccess={() => {
            setShowRedeem(false);
            refetchVoucher();
          }}
        />
      )}
    </div>
  );
}

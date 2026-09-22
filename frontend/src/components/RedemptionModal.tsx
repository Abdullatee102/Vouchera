import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS, BOHR_EXPLORER } from '../config/contracts';
import type { Voucher } from '../types';
import { useOrgMerchants, useProgram, useOrganization } from '../hooks/useVouchera';
import { formatAddress, formatBOT } from '../utils/formatting';
import { getCategoryByCode } from '../utils/categories';
import { useQueryClient } from '@tanstack/react-query';

interface RedemptionModalProps {
  voucher: Voucher;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RedemptionModal({ voucher, onClose, onSuccess: onParentSuccess }: RedemptionModalProps) {
  const queryClient = useQueryClient();
  const { data: org } = useOrganization(voucher.organizationId);
  const { data: program } = useProgram(voucher.programId);
  const { data: merchants, isLoading: merchantsLoading } = useOrgMerchants(voucher.organizationId);

  const [merchantAddr, setMerchantAddr] = useState(
    voucher.allowedMerchant !== '0x0000000000000000000000000000000000000000'
      ? voucher.allowedMerchant
      : ''
  );
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const category = program ? getCategoryByCode(program.categoryCode) : null;
  const activeMerchants = merchants?.filter(m => m.active) || [];

  const parsedAmount = parseFloat(amount) || 0;
  const currentRemainingBOT = Number(voucher.remainingAmount) / 1e18;
  const afterRemainingBOT = Math.max(0, currentRemainingBOT - parsedAmount);

  const selectedMerchantObj = activeMerchants.find(
    m => m.account.toLowerCase() === merchantAddr.toLowerCase()
  );

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantAddr || !amount || parsedAmount <= 0) return;

    writeContract({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'redeemVoucher',
      args: [voucher.id, merchantAddr as `0x${string}`, parseEther(amount), reference.trim() || 'INVOICE-DIRECT-PURCHASE'],
    });
  };

  const handleDone = () => {
    queryClient.invalidateQueries();
    if (onParentSuccess) onParentSuccess();
    onClose();
  };

  const isRestricted = voucher.allowedMerchant !== '0x0000000000000000000000000000000000000000';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid var(--color-primary)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>💳 Redeem Voucher #{voucher.id.toString()}</h2>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.825rem' }}>
              {program?.name || 'Subsidy Program'} &bull; {category?.name} Subsidy
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
        </div>

        {/* Confirmed Receipt View */}
        {isConfirmed ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>✅</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-success)', fontSize: '1.4rem' }}>
              Redemption Successful & Settled!
            </h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Native BOT has been transferred directly to the approved merchant on Bohr blockchain.
            </p>

            {/* Official Digital Redemption Receipt */}
            <div style={{ backgroundColor: 'var(--color-bg)', border: '1px dashed var(--color-primary)', borderRadius: '0.5rem', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <strong style={{ color: 'var(--color-primary)', letterSpacing: '1px' }}>VOUCHERA REDEMPTION RECEIPT</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><span style={{ color: 'var(--color-muted)' }}>Organization:</span> {org?.name || 'Vouchera Org'}</div>
                <div><span style={{ color: 'var(--color-muted)' }}>Category:</span> {category?.name || 'FOOD'}</div>
                <div><span style={{ color: 'var(--color-muted)' }}>Merchant:</span> {selectedMerchantObj?.name || formatAddress(merchantAddr)}</div>
                <div><span style={{ color: 'var(--color-muted)' }}>Amount Paid:</span> <strong style={{ color: 'var(--color-success)' }}>{amount} BOT</strong></div>
                <div><span style={{ color: 'var(--color-muted)' }}>Remaining:</span> {afterRemainingBOT.toFixed(4)} BOT</div>
                <div><span style={{ color: 'var(--color-muted)' }}>Reference:</span> {reference || 'INVOICE-DIRECT-PURCHASE'}</div>
              </div>
              {hash && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', wordBreak: 'break-all' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Tx Hash: </span>
                  <a href={`${BOHR_EXPLORER}tx/${hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                    {hash}
                  </a>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleDone}>
              Done & Return to Voucher
            </button>
          </div>
        ) : (
          /* Redemption Form */
          <form onSubmit={handleRedeem}>
            {/* Live Balance Card */}
            <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', color: 'var(--color-muted)', fontSize: '0.8rem' }}>Current Available Balance</p>
                  <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatBOT(voucher.remainingAmount)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-primary">{category?.emoji} {category?.name}</span>
                </div>
              </div>
            </div>

            {/* Merchant Selector */}
            <label className="label">Select Approved Merchant *</label>
            {merchantsLoading ? (
              <div className="spinner" style={{ marginBottom: '1rem' }}></div>
            ) : isRestricted ? (
              <div className="input" style={{ backgroundColor: 'var(--color-bg)', opacity: 0.9 }}>
                🔒 Restricted to: <strong>{formatAddress(voucher.allowedMerchant)}</strong>
              </div>
            ) : (
              <select
                className="input"
                value={merchantAddr}
                onChange={e => setMerchantAddr(e.target.value)}
                required
              >
                <option value="">-- Choose an approved {category?.name} merchant --</option>
                {activeMerchants.map(m => (
                  <option key={m.account} value={m.account}>
                    {m.name} ({formatAddress(m.account)})
                  </option>
                ))}
              </select>
            )}

            {/* Purchase Amount Input */}
            <label className="label">Purchase Amount (BOT) *</label>
            <input
              type="number"
              className="input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              step="0.0001"
              min="0.0001"
              max={currentRemainingBOT}
              placeholder={`Max: ${currentRemainingBOT} BOT`}
            />

            {/* Before / After Preview */}
            {parsedAmount > 0 && (
              <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '0.45rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Before:</span>
                  <span>{currentRemainingBOT.toFixed(4)} BOT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--color-warning)' }}>
                  <span>Redemption:</span>
                  <span>- {parsedAmount.toFixed(4)} BOT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--color-success)', borderTop: '1px solid var(--color-border)', paddingTop: '0.25rem' }}>
                  <span>Remaining After:</span>
                  <span>{afterRemainingBOT.toFixed(4)} BOT</span>
                </div>
              </div>
            )}

            {/* Purchase Reference / Invoice Note */}
            <label className="label">Merchant Invoice / Order Reference (Optional)</label>
            <input
              type="text"
              className="input"
              value={reference}
              onChange={e => setReference(e.target.value)}
              maxLength={100}
              placeholder="e.g. INV-2026-9812, Receipt #4401"
            />

            {/* Audit & Settlement Notice */}
            <div style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '0.45rem', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.785rem', color: 'var(--color-muted)' }}>
              🔒 <strong>Cryptographic Settlement:</strong> The contract will verify your voucher balance, merchant category, and transfer real BOT directly to the merchant.
            </div>

            {/* Transaction Pending Indicator */}
            {(isPending || isConfirming) && (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '0.45rem', marginBottom: '1rem' }}>
                <div className="spinner" style={{ marginBottom: '0.5rem' }}></div>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  {isPending ? 'Please confirm the transaction in your wallet...' : 'Processing settlement on Bohr Testnet...'}
                </p>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: '0.45rem', color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Transaction Error: {error.message.slice(0, 120)}...
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={isPending || isConfirming || !merchantAddr || !amount || parsedAmount <= 0 || parsedAmount > currentRemainingBOT}
              >
                {isPending || isConfirming ? 'Processing...' : `Confirm & Pay ${parsedAmount > 0 ? `${parsedAmount} BOT` : ''}`}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

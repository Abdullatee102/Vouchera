import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS } from '../config/contracts';
import {
  useOrganization,
  useOrganizationStats,
  useProgramsByOrganization,
  useOrgBeneficiaries,
  useOrgMerchants,
  useOrgRedemptions,
  useProgramStats
} from '../hooks/useVouchera';
import { formatAddress, formatTimestamp, formatBOT, explorerUrl } from '../utils/formatting';
import { CATEGORIES, getCategoryByCode } from '../utils/categories';
import ProgramCard from '../components/ProgramCard';
import MerchantCard from '../components/MerchantCard';
import OrgSetupProgress from '../components/OrgSetupProgress';
import { useQueryClient } from '@tanstack/react-query';
import type { Redemption, VoucherProgram } from '../types';

function ProgramFundingRow({ program }: { program: VoucherProgram; orgId?: bigint }) {
  const stats = useProgramStats(program.id);
  const category = getCategoryByCode(program.categoryCode);

  return (
    <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid var(--color-border)', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{program.name}</strong>
          <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
            {category?.emoji} {category?.name}
          </span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>ID #{program.id.toString()}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
        <div>
          <span style={{ color: 'var(--color-muted)' }}>Total Deposited:</span>
          <p style={{ margin: '0.1rem 0 0 0', fontWeight: 'bold' }}>{stats ? formatBOT(stats.totalFunded) : formatBOT(program.totalFunded)}</p>
        </div>
        <div>
          <span style={{ color: 'var(--color-muted)' }}>Allocated (Vouchers):</span>
          <p style={{ margin: '0.1rem 0 0 0', color: 'var(--color-warning)', fontWeight: 'bold' }}>{stats ? formatBOT(stats.totalAllocated) : formatBOT(program.totalAllocated)}</p>
        </div>
        <div>
          <span style={{ color: 'var(--color-muted)' }}>Redeemed (Paid):</span>
          <p style={{ margin: '0.1rem 0 0 0', color: 'var(--color-success)', fontWeight: 'bold' }}>{stats ? formatBOT(stats.totalRedeemed) : formatBOT(program.totalRedeemed)}</p>
        </div>
        <div>
          <span style={{ color: 'var(--color-muted)' }}>Available to Issue:</span>
          <p style={{ margin: '0.1rem 0 0 0', color: 'var(--color-primary)', fontWeight: 'bold' }}>{stats ? formatBOT(stats.availableFunds) : '0 BOT'}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationDetail() {
  const { orgId } = useParams<{ orgId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'programs';

  const id = orgId ? BigInt(orgId) : undefined;
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data: org, isLoading: orgLoading, refetch: refetchOrg } = useOrganization(id);
  const stats = useOrganizationStats(id);
  
  const { data: programs, refetch: refetchProgs } = useProgramsByOrganization(id);
  const { data: beneficiaries, refetch: refetchBens } = useOrgBeneficiaries(id);
  const { data: merchants, refetch: refetchMerchs } = useOrgMerchants(id);
  const { data: redemptions, refetch: refetchReds } = useOrgRedemptions(id);

  const isOwner = address && org && address.toLowerCase() === org.owner.toLowerCase();

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Program Form State
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progCat, setProgCat] = useState(CATEGORIES[0].code);
  const [progDays, setProgDays] = useState('90');

  // Fund Form State
  const [fundProgId, setFundProgId] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  // Beneficiary Form State
  const [benAddress, setBenAddress] = useState<string>('');

  // Merchant Form State
  const [merchAddress, setMerchAddress] = useState<string>('');
  const [merchName, setMerchName] = useState('');
  const [merchCat, setMerchCat] = useState(CATEGORIES[0].code);

  // Issue Voucher Form State
  const [issueProg, setIssueProg] = useState('');
  const [issueBen, setIssueBen] = useState<string>('');
  const [issueAmount, setIssueAmount] = useState('');
  const [issueDays, setIssueDays] = useState('30');
  const [issueRestr, setIssueRestr] = useState<string>('');

  if (orgLoading) return <div className="spinner" style={{ margin: '4rem auto', display: 'block' }}></div>;
  
  if (!org) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h2>Organization Not Found</h2>
        <p style={{ color: 'var(--color-muted)' }}>The requested organization ID does not exist on Bohr Testnet.</p>
        <Link to="/organizations" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Browse Organizations
        </Link>
      </div>
    );
  }

  const setTab = (tab: string) => setSearchParams({ tab });

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    refetchOrg();
    refetchProgs();
    refetchBens();
    refetchMerchs();
    refetchReds();
  };

  return (
    <div>
      {/* Breadcrumb Header */}
      <div style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        <Link to="/organizations" style={{ color: 'var(--color-muted)' }}>&larr; All Organizations</Link>
      </div>

      {/* Organization Info Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🏛️</span>
              <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{org.name}</h1>
              <span className={`badge ${org.active ? 'badge-success' : 'badge-danger'}`}>
                {org.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ color: 'var(--color-muted)', margin: '0 0 1rem 0', fontSize: '0.925rem', maxWidth: '700px', lineHeight: '1.5' }}>
              {org.description}
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
              <span>ID: <strong>#{org.id.toString()}</strong></span>
              <span>
                Owner: <strong>{formatAddress(org.owner)}</strong> {isOwner && <span style={{ color: 'var(--color-primary)' }}>(You)</span>}
              </span>
              <span>Created: {formatTimestamp(org.createdAt)}</span>
            </div>
          </div>

          {isOwner && (
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-primary">You are the Owner</span>
            </div>
          )}
        </div>

        {/* Aggregate Stats */}
        {stats && (
          <div className="grid grid-cols-4" style={{ gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.785rem' }}>Programs</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0 0', color: 'var(--color-primary)' }}>{stats.programCount.toString()}</p>
            </div>
            <div>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.785rem' }}>Beneficiaries</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0 0', color: 'var(--color-success)' }}>{stats.beneficiaryCount.toString()}</p>
            </div>
            <div>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.785rem' }}>Merchants</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0 0', color: '#c084fc' }}>{stats.merchantCount.toString()}</p>
            </div>
            <div>
              <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.785rem' }}>Redemptions</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.2rem 0 0 0', color: 'var(--color-warning)' }}>{stats.redemptionCount.toString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progressive Setup Guide (Owner Only) */}
      {isOwner && (
        <OrgSetupProgress
          programs={programs}
          beneficiaryCount={beneficiaries?.length || 0}
          merchants={merchants}
          onNavigateTab={setTab}
        />
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
        {[
          { id: 'programs', label: `Programs (${programs?.length || 0})` },
          { id: 'funding', label: 'Funding Pools' },
          { id: 'beneficiaries', label: `Beneficiaries (${beneficiaries?.length || 0})` },
          { id: 'merchants', label: `Merchants (${merchants?.length || 0})` },
          { id: 'redemptions', label: `Redemptions (${redemptions?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: activeTab === tab.id ? 'bold' : '500',
              cursor: 'pointer',
              fontSize: '0.925rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction Status Box */}
      {(isPending || isConfirming || isConfirmed || error) && (
        <div style={{ marginBottom: '1.5rem' }}>
          {isConfirming && (
            <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div className="spinner" style={{ marginBottom: '0.5rem' }}></div>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Confirming transaction on Bohr Testnet...</p>
            </div>
          )}
          {isConfirmed && (
            <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✓ Transaction confirmed on Bohr Testnet!</span>
              <button className="btn btn-secondary" onClick={handleRefresh} style={{ fontSize: '0.8rem' }}>
                Refresh Data
              </button>
            </div>
          )}
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: '0.5rem', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
              Error: {error.message.slice(0, 140)}...
            </div>
          )}
        </div>
      )}

      {/* TAB 1: PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="grid md:grid-cols-3" style={{ gap: '2rem' }}>
          <div className="md:col-span-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Subsidy Programs</h2>
            </div>

            {programs && programs.length > 0 ? (
              <div className="grid md:grid-cols-2" style={{ gap: '1rem' }}>
                {programs.map(p => (
                  <ProgramCard key={p.id.toString()} program={p} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--color-muted)', margin: '0 0 1rem 0' }}>
                  No programs created yet for this organization.
                </p>
                {isOwner && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    Use the form on the right to create your first category-restricted program.
                  </p>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <div>
              <div className="card" style={{ border: '1px solid var(--color-primary)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                  + Create Program
                </h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Establish a category-restricted funding container for your vouchers.
                </p>

                <form onSubmit={e => {
                  e.preventDefault();
                  if (!progName.trim()) return;
                  const startTs = BigInt(Math.floor(Date.now() / 1000));
                  const endTs = startTs + BigInt(parseInt(progDays) * 86400);
                  writeContract({
                    address: VOUCHERA_CONTRACT_ADDRESS,
                    abi: VOUCHERA_ABI,
                    functionName: 'createProgram',
                    args: [id!, progName.trim(), progDesc.trim(), progCat as `0x${string}`, startTs, endTs]
                  });
                }}>
                  <label className="label">Program Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. Food Support Q1 2026"
                    value={progName}
                    onChange={e => setProgName(e.target.value)}
                    required
                  />

                  <label className="label">Description *</label>
                  <input
                    className="input"
                    placeholder="e.g. Subsidized nutrition vouchers for families"
                    value={progDesc}
                    onChange={e => setProgDesc(e.target.value)}
                    required
                  />

                  <label className="label">Subsidy Category *</label>
                  <select
                    className="input"
                    value={progCat}
                    onChange={e => setProgCat(e.target.value as `0x${string}`)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>

                  <label className="label">Program Duration (Days) *</label>
                  <input
                    type="number"
                    className="input"
                    value={progDays}
                    onChange={e => setProgDays(e.target.value)}
                    min="1"
                    max="365"
                    required
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={isPending || isConfirming || !progName.trim()}
                  >
                    {isPending || isConfirming ? 'Creating...' : 'Create Program'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FUNDING POOLS */}
      {activeTab === 'funding' && (
        <div className="grid md:grid-cols-3" style={{ gap: '2rem' }}>
          <div className="md:col-span-2">
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Program Funding Pools</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Vouchers are backed 1:1 by native BOT locked in the contract.
            </p>

            {programs && programs.length > 0 ? (
              programs.map(p => (
                <ProgramFundingRow key={p.id.toString()} program={p} orgId={id!} />
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--color-muted)' }}>Create a program first before depositing funds.</p>
              </div>
            )}
          </div>

          {isOwner && (
            <div>
              <div className="card" style={{ border: '1px solid var(--color-success)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-success)', fontSize: '1.15rem' }}>
                  💰 Deposit Native BOT
                </h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Transfer BOT tokens into the program pool to enable voucher issuance.
                </p>

                <form onSubmit={e => {
                  e.preventDefault();
                  if (!fundProgId || !fundAmount || parseFloat(fundAmount) <= 0) return;
                  writeContract({
                    address: VOUCHERA_CONTRACT_ADDRESS,
                    abi: VOUCHERA_ABI,
                    functionName: 'fundProgram',
                    args: [id!, BigInt(fundProgId)],
                    // @ts-ignore
                    value: parseEther(fundAmount)
                  });
                }}>
                  <label className="label">Target Program *</label>
                  <select
                    className="input"
                    value={fundProgId}
                    onChange={e => setFundProgId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Program --</option>
                    {programs?.map(p => (
                      <option key={p.id.toString()} value={p.id.toString()}>
                        {p.name} (#{p.id.toString()})
                      </option>
                    ))}
                  </select>

                  <label className="label">Deposit Amount (BOT) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className="input"
                    placeholder="e.g. 1.0 BOT"
                    value={fundAmount}
                    onChange={e => setFundAmount(e.target.value)}
                    required
                  />

                  <div style={{ padding: '0.65rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '0.45rem', marginBottom: '1rem', fontSize: '0.785rem', color: 'var(--color-muted)' }}>
                    ℹ️ <em>Actual BOT will be sent from your connected wallet to the Vouchera contract.</em>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={isPending || isConfirming || !fundProgId || !fundAmount}
                  >
                    {isPending || isConfirming ? 'Depositing...' : `Deposit ${fundAmount ? `${fundAmount} BOT` : 'BOT'}`}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BENEFICIARIES & VOUCHER ISSUANCE */}
      {activeTab === 'beneficiaries' && (
        <div className="grid md:grid-cols-3" style={{ gap: '2rem' }}>
          <div className="md:col-span-2">
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Approved Beneficiaries ({beneficiaries?.length || 0})</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Only approved recipient wallets can be issued restricted vouchers.
            </p>

            <div className="card">
              {beneficiaries?.length ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {beneficiaries.map(b => (
                    <li key={b} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{formatAddress(b)}</span>
                      <a href={explorerUrl(b, 'address')} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
                        View Explorer &rarr;
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--color-muted)', margin: '1rem 0' }}>No beneficiaries approved yet.</p>
              )}
            </div>
          </div>

          {isOwner && (
            <div>
              {/* Approve Beneficiary Card */}
              <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--color-primary)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                  + Approve Beneficiary
                </h3>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!benAddress.trim()) return;
                  writeContract({
                    address: VOUCHERA_CONTRACT_ADDRESS,
                    abi: VOUCHERA_ABI,
                    functionName: 'approveBeneficiary',
                    args: [id!, benAddress.trim() as `0x${string}`]
                  });
                }}>
                  <label className="label">Beneficiary Wallet Address *</label>
                  <input
                    className="input"
                    placeholder="0x..."
                    value={benAddress}
                    onChange={e => setBenAddress(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={isPending || isConfirming || !benAddress.trim()}
                  >
                    Approve Beneficiary
                  </button>
                </form>
              </div>

              {/* Issue Voucher Card */}
              <div className="card" style={{ border: '1px solid var(--color-warning)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-warning)', fontSize: '1.15rem' }}>
                  🎫 Issue Restricted Voucher
                </h3>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!issueProg || !issueBen || !issueAmount) return;
                  const expTs = BigInt(Math.floor(Date.now() / 1000)) + BigInt(parseInt(issueDays) * 86400);
                  const allowedMerchant = (issueRestr.trim() || '0x0000000000000000000000000000000000000000') as `0x${string}`;

                  writeContract({
                    address: VOUCHERA_CONTRACT_ADDRESS,
                    abi: VOUCHERA_ABI,
                    functionName: 'issueVoucher',
                    args: [id!, BigInt(issueProg), issueBen.trim() as `0x${string}`, parseEther(issueAmount), expTs, allowedMerchant]
                  });
                }}>
                  <label className="label">Select Funded Program *</label>
                  <select
                    className="input"
                    value={issueProg}
                    onChange={e => setIssueProg(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Program --</option>
                    {programs?.map(p => (
                      <option key={p.id.toString()} value={p.id.toString()}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <label className="label">Beneficiary Wallet *</label>
                  <input
                    className="input"
                    placeholder="0x..."
                    value={issueBen}
                    onChange={e => setIssueBen(e.target.value)}
                    required
                  />

                  <label className="label">Voucher Value (BOT) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className="input"
                    placeholder="e.g. 0.02 BOT"
                    value={issueAmount}
                    onChange={e => setIssueAmount(e.target.value)}
                    required
                  />

                  <label className="label">Voucher Validity (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className="input"
                    value={issueDays}
                    onChange={e => setIssueDays(e.target.value)}
                    required
                  />

                  <label className="label">Specific Merchant Address (Optional)</label>
                  <input
                    className="input"
                    placeholder="0x00... (Leave blank for any category merchant)"
                    value={issueRestr}
                    onChange={e => setIssueRestr(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="btn btn-warning"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={isPending || isConfirming || !issueProg || !issueBen || !issueAmount}
                  >
                    Confirm & Issue Voucher
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MERCHANTS */}
      {activeTab === 'merchants' && (
        <div className="grid md:grid-cols-3" style={{ gap: '2rem' }}>
          <div className="md:col-span-2">
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Approved Merchants ({merchants?.length || 0})</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Merchants receive instant native BOT settlement upon voucher redemptions.
            </p>

            {merchants && merchants.length > 0 ? (
              <div className="grid md:grid-cols-2" style={{ gap: '1rem' }}>
                {merchants.map(m => (
                  <MerchantCard key={m.account} merchant={m} orgId={org.id} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ color: 'var(--color-muted)' }}>No merchants approved for this organization yet.</p>
              </div>
            )}
          </div>

          {isOwner && (
            <div>
              <div className="card" style={{ border: '1px solid var(--color-primary)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                  + Approve Merchant
                </h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Allowlist a store wallet to accept redemptions for a category.
                </p>

                <form onSubmit={e => {
                  e.preventDefault();
                  if (!merchAddress.trim() || !merchName.trim()) return;
                  writeContract({
                    address: VOUCHERA_CONTRACT_ADDRESS,
                    abi: VOUCHERA_ABI,
                    functionName: 'approveMerchant',
                    args: [id!, merchAddress.trim() as `0x${string}`, merchName.trim(), merchCat as `0x${string}`]
                  });
                }}>
                  <label className="label">Merchant Wallet Address *</label>
                  <input
                    className="input"
                    placeholder="0x..."
                    value={merchAddress}
                    onChange={e => setMerchAddress(e.target.value)}
                    required
                  />

                  <label className="label">Business / Store Name *</label>
                  <input
                    className="input"
                    placeholder="e.g. City Central Pharmacy"
                    value={merchName}
                    onChange={e => setMerchName(e.target.value)}
                    required
                  />

                  <label className="label">Merchant Category *</label>
                  <select
                    className="input"
                    value={merchCat}
                    onChange={e => setMerchCat(e.target.value as `0x${string}`)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                    disabled={isPending || isConfirming || !merchAddress.trim() || !merchName.trim()}
                  >
                    Approve Merchant
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: REDEMPTIONS AUDIT TRAIL */}
      {activeTab === 'redemptions' && (
        <div className="card">
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>Organization Redemption Audit Trail</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Historical record of all settled voucher redemptions across your programs.
          </p>

          {redemptions && redemptions.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Date</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Voucher</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Beneficiary</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Merchant</th>
                    <th style={{ padding: '0.75rem 0.5rem', color: 'var(--color-muted)' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r: Redemption) => (
                    <tr key={r.id.toString()} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{formatTimestamp(r.redeemedAt)}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <Link to={`/vouchers/${r.voucherId}`} style={{ color: 'var(--color-primary)' }}>
                          #{r.voucherId.toString()}
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>{formatAddress(r.beneficiary)}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>{formatAddress(r.merchant)}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{formatBOT(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--color-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No redemptions recorded for this organization yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

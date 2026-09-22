import type { VoucherProgram, Merchant } from '../types';

interface OrgSetupProgressProps {
  programs?: VoucherProgram[];
  beneficiaryCount: number;
  merchants?: Merchant[];
  redemptionsCount?: number;
  onNavigateTab: (tab: string) => void;
}

export default function OrgSetupProgress({
  programs = [],
  beneficiaryCount,
  merchants = [],
  onNavigateTab,
}: OrgSetupProgressProps) {
  const hasPrograms = programs.length > 0;
  const fundedProgram = programs.find(p => p.totalFunded > 0n);
  const isFunded = !!fundedProgram;
  const activeProgram = programs.find(p => p.status === 1);
  const isActive = !!activeProgram;
  const hasBeneficiaries = beneficiaryCount > 0;
  const hasMerchants = merchants.filter(m => m.active).length > 0;
  const hasAllocated = programs.some(p => p.totalAllocated > 0n);

  const steps = [
    {
      id: 'org',
      label: '1. Org Created',
      desc: 'Organization is registered on Bohr blockchain.',
      isDone: true,
      tab: 'programs',
      actionLabel: 'View Details',
    },
    {
      id: 'program',
      label: '2. Create Program',
      desc: hasPrograms ? `${programs.length} program(s) created` : 'Define a subsidy program (e.g. Food, Healthcare).',
      isDone: hasPrograms,
      tab: 'programs',
      actionLabel: hasPrograms ? 'Manage Programs' : '+ Create Program',
    },
    {
      id: 'fund',
      label: '3. Fund Program',
      desc: isFunded ? 'Program funding pool active.' : 'Deposit native BOT to back voucher issuance.',
      isDone: isFunded,
      tab: 'funding',
      actionLabel: isFunded ? 'View Pool' : 'Deposit BOT',
    },
    {
      id: 'activate',
      label: '4. Activate Program',
      desc: isActive ? 'Program is active on-chain.' : (isFunded ? 'Funded & ready to activate.' : 'Requires funding before activation.'),
      isDone: isActive,
      tab: 'programs',
      actionLabel: isActive ? 'Program Active' : (isFunded ? '⚡ Activate Program' : 'Fund & Activate'),
    },
    {
      id: 'parties',
      label: '5. Allowlist Parties',
      desc: hasBeneficiaries && hasMerchants ? `${beneficiaryCount} ben, ${merchants.length} merch` : 'Approve recipients & merchants.',
      isDone: hasBeneficiaries && hasMerchants,
      tab: 'beneficiaries',
      actionLabel: hasBeneficiaries ? 'Manage Merchants' : '+ Approve Beneficiary',
    },
    {
      id: 'vouchers',
      label: '6. Issue Vouchers',
      desc: hasAllocated ? 'Vouchers issued & active.' : 'Allocate restricted subsidy vouchers to beneficiaries.',
      isDone: hasAllocated,
      tab: 'beneficiaries',
      actionLabel: 'Issue Voucher',
    },
  ];

  // Determine current active recommended next step
  const activeStep = steps.find(s => !s.isDone) || steps[steps.length - 1];

  return (
    <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-primary)', background: 'linear-gradient(135deg, #0f172a 0%, #082f49 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
            📋 Organization Setup & Deployment Guide
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.825rem' }}>
            Follow these progressive steps to launch and manage your subsidy distribution program.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigateTab(activeStep.tab)}
          style={{ fontSize: '0.85rem' }}
        >
          Next: {activeStep.actionLabel} &rarr;
        </button>
      </div>

      {/* Progressive Step Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {steps.map(step => (
          <div
            key={step.id}
            onClick={() => onNavigateTab(step.tab)}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: step.isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: step.isDone ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <strong style={{ fontSize: '0.85rem', color: step.isDone ? 'var(--color-success)' : 'var(--color-text)' }}>
                {step.label}
              </strong>
              <span>{step.isDone ? '✓' : '○'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)', lineHeight: '1.3' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ forceOpen = false, onClose }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }
    const dismissed = localStorage.getItem('vouchera_onboarding_dismissed');
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleClose = () => {
    localStorage.setItem('vouchera_onboarding_dismissed', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const steps = [
    {
      title: 'Welcome to Vouchera 🛡️',
      badge: 'Introduction',
      icon: '🛡️',
      content: (
        <div>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--color-text)', marginBottom: '1rem' }}>
            <strong>Vouchera</strong> is a decentralized Web3 protocol on <strong>Bohr Testnet</strong> designed for organizations to distribute verified, restricted digital subsidy vouchers to beneficiaries.
          </p>
          <div style={{ padding: '0.85rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--color-primary)' }}>Important Distinction:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              Vouchera vouchers are <strong>restricted claims against funded BOT</strong> held in smart contracts. They are NOT freely transferable ERC-20 tokens or speculative cryptocurrencies.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Protocol Roles & Architecture 👥',
      badge: 'Roles',
      icon: '🏛️',
      content: (
        <div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Vouchera enforces clear separation of power across four key participants:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
            <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.45rem', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-warning)' }}>👑 Protocol Admin</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)' }}>Configures eligibility thresholds and records activity. Cannot withdraw org funds.</p>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.45rem', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>🏛️ Organization Owner</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)' }}>Eligible creator who establishes programs, funds with BOT, and approves recipients.</p>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.45rem', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: 'var(--color-success)' }}>🎫 Beneficiary</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)' }}>Approved wallet that receives vouchers and redeems them for services/goods.</p>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.45rem', border: '1px solid var(--color-border)' }}>
              <strong style={{ color: '#c084fc' }}>🏪 Approved Merchant</strong>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--color-muted)' }}>Verified business receiving direct native BOT settlement upon voucher redemption.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'How the Subsidy Lifecycle Moves 🔄',
      badge: 'Lifecycle',
      icon: '💸',
      content: (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>1. Activity Gate:</span>
              <span style={{ color: 'var(--color-muted)' }}>User reaches required score threshold to unlock organization creation.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>2. Organization & Programs:</span>
              <span style={{ color: 'var(--color-muted)' }}>Owner creates an org and defines subsidy programs (Food, Healthcare, etc.).</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>3. BOT Funding Pool:</span>
              <span style={{ color: 'var(--color-muted)' }}>Owner deposits native BOT. Vouchers cannot exceed funded liabilities.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>4. Voucher Issuance:</span>
              <span style={{ color: 'var(--color-muted)' }}>Owner issues non-transferable vouchers restricted to category merchants.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.4rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>5. Redemption & Settlement:</span>
              <span style={{ color: 'var(--color-muted)' }}>Beneficiary signs redemption; merchant receives real native BOT.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'You Are Ready to Explore! 🚀',
      badge: 'Get Started',
      icon: '🎯',
      content: (
        <div>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Connect your Web3 wallet (Bohr Testnet Chain ID 968) to view your eligibility score, check your vouchers, or explore active organizations.
          </p>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            💡 <em>Need help at any time? Click "How It Works" in the navigation bar to review protocol rules.</em>
          </div>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--color-primary)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
            <div>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{step.badge}</span>
              <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem' }}>{step.title}</h2>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem' }}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx <= currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div style={{ minHeight: '180px', marginBottom: '1.5rem' }}>
          {step.content}
        </div>

        {/* Modal Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{ fontSize: '0.85rem' }}
              >
                &larr; Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{ fontSize: '0.85rem' }}
              >
                Next &rarr;
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
                style={{ fontSize: '0.85rem' }}
              >
                Start Exploring Vouchera ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

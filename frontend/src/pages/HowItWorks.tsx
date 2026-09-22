import { Link } from 'react-router-dom';
import { useOrganizationThreshold, useProtocolAdmin } from '../hooks/useVouchera';
import { formatAddress } from '../utils/formatting';

export default function HowItWorks() {
  const { data: threshold } = useOrganizationThreshold();
  const { data: protocolAdmin } = useProtocolAdmin();

  const currentThreshold = threshold !== undefined ? threshold.toString() : '10';

  return (
    <div>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '9999px', fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          <span>📖 Complete Protocol Guide</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 1rem 0' }}>
          How Vouchera Works
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
          A clear, plain-language guide to verified digital subsidies, on-chain eligibility, voucher restrictions, and native BOT settlement on Bohr blockchain.
        </p>
      </div>

      {/* Section 1: What is Vouchera? */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
          1. What is Vouchera?
        </h2>
        <p style={{ lineHeight: '1.6', color: 'var(--color-text)', fontSize: '0.95rem' }}>
          Vouchera is a decentralized subsidy management platform. It allows humanitarian organizations, governments, universities, and charities to allocate blockchain-backed financial assistance to people in need, while ensuring that the funds can <strong>only be spent for approved purposes at verified merchants</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <strong style={{ color: 'var(--color-primary)' }}>✓ What Vouchera IS:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: 'var(--color-text)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <li>A controlled digital subsidy & voucher system</li>
              <li>Backed by real native BOT deposited into smart contracts</li>
              <li>Restricted to verified merchants (Food, Healthcare, Education, etc.)</li>
              <li>A direct settlement rail to merchants upon redemption</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <strong style={{ color: 'var(--color-danger)' }}>✕ What Vouchera IS NOT:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: 'var(--color-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <li>NOT an earning or task-reward platform (No "Earn-to-Pay")</li>
              <li>NOT a speculative cryptocurrency or transferable ERC-20 token</li>
              <li>Beneficiaries cannot trade, dump, or cash out vouchers</li>
              <li>Merchants cannot withdraw funds without beneficiary authorization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Four Key Roles */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
          2. The Four Protocol Roles
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Each wallet on Vouchera operates with distinct, cryptographically enforced permissions:
        </p>

        <div className="grid md:grid-cols-2" style={{ gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>👑</span>
              <h3 style={{ margin: 0, color: 'var(--color-warning)' }}>Protocol Admin</h3>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
              The deployer of the protocol. Responsible for protocol-wide settings (e.g. setting the organization creation threshold) and recording verified activity scores for participants.
            </p>
            <span style={{ fontSize: '0.785rem', color: 'var(--color-muted)' }}>
              🔒 <em>Cannot withdraw or control any organization's subsidy funds.</em>
            </span>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span>
              <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>Organization Owner</h3>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
              An eligible user who creates an organization. Sovereign manager of their own programs, native BOT funding pools, approved beneficiaries, and verified merchants.
            </p>
            <span style={{ fontSize: '0.785rem', color: 'var(--color-muted)' }}>
              🔒 <em>Cannot manage or interfere with other organizations.</em>
            </span>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎫</span>
              <h3 style={{ margin: 0, color: 'var(--color-success)' }}>Beneficiary</h3>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
              An approved recipient wallet that receives non-transferable vouchers. Can view available balances, check expiration dates, and authorize redemptions with approved merchants.
            </p>
            <span style={{ fontSize: '0.785rem', color: 'var(--color-muted)' }}>
              🔒 <em>Cannot issue vouchers or withdraw funds to cash directly.</em>
            </span>
          </div>

          <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🏪</span>
              <h3 style={{ margin: 0, color: '#c084fc' }}>Approved Merchant</h3>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
              A business wallet allowlisted by an organization for a specific category (e.g. Food). Receives actual native BOT instantly on-chain when a beneficiary redeems a voucher.
            </p>
            <span style={{ fontSize: '0.785rem', color: 'var(--color-muted)' }}>
              🔒 <em>Cannot claim vouchers without beneficiary signing the transaction.</em>
            </span>
          </div>
        </div>
      </section>

      {/* Section 3: How Money & Subsidies Move */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
          3. How Money & Subsidies Move (The 5 Lifecycle Steps)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#04101e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>1. Create Subsidy Program (Status: Draft)</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                The organization owner calls <code>createProgram</code> to establish a category-locked program container (e.g. Food, Healthcare, Education).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#04101e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>2. Deposit Native BOT into Program Pool</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                The owner calls <code>fundProgram</code> and deposits native BOT tokens into the smart contract. This forms the verifiable liquidity backing all issued vouchers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#04101e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>3. Activate Program (Status: Active)</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                The owner calls <code>activateProgram</code> on the funded program. Once activated, the program is live and vouchers can be allocated to approved beneficiaries.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#04101e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>4. Issue Restricted Voucher to Beneficiary</h4>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                The owner issues a voucher to an approved beneficiary wallet. The contract ensures <code>totalAllocated &le; totalFunded</code> so no unfunded vouchers can ever be created.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.85rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-success)', color: '#04101e', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>5</div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-success)' }}>5. Beneficiary Redemption & Direct BOT Settlement</h4>
              <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.85rem' }}>
                The beneficiary presents their voucher at an approved merchant and calls <code>redeemVoucher</code>. The contract atomically transfers actual native BOT from the program pool to the merchant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Eligibility Mechanism */}
      <section id="eligibility" className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-warning)' }}>
        <h2 className="section-title" style={{ color: 'var(--color-warning)', fontSize: '1.5rem' }}>
          4. The On-Chain Eligibility Gate Explained
        </h2>
        <p style={{ lineHeight: '1.6', color: 'var(--color-text)', fontSize: '0.95rem' }}>
          To prevent spam organizations and maintain subsidy integrity, Vouchera requires wallets to achieve an on-chain <strong>Activity Score threshold</strong> (currently <strong>{currentThreshold} points</strong>) before creating an organization.
        </p>

        <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '0.5rem', marginTop: '1rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-warning)' }}>How is Activity Recorded?</h4>
          <p style={{ margin: 0, color: 'var(--color-text)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Qualifying activity points are recorded on-chain by the Protocol Admin (<code>{protocolAdmin ? formatAddress(protocolAdmin) : 'Deployer'}</code>) for verified community participants and partner institutions.
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/organizations" className="btn btn-primary">
            Check Your Eligibility &rarr;
          </Link>
          <Link to="/" className="btn btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </section>

      {/* Section 5: Protocol Invariants */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title" style={{ color: 'var(--color-primary)', fontSize: '1.5rem' }}>
          5. Core Protocol Guarantees & Invariants
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <strong>🔒 Non-Transferable Vouchers:</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-muted)' }}>Vouchers cannot be transferred or traded to prevent subsidy diversion.</p>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <strong>🛡️ Double-Spend Protection:</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-muted)' }}>Remaining balances are reduced atomically upon valid redemptions.</p>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <strong>⏰ Automatic Expiry Enforcement:</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-muted)' }}>Redemptions revert after expiration; unused funds are reclaimed by the org owner.</p>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem' }}>
            <strong>🏛️ Organization Isolation:</strong>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--color-muted)' }}>Each organization operates in complete cryptographic isolation.</p>
          </div>
        </div>
      </section>

      {/* Section 6: Jargon Buster Glossary */}
      <section className="card">
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
          6. Web3 & Vouchera Glossary
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <strong>BOT Token:</strong>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)' }}>The native settlement asset on Bohr Testnet used to fund programs and pay merchants.</p>
          </div>
          <div>
            <strong>Activity Score:</strong>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)' }}>An on-chain participation counter determining organization creation eligibility.</p>
          </div>
          <div>
            <strong>Category Code:</strong>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)' }}>A <code>bytes32</code> identifier (e.g. FOOD, HEALTHCARE) matching vouchers with approved merchants.</p>
          </div>
          <div>
            <strong>Redemption:</strong>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-muted)' }}>The act of a beneficiary spending voucher value, triggering instant BOT payout to the merchant.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useOrganizationThreshold, useAllOrganizations, useAllRedemptions } from '../hooks/useVouchera';
import { CATEGORIES } from '../utils/categories';
import { VOUCHERA_CONTRACT_ADDRESS, BOHR_EXPLORER } from '../config/contracts';
import { formatAddress } from '../utils/formatting';
import WhatCanIDoNow from '../components/WhatCanIDoNow';
import Tooltip from '../components/Tooltip';

export default function Home() {
  const { data: threshold } = useOrganizationThreshold();
  const { data: orgs } = useAllOrganizations();
  const { data: redemptions } = useAllRedemptions(0n, 100n);

  const flowSteps = [
    { num: '1', title: 'Earn Eligibility', desc: 'Participate in the protocol to reach the on-chain activity score threshold.', icon: '🎯', link: '/how-it-works#eligibility' },
    { num: '2', title: 'Create Organization', desc: 'Eligible users establish an independent organization and become its sovereign owner.', icon: '🏛️', link: '/organizations' },
    { num: '3', title: 'Fund Subsidy Pool', desc: 'Deposit native BOT into restricted subsidy programs (Food, Healthcare, Education).', icon: '💰', link: '/programs' },
    { num: '4', title: 'Issue Vouchers', desc: 'Allocate non-transferable, restricted digital vouchers to approved beneficiaries.', icon: '🎫', link: '/my-vouchers' },
    { num: '5', title: 'Merchant Settlement', desc: 'Beneficiary redeems voucher; approved merchant receives actual BOT on-chain.', icon: '🏪', link: '/merchants' },
  ];

  return (
    <div>
      {/* Dynamic Role & Permission Matrix */}
      <WhatCanIDoNow />

      {/* Hero Section */}
      <section className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '9999px', fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
          <span>🛡️</span>
          <span>Bohr Testnet Live Subsidy Protocol</span>
        </div>
        <h1>Vouchera — Verified Digital Subsidies</h1>
        <p>
          A decentralized Web3 protocol enabling organizations to fund, restrict, and distribute native BOT-backed subsidy vouchers to verified beneficiaries with automated merchant settlement.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/how-it-works" className="btn btn-primary">
            📖 How Vouchera Works
          </Link>
          <Link to="/organizations" className="btn btn-secondary">
            Explore Organizations
          </Link>
          <Link to="/my-vouchers" className="btn btn-secondary">
            My Vouchers
          </Link>
          <Link to="/activity" className="btn btn-secondary">
            Live Network Activity
          </Link>
        </div>
      </section>

      {/* Protocol Metrics */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-primary)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              ACTIVE ORGANIZATIONS
              <Tooltip content="Total verified organizations created on-chain by eligible owners." />
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--color-primary)' }}>
              {orgs?.length || 0}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-secondary)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              ON-CHAIN REDEMPTIONS
              <Tooltip content="Total completed voucher redemptions with instant BOT merchant payouts." />
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: '#a855f7' }}>
              {redemptions?.length || 0}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-success)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
              CREATION THRESHOLD
              <Tooltip content="Required activity score before a wallet can create an organization." />
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--color-success)' }}>
              {threshold !== undefined ? `${threshold.toString()} pts` : '10 pts'}
            </p>
          </div>
        </div>
      </section>

      {/* Interactive 5-Step Protocol Journey */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          The Vouchera Subsidy Journey
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '2.5rem' }}>
          Click on any step below to explore its role and contract interactions
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.25rem' }}>
          {flowSteps.map(step => (
            <Link
              key={step.num}
              to={step.link}
              className="card"
              style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{step.icon}</span>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {step.num}
                </span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: 'var(--color-text)' }}>{step.title}</h3>
              <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {step.desc}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                Explore Step &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subsidy Voucher Categories */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          Supported Voucher Categories
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '2rem' }}>
          Vouchers enforce strict on-chain category restrictions — usable only at approved merchants.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.25rem' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem', width: '60px', height: '60px', background: `${cat.color}15`, border: `1px solid ${cat.color}35`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.emoji}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: cat.color }}>{cat.name}</h4>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                  Restricted Subsidy Asset
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transparency & Disclaimer Box */}
      <section className="card" style={{ textAlign: 'center', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          🔒 Non-Transferable Digital Subsidies
        </p>
        <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.5' }}>
          Vouchera vouchers are <strong>restricted claims against funded subsidy value</strong> held by smart contract <a href={`${BOHR_EXPLORER}address/${VOUCHERA_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{formatAddress(VOUCHERA_CONTRACT_ADDRESS)}</a>. They are NOT speculative tokens and cannot be freely transferred or traded between wallets.
        </p>
      </section>
    </div>
  );
}

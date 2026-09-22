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

  return (
    <div>
      {/* Dynamic Role & Action Matrix */}
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/organizations" className="btn btn-primary">
            Explore Organizations
          </Link>
          <Link to="/programs" className="btn btn-secondary">
            Subsidy Programs
          </Link>
          <Link to="/my-vouchers" className="btn btn-secondary">
            My Vouchers
          </Link>
          <Link to="/how-it-works" className="btn btn-secondary">
            📖 Protocol Guide
          </Link>
        </div>
      </section>

      {/* Protocol Metrics */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="grid grid-cols-3" style={{ gap: '1.25rem' }}>
          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-primary)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.825rem', margin: '0 0 0.5rem 0' }}>
              ACTIVE ORGANIZATIONS
              <Tooltip content="Total verified organizations created on-chain by eligible owners." />
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, color: 'var(--color-primary)' }}>
              {orgs?.length || 0}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-secondary)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.825rem', margin: '0 0 0.5rem 0' }}>
              ON-CHAIN REDEMPTIONS
              <Tooltip content="Total completed voucher redemptions with instant BOT merchant payouts." />
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, color: '#a855f7' }}>
              {redemptions?.length || 0}
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '3px solid var(--color-success)' }}>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.825rem', margin: '0 0 0.5rem 0' }}>
              CREATION THRESHOLD
              <Tooltip content="Required activity score before a wallet can create an organization." />
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 900, margin: 0, color: 'var(--color-success)' }}>
              {threshold !== undefined ? `${threshold.toString()} pts` : '10 pts'}
            </p>
          </div>
        </div>
      </section>

      {/* Subsidy Voucher Categories */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.35rem' }}>
          Supported Voucher Categories
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Vouchers enforce strict on-chain category restrictions — usable only at approved merchants.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '2rem', width: '50px', height: '50px', background: `${cat.color}15`, border: `1px solid ${cat.color}35`, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cat.emoji}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', color: cat.color, fontSize: '1rem' }}>{cat.name}</h4>
                <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.785rem' }}>
                  Restricted Subsidy Asset
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transparency & Disclaimer Box */}
      <section className="card" style={{ textAlign: 'center', borderColor: 'rgba(6, 182, 212, 0.25)', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.35rem 0', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.95rem' }}>
          🔒 Non-Transferable Digital Subsidies
        </p>
        <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.85rem', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.5' }}>
          Vouchera vouchers are <strong>restricted claims against funded subsidy value</strong> held by smart contract <a href={`${BOHR_EXPLORER}address/${VOUCHERA_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{formatAddress(VOUCHERA_CONTRACT_ADDRESS)}</a>. They are NOT speculative tokens and cannot be freely transferred or traded between wallets.
        </p>
      </section>
    </div>
  );
}

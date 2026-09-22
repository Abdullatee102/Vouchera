import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { useProtocolAdmin } from '../hooks/useVouchera';
import WalletButton from './WalletButton';
import RoleBadge from './RoleBadge';
import OnboardingModal from './OnboardingModal';
import { VOUCHERA_CONTRACT_ADDRESS, BOHR_CHAIN_ID, BOHR_EXPLORER } from '../config/contracts';
import { formatAddress } from '../utils/formatting';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const location = useLocation();
  const { data: protocolAdmin } = useProtocolAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const isAdmin = address && protocolAdmin && address.toLowerCase() === protocolAdmin.toLowerCase();
  const isCorrectNetwork = !isConnected || chainId === BOHR_CHAIN_ID;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/how-it-works', label: '📖 Guide' },
    { to: '/organizations', label: 'Organizations' },
    { to: '/programs', label: 'Programs' },
    { to: '/my-vouchers', label: 'My Vouchers' },
    { to: '/merchants', label: 'Merchants' },
    { to: '/activity', label: 'Activity' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="app-container">
      {/* Interactive First-Time Onboarding Modal */}
      <OnboardingModal forceOpen={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Network Warning Banner */}
      {!isCorrectNetwork && (
        <div className="network-alert">
          ⚠️ You are connected to an unsupported network (Chain ID: {chainId}). Please switch to <strong>Bohr Testnet (Chain ID 968)</strong>.
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" onClick={closeMenu} className="brand-logo">
            <span className="brand-icon">🛡️</span>
            <span className="brand-name">Vouchera</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`nav-link nav-link-admin ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                ⚙️ Protocol Admin
              </Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Active User Role Badge */}
          <RoleBadge />

          {/* Tour / Help Trigger */}
          <button
            className="btn btn-secondary"
            onClick={() => setTourOpen(true)}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.785rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            title="Open Interactive Guide"
          >
            <span>💡</span>
            <span className="hide-mobile">Tour</span>
          </button>

          <WalletButton />

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <RoleBadge />
          </div>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`mobile-nav-link mobile-nav-admin ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              ⚙️ Protocol Admin
            </Link>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => {
              closeMenu();
              setTourOpen(true);
            }}
            style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
          >
            📖 Open Interactive Tour
          </button>
        </div>
      )}

      {/* Main Page Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Vouchera Protocol</strong>
            </div>
            <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Verified, restricted digital subsidy vouchers on Bohr Testnet.
            </p>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)', textAlign: 'right' }}>
            <p style={{ margin: '0 0 0.25rem' }}>
              Contract: <a href={`${BOHR_EXPLORER}address/${VOUCHERA_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{formatAddress(VOUCHERA_CONTRACT_ADDRESS)}</a>
            </p>
            <p style={{ margin: 0 }}>
              Settlement Asset: <strong>BOT (Native)</strong> &bull; Chain ID: <strong>968</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

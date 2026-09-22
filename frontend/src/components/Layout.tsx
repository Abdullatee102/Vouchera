import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { useProtocolAdmin } from '../hooks/useVouchera';
import WalletButton from './WalletButton';
import RoleBadge from './RoleBadge';
import { VOUCHERA_CONTRACT_ADDRESS, BOHR_CHAIN_ID, BOHR_EXPLORER } from '../config/contracts';
import { formatAddress } from '../utils/formatting';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const location = useLocation();
  const { data: protocolAdmin } = useProtocolAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Network Warning Banner */}
      {!isCorrectNetwork && (
        <div className="network-alert">
          ⚠️ You are connected to an unsupported network (Chain ID: {chainId}). Please switch to <strong>Bohr Testnet (Chain ID 968)</strong>.
        </div>
      )}

      {/* Top Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
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
                ⚙️ Admin
              </Link>
            )}
          </div>
        </div>

        <div className="navbar-right">
          {/* Active User Role Badge (Large Desktop Only) */}
          <div className="role-badge-desktop">
            <RoleBadge />
          </div>

          <div className="wallet-button-container">
            <WalletButton />
          </div>

          {/* Mobile/Medium Screen Hamburger Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Drawer Menu for Split-Screen PC, Tablets & Mobile */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
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

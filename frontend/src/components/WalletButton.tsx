import { useAccount } from 'wagmi';

export default function WalletButton() {
  const { chainId, isConnected } = useAccount();

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {isConnected && chainId !== 968 && (
        <span className="badge badge-danger">Wrong Network</span>
      )}
      <appkit-button />
    </div>
  );
}

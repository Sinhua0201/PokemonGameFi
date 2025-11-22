'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect } from 'react';
import { linkWalletToFirebase } from '@/lib/auth';
import { useWalletStore } from '@/store/walletStore';
import { toast } from 'sonner';

export function WalletConnect() {
  const account = useCurrentAccount();
  const { setWallet, disconnect } = useWalletStore();

  useEffect(() => {
    if (account?.address) {
      // Update wallet store
      setWallet(account.address, '0'); // Balance will be fetched separately
      
      // Try to link wallet to Firebase Auth (optional feature)
      linkWalletToFirebase(account.address)
        .then(() => {
          console.log('✅ Firebase authentication successful');
        })
        .catch((error) => {
          console.warn('⚠️ Firebase authentication failed (optional feature):', error);
          // Don't show error toast - this is optional and doesn't affect core functionality
        });
    } else {
      disconnect();
    }
  }, [account, setWallet, disconnect]);

  return (
    <>
      <div className="wallet-connect-container">
        {!account ? (
          <div className="connect-button-wrapper">
            <ConnectButton />
          </div>
        ) : (
          <div className="connected-wallet">
            <div className="wallet-status">
              <div className="status-indicator"></div>
              <span className="status-text">Connected</span>
            </div>
            <span className="wallet-address">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .wallet-connect-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connect-button-wrapper {
          position: relative;
        }

        .connect-button-wrapper :global(button) {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          font-size: 1.125rem !important;
          padding: 1rem 2.5rem !important;
          border-radius: 12px !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
          position: relative;
          overflow: hidden;
        }

        .connect-button-wrapper :global(button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6) !important;
        }

        .connect-button-wrapper :global(button:active) {
          transform: translateY(0);
        }

        .connected-wallet {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          min-width: 200px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .wallet-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          50% {
            opacity: 0.8;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
          }
        }

        .status-text {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .wallet-address {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .connect-button-wrapper :global(button) {
            font-size: 1rem !important;
            padding: 0.875rem 2rem !important;
          }

          .connected-wallet {
            min-width: 160px;
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </>
  );
}

/**
 * WalletConnection Component
 * 
 * Handles wallet connection/disconnection and displays connected address
 * 
 * Features:
 * - Connect button with loading state
 * - Show connected address
 * - Disconnect functionality
 * - Copy address to clipboard
 * - Check if Freighter is installed
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCopy, FaCheck } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import { Card } from './example-components';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(`Failed to connect wallet:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Card title="Connect Your Wallet">
        <p className="text-gray-600 mb-6">
          Connect your Stellar wallet to view your balance and make transactions.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
              Connecting...
            </>
          ) : (
            <>
              <FaWallet className="text-xl" />
              Connect Wallet
            </>
          )}
        </button>

        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-gray-700 text-sm mb-3">
            <strong>Supported Wallets</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>- Freighter</div>
            <div>- xBull</div>
            <div>- Albedo</div>
            <div>- Rabet</div>
            <div>- Lobstr</div>
            <div>- Hana</div>
            <div>- WalletConnect</div>
            <div>- More...</div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Click "Connect Wallet" to choose your preferred wallet
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600 text-sm">Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-danger-500 hover:text-danger-400 text-sm flex items-center gap-2 transition-colors"
        >
          <MdLogout /> Disconnect
        </button>
      </div>

      <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
        <p className="text-gray-600 text-xs mb-2">Your Address</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-gray-900 font-mono text-sm break-all">
            {publicKey}
          </p>
          <button
            onClick={handleCopyAddress}
            className="text-secondary-500 hover:text-secondary-400 text-xl flex-shrink-0 transition-colors"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? <FaCheck className="text-success-500" /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={stellar.getExplorerLink(publicKey, 'account')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary-500 hover:text-secondary-400 text-sm underline"
        >
          View on Stellar Expert →
        </a>
      </div>
    </Card>
  );
}


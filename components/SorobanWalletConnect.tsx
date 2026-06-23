import React, { useState } from 'react';
import { connectWallet } from '@/lib/contract';

interface SorobanWalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  connectedAddress?: string;
}

export default function SorobanWalletConnect({
  onConnect,
  onDisconnect,
  connectedAddress,
}: SorobanWalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const address = await connectWallet();
      onConnect(address);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setError(null);
  };

  const formatAddress = (address: string) => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connectedAddress) {
    return (
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-primary-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connected</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-primary-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Connected Address</p>
              <p className="text-lg font-mono font-bold text-gray-900">
                {formatAddress(connectedAddress)}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(connectedAddress)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Copy
            </button>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Disconnect Wallet
          </button>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Network:</strong> Stellar Testnet
            </p>
            <p className="text-blue-800 text-sm">
              <strong>Contract:</strong> {connectedAddress.slice(0, 8)}...
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-primary-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Soroban Wallet</h2>
      
      <p className="text-gray-600 mb-6">
        Connect your Stellar wallet to interact with the Invoforge smart contract on testnet.
      </p>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="text-xl" fill="currentColor" height="1em" stroke="currentColor" strokeWidth="0" viewBox="0 0 512 512" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M461.2 128H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h384c8.84 0 16-7.16 16-16 0-26.51-21.49-48-48-48H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h397.2c28.02 0 50.8-21.53 50.8-48V176c0-26.47-22.78-48-50.8-48zM416 336c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"></path>
            </svg>
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
        </div>
        <p className="text-gray-500 text-xs mt-3">
          Click "Connect Wallet" to choose your preferred wallet
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

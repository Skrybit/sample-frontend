'use client';

import { useWallet } from '@/contexts/WalletContext';

export default function WalletConnect() {
  const { address, balance, isConnected, connect, disconnect } = useWallet();

  return (
    <div className="flex flex-col items-end space-y-2">
      {isConnected ? (
        <>
          <div className="text-sm text-gray-600">
            <span>Balance: {balance} BTC</span>
          </div>
          <div className="text-sm text-gray-600">
            <span>Address: {address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
          <button
            onClick={disconnect}
            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connect}
          className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Connect UniSat Wallet
        </button>
      )}
    </div>
  );
}

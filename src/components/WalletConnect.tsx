'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WallletContextNew';

export default function WalletConnect() {
  const [showModal, setShowModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { detectedWallets, address, balance, isConnected, connect, disconnect } = useWallet();
  useEffect(() => {
    if (isConnected) {
      setShowModal(false);
      setIsConnecting(false);
    }
  }, [isConnected]);
  return (
    <div className='font-sans max-w-md mx-auto'>
      {isConnected ? (
        <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
          <div className='space-y-4 mb-6'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-500 text-sm'>Balance:</span>
              <span className='font-semibold text-2xl text-gray-800'>{balance} BTC</span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-500 text-sm'>Payment Address:</span>
              <span className='font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded'>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          </div>

          <button
            onClick={disconnect}
            className='w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                 transition-all duration-200 transform hover:scale-[1.02] active:scale-95
                 flex items-center justify-center space-x-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            <span>Disconnect Wallet</span>
          </button>
        </div>
      ) : (
        <button
          onClick={async () => {
            setShowModal(true);
          }}
          className={
            `py-3 px-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
               transition-all duration-200 transform hover:scale-[1.02] active:scale-95
               shadow-lg flex items-center justify-center space-x-2` +
            ` ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`
          }
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
          </svg>

          <span>{isConnecting ? 'Connecting...' : 'Connect Bitcoin Wallet'}</span>
        </button>
      )}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50'>
          <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-80'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Select Wallet</h3>

            {detectedWallets.length === 0 && (
              <p className='text-gray-500 text-center py-4'>No Bitcoin wallets detected</p>
            )}

            <div className='space-y-2'>
              {detectedWallets.map((wallet) => (
                <button
                  key={wallet}
                  onClick={async () => {
                    setIsConnecting(true);
                    // Add artificial delay, remove on prod
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    try {
                      await connect(wallet);
                    } finally {
                      setIsConnecting(false);
                    }
                  }}
                  className={`w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 flex items-center 
    ${isConnecting ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'}`}
                  disabled={isConnecting}
                >
                  <span className={`capitalize font-medium ${isConnecting ? 'text-gray-400' : 'text-gray-700'}`}>
                    {isConnecting ? 'Connecting...' : wallet}
                  </span>
                  {isConnecting && (
                    <svg className='ml-2 h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className='mt-6 border-t pt-4'>
              <button
                onClick={() => setShowModal(false)}
                className='w-full px-4 py-2 text-red-600 hover:text-red-700 bg-transparent hover:bg-red-50 rounded-lg transition-colors duration-200 border border-red-100 hover:border-red-200'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
// import { useWallet } from '@/contexts/WalletContext';
import { useWallet } from '@/contexts/WallletContextNew';

export default function WalletConnect() {
  const [showModal, setShowModal] = useState(false);
  const { detectedWallets, address, balance, isConnected, connect, disconnect } = useWallet();
  return (
    <div className='flex flex-col items-end space-y-2'>
      {isConnected ? (
        <>
          <div className='text-sm text-gray-600'>
            <span>Balance: {balance} BTC</span>
          </div>
          <div className='text-sm text-gray-600'>
            <span>
              Payments Address: {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnect}
            className='py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className='py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
        >
          Connect Bitcoin Wallet
        </button>
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <h3>Select Wallet</h3>
          {detectedWallets.length === 0 && <p>No Bitcoin wallets detected</p>}

          {detectedWallets.map((wallet) => (
            <button
              key={wallet}
              onClick={() => connect(wallet)}
              style={{
                display: 'block',
                margin: '10px 0',
                padding: '10px 20px',
                width: '100%',
              }}
            >
              {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
            </button>
          ))}

          <button
            className='py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
            onClick={() => setShowModal(false)}
            style={{ marginTop: '15px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
// return (
//   <div className='flex flex-col items-end space-y-2'>
//     {isConnected ? (
//       <>
//         <div className='text-sm text-gray-600'>
//           <span>Balance: {balance} BTC</span>
//         </div>
//         <div className='text-sm text-gray-600'>
//           <span>
//             Payments Address: {address.slice(0, 6)}...{address.slice(-4)}
//           </span>
//         </div>
//         <div className='text-sm text-gray-600'>
//           <span>
//             Ordinals Address: {ordinalsAddress.slice(0, 6)}...
//             {ordinalsAddress.slice(-4)}
//           </span>
//         </div>
//         <button
//           onClick={disconnect}
//           className='py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
//         >
//           Disconnect
//         </button>
//       </>
//     ) : (
//       <button
//         onClick={connect}
//         className='py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
//       >
//         Connect Bitcoin Wallet
//       </button>
//     )}
//   </div>
// );

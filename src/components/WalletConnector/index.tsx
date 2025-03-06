'use client';

import { useState, useEffect } from 'react';

type WalletType = 'unisat' | 'xverse' | 'leather';

// logic is moved to the context. will remove it later
const WalletConnector = () => {
  const [address, setAddress] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<WalletType[]>([]);
  const [error, setError] = useState<string>('');

  // Detect available wallets
  const detectWallets = () => {
    const wallets: WalletType[] = [];
    if (typeof window.unisat !== 'undefined') wallets.push('unisat');
    if (typeof window.BitcoinProvider !== 'undefined') wallets.push('xverse');
    // if (typeof window.bitcoin !== "undefined") wallets.push("xverse");
    if (typeof window.leather !== 'undefined') wallets.push('leather');

    setDetectedWallets(wallets);
  };

  useEffect(() => {
    // Initial detection
    detectWallets();

    // Listen for wallet injections that might happen after page load
    window.addEventListener('load', detectWallets);
    return () => window.removeEventListener('load', detectWallets);
  }, []);

  const connectWallet = async (walletType: WalletType) => {
    try {
      setError('');
      let address: string;

      switch (walletType) {
        case 'unisat':
          const accounts = await window.unisat!.requestAccounts();
          const accountsA = await window.unisat!.getAccounts();
          address = accounts[0];

          console.log('aa', accounts);
          console.log('aab', accountsA);
          const responseBalance = await window.unisat!.getBalance();
          console.log('response balance', responseBalance);
          break;

        case 'xverse':
          if (!window.BitcoinProvider) throw new Error('Xverse not detected');

          const result = await window.BitcoinProvider.request('getAccounts', {
            purposes: ['payment', 'ordinals'], // Required parameter
            message: 'Please select account to connect',
          });

          console.log('rr', result.result);
          if (!result?.result?.length) {
            throw new Error('No accounts found');
          }

          address = result.result[0].address;

          const responseBalanceB = await window.BitcoinProvider!.request('getBalance', undefined);
          console.log('response balance', responseBalanceB.result);
          break;

        case 'leather':
          const response = await window.leather!.request('connect');
          address = response.addresses[0].address;
          break;

        default:
          throw new Error('Unsupported wallet');
      }

      setAddress(address);
      setShowModal(false);
    } catch (err) {
      setError(`Connection failed: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setAddress('');
  };

  return (
    <div>
      {address ? (
        <div>
          <p>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => setShowModal(true)}>Connect Wallet</button>
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
              onClick={() => connectWallet(wallet)}
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

          <button onClick={() => setShowModal(false)} style={{ marginTop: '15px' }}>
            Close
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;

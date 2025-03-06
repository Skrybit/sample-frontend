'use client';

import { ReactNode, createContext, useContext, useCallback, useState, useEffect } from 'react';
import toaster from 'react-hot-toast';

type WalletType = 'unisat' | 'xverse' | 'leather';
type AddressPurpose = string;

interface WalletProviderProps {
  children: ReactNode;
}

interface WalletContextType {
  address: string;
  balance: string;
  isConnected: boolean;
  detectedWallets: WalletType[];
  connect: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: '',
  balance: '0',
  isConnected: false,
  detectedWallets: [],
  connect: async () => {},
  disconnect: () => {},
});

//
export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: WalletProviderProps) {
  const [detectedWallets, setDetectedWallets] = useState<WalletType[]>([]);
  const [currentWalletType, setCurrentWalletType] = useState<WalletType>();

  // @TODO: too many states. add local reducer here
  const [paymentAddress, setPaymentAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);

  // @TODO: move to utils
  const showFullError = useCallback(
    (errMsg: string) => () => {
      console.error(errMsg);
      toaster.error(errMsg);
    },
    [],
  );

  // @TODO: move to hooks
  const setUserAddresses = useCallback(
    (
      addresses: Array<{
        address: string;
        publicKey?: string;
        purpose: AddressPurpose;
      }>,
    ) => {
      const paymentAddressItem = addresses.find((address) => address.purpose === 'payment');

      console.log('paymentAddressItem', paymentAddressItem);

      setPaymentAddress(paymentAddressItem?.address || '');
    },
    [],
  );

  // @TODO: move to the hook
  const getAccountBalance = useCallback(async (walletType: WalletType) => {
    try {
      let totalBalance = '';
      switch (walletType) {
        case 'unisat':
          const responseBalance = await window.unisat!.getBalance();
          console.log('response balance', responseBalance);
          totalBalance = responseBalance.total + '';
          break;

        case 'xverse':
          if (!window.BitcoinProvider) throw new Error('Xverse not detected');

          const responseBalanceB = await window.BitcoinProvider!.request('getBalance', undefined);
          console.log('response balance', responseBalanceB.result);
          totalBalance = responseBalanceB.result.total;
          break;

        case 'leather':
          const responseBalanceC = await window.leather!.request('getBalance', undefined);
          console.log('response balance', responseBalanceC.result);
          totalBalance = responseBalanceC.result.total;
          break;

        default:
          throw new Error('Unsupported wallet');
      }

      setBalance((+totalBalance / 100000000).toFixed(8)); // Convert satoshis to BTC - not ideal here :(
    } catch (err) {
      const errMsg = 'Could not receive user balance: ' + JSON.stringify((err as Error).message);
      showFullError(errMsg);
    }
  }, []);

  // Detect available wallets
  const detectWallets = () => {
    const wallets: WalletType[] = [];
    if (typeof window.unisat !== 'undefined') wallets.push('unisat');
    if (typeof window.BitcoinProvider !== 'undefined') wallets.push('xverse');
    if (typeof window.leather !== 'undefined') wallets.push('leather');

    setDetectedWallets(wallets);
  };

  useEffect(() => {
    detectWallets();

    // Listen for wallet injections that might happen after page load
    window.addEventListener('load', detectWallets);
    return () => window.removeEventListener('load', detectWallets);
  }, []);

  useEffect(() => {
    if (isConnected && currentWalletType) {
      getAccountBalance(currentWalletType);
    }
  }, [isConnected]);

  const connectWallet = async (walletType: WalletType) => {
    setCurrentWalletType(walletType);

    try {
      let address: string;

      switch (walletType) {
        case 'unisat':
          const accounts = await window.unisat!.requestAccounts();
          console.log('aa', accounts);
          address = accounts?.[0];

          if (!address) {
            const errMsg = 'No accounts found';
            showFullError(errMsg);
            return;
          }

          setUserAddresses([{ address, purpose: 'payment' }]);
          setIsConnected(true);
          break;

        case 'xverse':
          if (!window.BitcoinProvider) throw new Error('Xverse not detected');

          const result = await window.BitcoinProvider.request('getAccounts', {
            purposes: ['payment', 'ordinals'], // Required parameter
            message: 'Please select account to connect',
          });

          if (!result?.result?.length) {
            // throw new Error('No accounts found');
            const errMsg = 'No accounts found';
            showFullError(errMsg);
            return;
          }

          address = result.result[0].address;

          setUserAddresses(result.result);
          setIsConnected(true);
          break;

        case 'leather':
          const response = await window.leather!.request('connect');
          address = response.addresses[0].address;

          setUserAddresses(response.addresses);
          setIsConnected(true);
          break;

        default: {
          const errMsg = 'Unsupported wallet';
          showFullError(errMsg);
          return;
        }
      }

      // setAddress(address);
      // setShowModal(false);
      toaster.success('Connected', { id: '2' });
    } catch (err) {
      const errMsg = 'Connection failed' + JSON.stringify((err as Error).message);
      showFullError(errMsg);
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    // setAddress('');
    //
    setPaymentAddress('');
    setBalance('0');
    setIsConnected(false);
    toaster.success('Disconnected', { id: '3' });
  };

  return (
    <WalletContext.Provider
      value={{
        address: paymentAddress,
        balance,
        isConnected,
        detectedWallets,
        connect: connectWallet,
        disconnect: disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
  // return (
  //   <div>
  //     {address ? (
  //       <div>
  //         <p>
  //           Connected: {address.slice(0, 6)}...{address.slice(-4)}
  //         </p>
  //         <button onClick={disconnectWallet}>Disconnect</button>
  //       </div>
  //     ) : (
  //       <button onClick={() => setShowModal(true)}>Connect Wallet</button>
  //     )}
  //
  //     {showModal && (
  //       <div
  //         style={{
  //           position: 'fixed',
  //           top: '50%',
  //           left: '50%',
  //           transform: 'translate(-50%, -50%)',
  //           padding: '20px',
  //           background: 'white',
  //           borderRadius: '8px',
  //           boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  //         }}
  //       >
  //         <h3>Select Wallet</h3>
  //         {detectedWallets.length === 0 && <p>No Bitcoin wallets detected</p>}
  //
  //         {detectedWallets.map((wallet) => (
  //           <button
  //             key={wallet}
  //             onClick={() => connectWallet(wallet)}
  //             style={{
  //               display: 'block',
  //               margin: '10px 0',
  //               padding: '10px 20px',
  //               width: '100%',
  //             }}
  //           >
  //             {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
  //           </button>
  //         ))}
  //
  //         <button onClick={() => setShowModal(false)} style={{ marginTop: '15px' }}>
  //           Close
  //         </button>
  //
  //         {error && <p style={{ color: 'red' }}>{error}</p>}
  //       </div>
  //     )}
  //   </div>
  // );
}

// export default WalletConnector;

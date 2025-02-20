'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  address: string;
  balance: string;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: '',
  balance: '0',
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    unisat: any;
  }
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      if (typeof window.unisat !== 'undefined') {
        const accounts = await window.unisat.requestAccounts();
        const balance = await window.unisat.getBalance();
        
        setAddress(accounts[0]);
        setBalance((balance.total / 100000000).toFixed(8)); // Convert satoshis to BTC
        setIsConnected(true);
      } else {
        throw new Error('UniSat Wallet is not installed');
      }
    } catch (error) {
      console.error('Error connecting to UniSat wallet:', error);
      alert('Please install UniSat Wallet');
    }
  };

  const disconnect = () => {
    setAddress('');
    setBalance('0');
    setIsConnected(false);
  };

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && window.unisat) {
      window.unisat.getAccounts().then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          window.unisat.getBalance().then((balance: { total: number }) => {
            setBalance((balance.total / 100000000).toFixed(8));
            setIsConnected(true);
          });
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ address, balance, isConnected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

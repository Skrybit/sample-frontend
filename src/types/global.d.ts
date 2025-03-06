type BitcoinProviderMethods = {
  getAccounts: {
    params: { purposes: string[]; message?: string };
    result: { result: Array<{ address: string; publicKey: string; purpose: string }> };
  };
  getBalance: {
    params?: { message?: string };
    result: { result: { confirmed: string; total: string; unconfirmed: string } };
  };
  signMessage: {
    params: { message: string; purpose: string };
    result: { result: { signature: string; publicKey: string } };
  };
};

declare global {
  interface Window {
    // Unisat Wallet
    unisat?: {
      requestAccounts: () => Promise<string[]>;
      getAccounts: () => Promise<string[]>;
      getBalance: () => Promise<{ confirmed: number; total: number; unconfirmed: number }>;
      on: (event: 'accountsChanged', handler: (accounts: string[]) => void) => void;
      removeListener: (event: 'accountsChanged', handler: (accounts: string[]) => void) => void;
      switchNetwork: (network: 'livenet' | 'testnet') => Promise<void>;
    };

    // Xverse Wallet
    BitcoinProvider?: {
      request<M extends keyof BitcoinProviderMethods>(
        method: M,
        params?: BitcoinProviderMethods[M]['params'],
      ): Promise<BitcoinProviderMethods[M]['result']>;

      // Fallback for unknown methods
      request<T = unknown>(method: string, params?: unknown): Promise<T>;

      connect: () => Promise<void>;
      signTransaction: (transaction: {
        psbt: string;
        options?: { finalize?: boolean; extractTx?: boolean };
      }) => Promise<{ psbt: string }>;
      signMessage: (message: string | ArrayBuffer) => Promise<{ signature: string }>;
      sendBtcTransaction: (psbt: string) => Promise<{ txid: string }>;
      isConnected: () => boolean;
      addListener: (event: string, callback: (...args: any[]) => void) => void;
    };

    // Leather Wallet (formerly Hiro Wallet)
    leather?: {
      request: <T = any>(method: string, params?: any) => Promise<T>;
      on: (event: 'accountsChanged', listener: (accounts: string[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
      isConnected: () => boolean;
    };
  }
}

// Required for TypeScript to recognize this as a module
export {};

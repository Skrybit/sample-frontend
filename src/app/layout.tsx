import type { Metadata } from 'next';
// import { WalletProvider } from "@/contexts/WalletContext";
import { WalletProvider } from '@/contexts/WallletContextNew';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bitcoin Inscription App',
  description: 'Upload and inscribe files using UniSat wallet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <WalletProvider>
          {children}
          <Toaster position='bottom-right' />
        </WalletProvider>
      </body>
    </html>
  );
}

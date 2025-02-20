import type { Metadata } from 'next'
import { WalletProvider } from '@/contexts/WalletContext'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bitcoin Inscription App',
  description: 'Upload and inscribe files using UniSat wallet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.unisat.io/sdk/v4.4.4/unisat.js" />
      </head>
      <body>
        <WalletProvider>
          {children}
          <Toaster position="bottom-right" />
        </WalletProvider>
      </body>
    </html>
  )
}

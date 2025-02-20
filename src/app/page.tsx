import FileUpload from '@/components/FileUpload'
import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <WalletConnect />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bitcoin Inscription App</h1>
          <p className="text-gray-600">Upload your file and inscribe it on Bitcoin using UniSat wallet</p>
        </div>

        <FileUpload />
      </div>
    </main>
  )
}

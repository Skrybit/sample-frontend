'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useWallet } from '@/contexts/WalletContext';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isInscribing, setIsInscribing] = useState(false);
  const [inscriptionStatus, setInscriptionStatus] = useState<string>('');
  const { address, isConnected } = useWallet();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast.success('File uploaded successfully!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/png': ['.png'],
    },
  });

  const handleInscribe = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!file) {
      toast.error('Please upload a file first');
      return;
    }

    if (!address) {
      toast.error('No wallet address available');
      return;
    }

    setIsInscribing(true);
    setInscriptionStatus('Creating commit transaction...');

    try {
      // Step 1: Create commit transaction
      const commitResponse = await api.createCommit(file, address, 1.1);
      setInscriptionStatus('Waiting for commit transaction payment...');

      // Request payment from UniSat wallet
      const sendBtcResponse = await window.unisat.sendBitcoin(
        commitResponse.address,
        parseInt(commitResponse.requiredAmount)
      );

      setInscriptionStatus('Creating reveal transaction...');

      // Step 2: Create reveal transaction
      const revealResponse = await api.createReveal(
        file,
        commitResponse.inscriptionId,
        sendBtcResponse.txid,
        0, // vout is usually 0
        parseInt(commitResponse.requiredAmount)
      );

      // Step 3: Broadcast reveal transaction
      const broadcastResponse = await window.unisat.pushTx(revealResponse.revealTxHex);

      setInscriptionStatus('Inscription complete!');
      toast.success('File inscribed successfully!');

      // Start polling for inscription status
      const pollStatus = async () => {
        const status = await api.getInscriptionStatus(commitResponse.inscriptionId);
        if (status.status === 'completed') {
          setInscriptionStatus('Inscription confirmed!');
          return;
        }
        if (status.status === 'failed') {
          setInscriptionStatus('Inscription failed');
          return;
        }
        setTimeout(pollStatus, 5000);
      };

      pollStatus();

    } catch (error) {
      console.error('Error during inscription:', error);
      toast.error('Failed to inscribe: ' + (error as Error).message);
      setInscriptionStatus('Inscription failed');
    } finally {
      setIsInscribing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
          ${isInscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isInscribing} />
        {file ? (
          <div>
            <p className="text-sm text-gray-600">Selected file:</p>
            <p className="font-medium">{file.name}</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">Drag & drop a PNG file here, or click to select</p>
          </div>
        )}
      </div>

      {inscriptionStatus && (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{inscriptionStatus}</p>
        </div>
      )}

      <button
        onClick={handleInscribe}
        disabled={!file || !isConnected || isInscribing}
        className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
          ${file && isConnected && !isInscribing
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-400 cursor-not-allowed'
          }`}
      >
        {isInscribing ? 'Inscribing...' : 'Inscribe'}
      </button>
    </div>
  );
}

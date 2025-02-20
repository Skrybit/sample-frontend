export interface CommitResponse {
  inscriptionId: number;
  fileSize: number;
  address: string;
  requiredAmount: string;
  tempPrivateKey: string;
}

export interface RevealResponse {
  revealTxHex: string;
  debug: {
    generatedAddress: string;
    pubkey: string;
    amount: number;
    fees: number;
  };
}

export interface InscriptionStatus {
  id: number;
  address: string;
  required_amount: number;
  status: string;
  commit_tx_id: string;
  created_at: string;
}

'use client';

import axios from 'axios';
import { CommitResponse, RevealResponse, InscriptionStatus } from '@/types/inscription';

const API_BASE_URL = 'http://localhost:3001';

export const api = {
  async createCommit(file: File, recipientAddress: string, feeRate: number): Promise<CommitResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipientAddress', recipientAddress);
    formData.append('feeRate', feeRate.toString());

    const response = await axios.post<CommitResponse>(`${API_BASE_URL}/create-commit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async createReveal(
    file: File,
    inscriptionId: number,
    commitTxId: string,
    vout: number,
    amount: number
  ): Promise<RevealResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('inscriptionId', inscriptionId.toString());
    formData.append('commitTxId', commitTxId);
    formData.append('vout', vout.toString());
    formData.append('amount', amount.toString());

    const response = await axios.post<RevealResponse>(`${API_BASE_URL}/create-reveal`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getInscriptionStatus(id: number): Promise<InscriptionStatus> {
    const response = await axios.get<InscriptionStatus>(`${API_BASE_URL}/inscription/${id}`);
    return response.data;
  },
};

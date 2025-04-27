import api from './api';
import { Address } from '../types/address';

export const addressService = {
  getAll: async (): Promise<Address[]> => {
    const response = await api.get('/api/addresses');
    return response.data;
  },

  create: async (address: Omit<Address, '_id'>): Promise<Address> => {
    const response = await api.post('/api/addresses', address);
    return response.data;
  },

  update: async (id: string, address: Partial<Address>): Promise<Address> => {
    const response = await api.put(`/api/addresses/${id}`, address);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/addresses/${id}`);
  },

  setDefault: async (id: string): Promise<Address> => {
    const response = await api.patch(`/api/addresses/${id}/default`);
    return response.data;
  }
}; 
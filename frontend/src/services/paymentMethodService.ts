import api from './api';
import { PaymentMethod } from '../types/paymentMethod';

export const paymentMethodService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/api/payment-methods');
    return response.data;
  },

  create: async (paymentMethod: Omit<PaymentMethod, '_id'>): Promise<PaymentMethod> => {
    const response = await api.post('/api/payment-methods', paymentMethod);
    return response.data;
  },

  update: async (id: string, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await api.put(`/api/payment-methods/${id}`, paymentMethod);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/payment-methods/${id}`);
  },

  setDefault: async (id: string): Promise<PaymentMethod> => {
    const response = await api.patch(`/api/payment-methods/${id}/default`);
    return response.data;
  }
}; 
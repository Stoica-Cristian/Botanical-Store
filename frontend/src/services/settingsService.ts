import api from './api';

export interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  estimatedDelivery: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  _id: string;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  storeName: string;
  currency: string;
  taxRate: number;
  shippingMethods: ShippingMethod[];
  paymentGateways: PaymentGateway[];
  createdAt: string;
  updatedAt: string;
}

export const settingsService = {
  // General Settings
  async getSettings(adminId: string): Promise<Settings> {
    const response = await api.get('/api/settings', {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  async updateSettings(settings: Partial<Settings>, adminId: string): Promise<Settings> {
    const response = await api.put('/api/settings', settings, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  // Shipping Methods
  async createShippingMethod(method: Omit<ShippingMethod, '_id' | 'createdAt' | 'updatedAt'>, adminId: string): Promise<ShippingMethod> {
    const response = await api.post('/api/settings/shipping', method, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  async updateShippingMethod(id: string, method: Partial<ShippingMethod>, adminId: string): Promise<ShippingMethod> {
    const response = await api.put(`/api/settings/shipping/${id}`, method, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  async deleteShippingMethod(id: string, adminId: string): Promise<void> {
    await api.delete(`/api/settings/shipping/${id}`, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
  },

  // Payment Gateways
  async createPaymentGateway(gateway: Omit<PaymentGateway, '_id' | 'createdAt' | 'updatedAt'>, adminId: string): Promise<PaymentGateway> {
    const response = await api.post('/api/settings/payment', gateway, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  async updatePaymentGateway(id: string, gateway: Partial<PaymentGateway>, adminId: string): Promise<PaymentGateway> {
    const response = await api.put(`/api/settings/payment/${id}`, gateway, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  async deletePaymentGateway(id: string, adminId: string): Promise<void> {
    await api.delete(`/api/settings/payment/${id}`, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
  }
}; 
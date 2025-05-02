import api from './api';

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  changes: {
    sales: number;
    orders: number;
    users: number;
    products: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
    products: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  salesData: {
    name: string;
    sales: number;
  }[];
  categoryData: {
    name: string;
    value: number;
  }[];
}

export const statsService = {
  getAdminStats: async (adminId: string) => {
    const response = await api.get<AdminStats>('/api/admin/stats', {
      headers: {
        'X-Admin-Id': adminId,
      },
    });
    return response.data;
  },
}; 
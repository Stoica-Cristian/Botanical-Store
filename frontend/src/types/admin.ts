// Dashboard statistics
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  // recentOrders: AdminOrder[];
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
  }>;
}

// Admin settings
export interface AdminSettings {
  storeName: string;
  currency: string;
  taxRate: number;
  shippingMethods: Array<{
    id: number;
    name: string;
    price: number;
    estimatedDelivery: string;
  }>;
  paymentGateways: Array<{
    id: number;
    name: string;
    enabled: boolean;
  }>;
} 
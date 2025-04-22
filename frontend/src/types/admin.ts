// Product with admin-specific fields
export interface AdminProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  stock: number;
  description: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// User for admin management
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  createdAt: string;
  lastLogin?: string;
  orders: number;
  status: "active" | "inactive";
}

// Order for admin viewing
export interface AdminOrder {
  id: number;
  orderNumber: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Dashboard statistics
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: AdminOrder[];
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
import api from './api';
import { Order, OrderResponse, OrderStatusUpdate } from '../types/order';

// FormOrder type for sending data from the form
export interface FormOrderItem {
  product: string;
  quantity: number;
}

export interface FormPaymentInfo {
  method: "Credit Card" | "Paypal" | "Bank Transfer";
  status: "pending" | "paid" | "failed" | "refunded";
  amount: number;
}

export interface FormOrderData {
  customer: { _id: string };
  items: { 
    product: { _id: string }, 
    quantity: number,
    price: number 
  }[];
  shippingAddress: { _id: string };
  payment: FormPaymentInfo;
  status?: Order["status"];
  totalAmount: number;
  shippingCost: number;
  tax: number;
}

export const orderService = {
  // Get orders for admin with pagination
  getAdminOrders: async (page: number = 1, limit: number = 10, adminId: string, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });

    const response = await api.get<OrderResponse>(`/api/orders/admin?${params}`, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get<Order[]>(`/api/orders`);
    return response.data;
  },

  getOrderById: async (orderId: string, adminId?: string) => {
    const config = adminId ? {
      headers: {
        "X-Admin-Id": adminId,
      },
    } : undefined;
    
    const response = await api.get<Order>(`/api/orders/${orderId}`, config);
    return response.data;
  },

  createOrder: async (orderData: FormOrderData, adminId?: string) => {
    const config = adminId ? {
      headers: {
        "X-Admin-Id": adminId,
      },
    } : undefined;
    
    const response = await api.post<Order>('/api/orders', orderData, config);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatusUpdate, adminId: string) => {
    const response = await api.patch<Order>(`/api/orders/${orderId}/status`, status, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  updateBulkOrderStatus: async (orderIds: string[], status: OrderStatusUpdate, adminId: string) => {
    const response = await api.patch<Order[]>('/api/orders/bulk-status', {
      orderIds,
      status
    }, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  },

  deleteOrder: async (orderId: string, adminId: string) => {
    const response = await api.delete(`/api/orders/${orderId}`, {
      headers: {
        "X-Admin-Id": adminId,
      }
    });
    return response.data;
  },

  updateOrder: async (orderId: string, orderData: Partial<Order>, adminId: string) => {
    const response = await api.put<Order>(`/api/orders/${orderId}`, orderData, {
      headers: {
        "X-Admin-Id": adminId,
      },
    });
    return response.data;
  }
};
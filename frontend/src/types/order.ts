import { Address } from './address';
import { Product } from './product';
import { User } from './user';

// Types for Payment Information
export interface PaymentInfo {
  method: 'Credit Card' | 'Paypal' | 'Bank Transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
}

// Types for Order Item
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

// Main Order Type
export interface Order {
  _id: string;
  customer: User;
  items: OrderItem[];
  shippingAddress: Address;
  shippingAddressDetails?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  payment: PaymentInfo;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingCost: number;
  tax: number;
  createdAt: string;
  updatedAt: string;
}

// Types for Order Status Update
export interface OrderStatusUpdate {
  status: Order['status'];
  notes?: string;
}

// Types for Order Pagination
export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Types for Order Response
export interface OrderResponse {
  orders: Order[];
  pagination: OrderPagination;
}

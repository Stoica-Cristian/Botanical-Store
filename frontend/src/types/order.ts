import { Address } from './address';
import { Product, PotStyle } from './product';
import { User } from './user';

// Types for Payment Information
export interface PaymentInfo {
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
}

// Types for Order Item
export interface OrderItem {
  product: Product;
  potStyle?: PotStyle;
  quantity: number;
  price: number;
}

// Main Order Type
export interface Order {
  _id: string;
  customer: User;
  items: OrderItem[];
  shippingAddress: Address;
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

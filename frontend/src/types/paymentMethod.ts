export interface PaymentMethod {
  _id: string;
  cardType: string;
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
} 
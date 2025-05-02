import { Product } from "./product";

export interface User {
  id: string;
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  avatar?: string;
  phoneNumber?: string;
  addresses?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  status?: "active" | "inactive";
  wishlist?: Product[];
}

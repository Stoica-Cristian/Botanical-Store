export interface Product {
  id: string;
  _id?: string; // Support for both id and _id formats
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  image?: string; // For backward compatibility
  oldPrice?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

// Rename to be consistent with other files
export interface ProductQueryParams {
  category?: string;
  search?: string;
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalProducts?: number;
  page: number;
  pages: number;
  totalPages?: number;
} 
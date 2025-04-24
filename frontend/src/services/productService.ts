import api from './api';
import { Product } from '../types/product';

// Types for frontend-backend communication
interface ProductResponse extends Product {}

interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  scientificName: string;
  category: string;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  features?: Array<{
    description: string;
    icon?: string;
  }>;
  careInfo: {
    lightRequirement: string;
    wateringFrequency: string;
    temperature: string;
    humidity: string;
    fertilizing: string;
    difficulty: string;
  };
  sizes?: Array<{
    label: string;
    value: string;
    inStock: boolean;
  }>;
  potStyles?: Array<{
    name: string;
    value: string;
    image: string;
  }>;
}

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<ProductResponse[]> => {
    const response = await api.get('/api/products');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<ProductResponse[]> => {
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },

  // Create a new product (admin only)
  createProduct: async (productData: ProductCreateRequest): Promise<ProductResponse> => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  // Update a product (admin only)
  updateProduct: async (id: string, productData: Partial<ProductCreateRequest>): Promise<ProductResponse> => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete a product (admin only)
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    try {
      console.log("ProductService: Starting delete operation for product ID:", id);
      
      // Ensure the ID is valid
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid product ID');
      }
      
      // Log the full URL being called
      const url = `/api/products/${id}`;
      console.log("ProductService: Calling DELETE endpoint:", url);
      
      // Make the delete request
      const response = await api.delete(url);
      
      console.log("ProductService: Delete response status:", response.status);
      console.log("ProductService: Delete response data:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("ProductService: Error deleting product:", error);
      console.error("ProductService: Error details:", {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response object'
      });
      throw error; // Re-throw for component to handle
    }
  },

  // Add a review to a product
  addReview: async (productId: string, reviewData: { author: string, rating: number, comment: string }): Promise<ProductResponse> => {
    const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  },
  
  // Create an empty product with default values
  createEmptyProduct: (defaultCategory: string): Product => {
    return {
      id: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      scientificName: "",
      category: defaultCategory,
      rating: 0,
      reviewsCount: 0,
      images: [],
      specifications: [],
      features: [],
      reviews: [],
      careInfo: {
        lightRequirement: "",
        wateringFrequency: "",
        temperature: "",
        humidity: "",
        fertilizing: "",
        difficulty: "medium",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

export default productService; 
import api from './api';
import { Product } from '../types/product';

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/api/products');
    return response.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/api/products/category/${category}`);
    return response.data;
  },

  // Admin functions
  createProduct: async (productData: Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'reviews' | 'createdAt' | 'updatedAt'>, adminId: string = ""): Promise<Product> => {
    try {
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.post('/api/products', productData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>, adminId: string = ""): Promise<Product> => {
    try {
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.put(`/api/products/${id}`, productData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id: string, adminId: string = ""): Promise<{ message: string }> => {
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid product ID');
      }
      
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const url = `/api/products/${id}`;
      const response = await api.delete(url, config);
      
      return response.data;
    } catch (error: any) {
      throw error; 
    }
  },

  addReview: async (productId: string, reviewData: { author: string, rating: number, comment: string }): Promise<Product> => {
    const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  },
  
  createEmptyProduct: (defaultCategory: string): Product => {
    return {
      _id: "",
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
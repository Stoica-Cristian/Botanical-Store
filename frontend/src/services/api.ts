import axios from 'axios';

// Obținem URL-ul backend-ului din variabilele de mediu
const API_URL = "http://localhost:5555";

// Interfață pentru datele de înregistrare
export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Crearea instanței axios cu configurația de bază
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor pentru adăugarea token-ului la fiecare cerere
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Funcții pentru autentificare
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (data: SignupData) => {
    const response = await api.post('/api/auth/signup', data);
    return response.data;
  },
};

// Funcții pentru utilizatori
export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  },
};

// Product functions
export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/api/products/featured');
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  getProductBySlug: async (slug: string) => {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data;
  },

  // Admin functions
  seedDatabase: async () => {
    const response = await api.post('/api/products/seed');
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  addReview: async (productId: string, reviewData: { rating: number, comment: string }) => {
    const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  }
};

export default api; 
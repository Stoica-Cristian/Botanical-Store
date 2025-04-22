import axios from 'axios';
import { Product, ProductQueryParams, ProductsResponse } from '../types/product';
import { API_BASE_URL } from '../config/constants';

const API_URL = `${API_BASE_URL}/products`;

export const getProducts = async (params?: ProductQueryParams): Promise<ProductsResponse> => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/search`, { 
      params: { query: searchTerm } 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

export const getProductReviews = async (productId: string) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

export const addProductReview = async (productId: string, reviewData: { rating: number, comment: string }) => {
  try {
    const response = await axios.post(
      `${API_URL}/${productId}/reviews`, 
      reviewData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw error;
  }
}; 
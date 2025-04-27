import api from './api';
import { Review } from '../types/product';

interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface UpdateReviewData {
  reviewId: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const reviewService = {
  // Create a new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    try {
      const response = await api.post('/api/reviews', {
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
        user: {
          _id: data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get all reviews for a product
  getProductReviews: async (productId: string): Promise<Review[]> => {
    try {
      const response = await api.get(`/api/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/api/reviews/${reviewId}`, {
        data: {
          user: {
            _id: userId
          }
        }
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  updateReview: async (data: UpdateReviewData): Promise<Review> => {
    try {
      const response = await api.put(`/api/reviews/${data.reviewId}`, {
        rating: data.rating,
        comment: data.comment,
        user: {
          _id: data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
};

export default reviewService; 
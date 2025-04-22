import axios from "axios";
import { API_BASE_URL } from "../../config/constants";

interface ProductData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  categoryId?: string;
  brandId?: string;
  tags?: string[];
  featured?: boolean;
}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}

const productService = {
  getAllProducts: async (params?: ProductQueryParams) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: ProductData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: Partial<ProductData>) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${id}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  },

  seedDatabase: async () => {
    try {
      // Sample product data
      const sampleProducts = [
        {
          name: "Monstera Deliciosa",
          description: "The Swiss Cheese Plant with iconic split leaves. Easy to care for and perfect for beginners.",
          price: 49.99,
          oldPrice: 59.99,
          stock: 25,
          images: [
            "https://images.unsplash.com/photo-1637967886160-fd78dc3ce3ed?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1632207820273-c904ce789ae5?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "low maintenance", "air purifying"]
        },
        {
          name: "Fiddle Leaf Fig",
          description: "Trendy indoor plant with large, violin-shaped leaves. Makes a statement in any room.",
          price: 59.99,
          oldPrice: 69.99,
          stock: 15,
          images: [
            "https://images.unsplash.com/photo-1613055437999-52c171fc8f4c?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600014767786-8b6e96ccf9bf?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "statement plant"]
        },
        {
          name: "Snake Plant",
          description: "Nearly indestructible plant that thrives on neglect. Perfect air purifier for bedrooms.",
          price: 29.99,
          oldPrice: 34.99,
          stock: 40,
          images: [
            "https://images.unsplash.com/photo-1599751449628-8e4b5938bbd0?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620127252536-03865ee4e9b4?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "low light", "air purifying", "beginner friendly"]
        },
        {
          name: "Pothos",
          description: "Trailing vine with heart-shaped leaves. Excellent for hanging baskets or shelves.",
          price: 19.99,
          oldPrice: 24.99,
          stock: 50,
          images: [
            "https://images.unsplash.com/photo-1611211422340-88673e1c9be7?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1632284963277-e03f9ec9b389?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "hanging", "low light", "air purifying"]
        },
        {
          name: "Peace Lily",
          description: "Elegant flowering plant with glossy leaves and white blooms. Great air purifier.",
          price: 39.99,
          oldPrice: 45.99,
          stock: 20,
          images: [
            "https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "flowering", "air purifying", "low light"]
        },
        {
          name: "ZZ Plant",
          description: "Glossy, dark green leaves that require minimal care. Thrives in low light conditions.",
          price: 34.99,
          oldPrice: 39.99,
          stock: 30,
          images: [
            "https://images.unsplash.com/photo-1637967886160-fd78dc3ce3ed?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "low light", "drought tolerant", "beginner friendly"]
        },
        {
          name: "Aloe Vera",
          description: "Medicinal succulent with thick, gel-filled leaves. Easy to care for and practical.",
          price: 24.99,
          oldPrice: 29.99,
          stock: 35,
          images: [
            "https://images.unsplash.com/photo-1596547609652-9cf5d8e0faed?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "succulent", "medicinal", "sun loving"]
        },
        {
          name: "Rubber Plant",
          description: "Bold plant with glossy, burgundy-green leaves. Makes a dramatic statement.",
          price: 44.99,
          oldPrice: 49.99,
          stock: 20,
          images: [
            "https://images.unsplash.com/photo-1594589306355-08fdf6d0c6ec?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614582832516-59aa151dbcae?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "statement plant", "air purifying"]
        },
        {
          name: "Boston Fern",
          description: "Classic fern with feathery fronds. Adds a touch of woodland charm to any space.",
          price: 29.99,
          oldPrice: 34.99,
          stock: 25,
          images: [
            "https://images.unsplash.com/photo-1614589148798-458d5d07f896?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1629696264814-40ab520c88b2?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "humidity loving", "air purifying"]
        },
        {
          name: "Chinese Money Plant",
          description: "Quirky plant with round, coin-shaped leaves. Easy to propagate and share.",
          price: 19.99,
          oldPrice: 24.99,
          stock: 15,
          images: [
            "https://images.unsplash.com/photo-1632752867074-26e932b6beae?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1609142621730-db3293839541?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "small", "easy care"]
        },
        {
          name: "Bird of Paradise",
          description: "Tropical plant with large, banana-like leaves. Brings exotic flair to indoor spaces.",
          price: 79.99,
          oldPrice: 89.99,
          stock: 10,
          images: [
            "https://images.unsplash.com/photo-1599685316908-83d79108dbf7?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1587805420324-a0cd195ac487?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: true,
          tags: ["indoor", "statement plant", "tropical"]
        },
        {
          name: "Calathea Medallion",
          description: "Striking foliage plant with patterned leaves that move throughout the day.",
          price: 49.99,
          oldPrice: 59.99,
          stock: 15,
          images: [
            "https://images.unsplash.com/photo-1616173758552-1ef2848ab407?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1647484726924-4eed34879623?q=80&w=1000&auto=format&fit=crop"
          ],
          featured: false,
          tags: ["indoor", "pet friendly", "humidity loving"]
        }
      ];

      const response = await axios.post(`${API_BASE_URL}/products/seed`, { products: sampleProducts });
      return response.data;
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  }
};

export { productService }; 
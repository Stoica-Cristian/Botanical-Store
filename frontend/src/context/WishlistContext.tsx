import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "../types/product";
import { useAuth } from "./AuthContext";
import api from "../services/api";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/wishlist");

      // Validate response data
      if (!Array.isArray(response.data)) {
        console.error("Invalid wishlist data format:", response.data);
        setWishlist([]);
        setError("Invalid wishlist data format");
        return;
      }

      // Transform and validate each product
      const validProducts = response.data.filter((item): item is Product => {
        if (!item || typeof item !== "object") return false;
        if (!item._id || !item.name || typeof item.price !== "number")
          return false;
        return true;
      });

      setWishlist(validProducts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch wishlist");
      console.error("Error fetching wishlist:", err);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    try {
      await api.post(`/api/wishlist/${product._id}`);
      setWishlist((prev) => [...prev, product]);
      setError(null);
    } catch (err) {
      setError("Failed to add product to wishlist");
      console.error("Error adding to wishlist:", err);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      setWishlist((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      setError(null);
    } catch (err) {
      setError("Failed to remove product from wishlist");
      console.error("Error removing from wishlist:", err);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((product) => product._id === productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isLoading,
    error,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;

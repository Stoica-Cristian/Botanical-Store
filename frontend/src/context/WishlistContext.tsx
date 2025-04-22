import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type WishlistItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  alt: string;
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
});

export const useWishlist = () => useContext(WishlistContext);

type WishlistProviderProps = {
  children: ReactNode;
};

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error);
        localStorage.removeItem("wishlist");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prevItems) => {
      if (prevItems.some((existingItem) => existingItem.id === item.id)) {
        return prevItems;
      }
      return [...prevItems, item];
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const isInWishlist = (id: number) => {
    return wishlistItems.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;

import {
  HeartIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/store/ProductCard";
import { Product } from "../../types/product";
import { useState } from "react";
import ToastContainer, { ToastData } from "../../components/ui/ToastContainer";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const Wishlist = () => {
  const { isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { wishlist, removeFromWishlist, isLoading } = useWishlist();

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        const deletedItem = wishlist.find((item) => item._id === id);
        removeFromWishlist(id);
        setDeleteConfirm(null);

        if (deletedItem) {
          showToast(
            "success",
            `${deletedItem.name} has been removed from your wishlist`
          );
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        showToast("error", "Failed to remove item from wishlist");
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const wishlistProducts: Product[] = Array.isArray(wishlist)
    ? wishlist.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        images: item.images,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        reviews: item.reviews,
        category: item.category,
        description: item.description,
        stock: item.stock,
        scientificName: item.scientificName,
        specifications: item.specifications,
        features: item.features,
        careInfo: item.careInfo,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    : [];

  // Filter and sort items
  const filteredItems = wishlistProducts
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      }
      if (sortBy === "rating") {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      }
      return 0;
    });

  // Redirect if user is not authenticated and auth loading is complete
  if (!loading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <HeartIcon className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                </select>
                <button
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  <FunnelIcon
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-500">
                Items you add to your wishlist will appear here
              </p>
              <Link
                to="/store"
                className="mt-6 inline-block px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((product) => (
                <div key={product._id} className="relative group">
                  <ProductCard product={product} />
                  <div className="absolute top-4 right-4">
                    <button
                      className={`p-2 rounded-full shadow-md transition-colors ${
                        deleteConfirm === product._id
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-white hover:bg-red-50"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(product._id);
                      }}
                    >
                      <TrashIcon
                        className={`h-5 w-5 ${
                          deleteConfirm === product._id
                            ? "text-white"
                            : "text-red-500"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;

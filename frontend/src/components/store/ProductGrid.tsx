import { useState, useRef, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  StarIcon,
  TagIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Product } from "../../types/product";
import ProductCard from "./ProductCard";
// import { productService } from "../../services/api";

interface ProductGridProps {
  getFilteredProducts: (products: Product[]) => Product[];
}

const ProductGrid = ({ getFilteredProducts }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const [sortOption, setSortOption] = useState("featured");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // const products = await productService.getAllProducts();

        // Map backend data to frontend Product type
        // const mappedProducts = products.map((product: any) => ({
        //   id: product._id,
        //   _id: product._id,
        //   name: product.name,
        //   description: product.description || "No description available",
        //   price: product.price,
        //   oldPrice: product.oldPrice,
        //   image:
        //     product.images && product.images.length > 0
        //       ? product.images.find((img: any) => img.isPrimary)?.url ||
        //         product.images[0].url
        //       : "https://placehold.co/300x300",
        //   rating: product.rating || 0,
        //   reviewCount: product.reviewsCount || 0,
        //   category:
        //     product.categories && product.categories.length > 0
        //       ? product.categories[0].name
        //       : "Uncategorized",
        //   stock: product.stock || 0,
        // }));

        // setAllProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    window.scrollTo({
      top: gridRef.current?.offsetTop ? gridRef.current.offsetTop - 20 : 0,
      behavior: "smooth",
    });
  }, [currentPage]);

  // Sort products
  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case "price":
          comparison = a.price - b.price;
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          return 0;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  // Get filtered and sorted products
  const filteredProducts = getFilteredProducts(allProducts);
  const sortedProducts = sortProducts(filteredProducts);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const sortOptions = [
    { value: "featured", label: "Featured", icon: FunnelIcon },
    { value: "price", label: "Price", icon: CurrencyDollarIcon },
    { value: "rating", label: "Rating", icon: StarIcon },
    { value: "name", label: "Name", icon: TagIcon },
  ];

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <p className="text-sm text-gray-500 mt-1">Loading products...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        ref={gridRef}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {sortedProducts.length} products found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Sort buttons */}
          {sortOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                if (sortOption === value) {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                } else {
                  setSortOption(value);
                  setSortDirection("asc");
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                sortOption === value
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">{label}</span>
              {sortOption === value && (
                <>
                  {sortDirection === "asc" ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  )}
                </>
              )}
            </button>
          ))}

          {/* Products per page */}
          <select
            value={productsPerPage}
            onChange={(e) => setProductsPerPage(Number(e.target.value))}
            className="bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 appearance-none cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="36">36</option>
          </select>
          <span className="text-xs sm:text-sm text-gray-500">per page</span>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 px-4 sm:px-2 md:px-0">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            No products found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedProducts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUpIcon className="h-5 w-5 -rotate-90" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-accent text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUpIcon className="h-5 w-5 rotate-90" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

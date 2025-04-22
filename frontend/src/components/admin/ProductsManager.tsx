import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { AdminProduct } from "../../types/admin";
import Loader from "../ui/Loader";
import { ToastType } from "../ui/Toast";
import ToastContainer, { ToastData } from "../ui/ToastContainer";

const mockProducts: AdminProduct[] = [
  {
    id: 1,
    name: "Snake Plant",
    price: 29.99,
    oldPrice: 39.99,
    image: "https://placehold.co/50x50",
    rating: 4.5,
    reviewCount: 12,
    category: "Indoor Plants",
    stock: 15,
    description:
      "Easy-care snake plant purifies air and thrives in low light conditions.",
    featured: true,
    createdAt: "2023-09-10T08:30:00Z",
    updatedAt: "2023-10-15T14:20:00Z",
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    price: 59.99,
    oldPrice: 69.99,
    image: "https://placehold.co/50x50",
    rating: 4.8,
    reviewCount: 24,
    category: "Indoor Plants",
    stock: 8,
    description: "Dramatic foliage plant with large, violin-shaped leaves.",
    featured: true,
    createdAt: "2023-08-15T10:15:00Z",
    updatedAt: "2023-10-12T09:30:00Z",
  },
  {
    id: 3,
    name: "Monstera Deliciosa",
    price: 49.99,
    oldPrice: undefined,
    image: "https://placehold.co/50x50",
    rating: 4.7,
    reviewCount: 18,
    category: "Indoor Plants",
    stock: 12,
    description:
      "Tropical plant with dramatic split leaves and a climbing growth habit.",
    featured: true,
    createdAt: "2023-09-05T12:45:00Z",
    updatedAt: "2023-10-10T11:20:00Z",
  },
  {
    id: 4,
    name: "Potting Soil Mix",
    price: 19.99,
    oldPrice: 24.99,
    image: "https://placehold.co/50x50",
    rating: 4.3,
    reviewCount: 35,
    category: "Accessories",
    stock: 50,
    description:
      "Premium potting soil mix for indoor plants with added perlite and coconut coir.",
    featured: false,
    createdAt: "2023-07-20T09:30:00Z",
    updatedAt: "2023-10-01T15:10:00Z",
  },
  {
    id: 5,
    name: "Ceramic Plant Pot - White",
    price: 24.99,
    oldPrice: undefined,
    image: "https://placehold.co/50x50",
    rating: 4.6,
    reviewCount: 42,
    category: "Pots",
    stock: 25,
    description: "Minimalist ceramic pot with drainage hole and saucer.",
    featured: false,
    createdAt: "2023-08-25T14:20:00Z",
    updatedAt: "2023-09-28T10:45:00Z",
  },
  {
    id: 6,
    name: "New Plant",
    price: 39.99,
    oldPrice: undefined,
    image: "https://placehold.co/50x50",
    rating: 0,
    reviewCount: 0,
    category: "Indoor Plants",
    stock: 20,
    description: "Placeholder description for the new plant.",
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const ProductsManager = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(
    null
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Sorting
  const [sortField, setSortField] = useState<keyof AdminProduct>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Toast notifications
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Categories derived from products
  const categories = [
    "All",
    ...new Set(mockProducts.map((product) => product.category)),
  ];

  // Add toast notification
  const addToast = (type: ToastType, message: string) => {
    const newToast = {
      id: Date.now(),
      type,
      message,
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Implement search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using mock data for now
        setTimeout(() => {
          setProducts(mockProducts);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching products data:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle sorting
  const handleSort = (field: keyof AdminProduct) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new field, set it as the sort field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply sorting to filtered products
  const sortProducts = (products: AdminProduct[]) => {
    return [...products].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle different types of values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numbers, dates, etc.
      if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory =
      currentCategory === "All" || product.category === currentCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort filtered products
  const sortedProducts = sortProducts(filteredProducts);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      try {
        // Update UI by filtering out the deleted product
        setProducts(
          products.filter((product) => product.id !== productToDelete)
        );
        setShowDeleteModal(false);
        setProductToDelete(null);
        addToast("success", "Product deleted successfully");
      } catch (error) {
        addToast("error", "Failed to delete product");
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setCurrentProduct(product);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = (product: AdminProduct) => {
    try {
      if (product.id) {
        setProducts(products.map((p) => (p.id === product.id ? product : p)));
        addToast("success", "Product updated successfully");
      } else {
        const newProduct = {
          ...product,
          id: Math.max(...products.map((p) => p.id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts([...products, newProduct]);
        addToast("success", "Product added successfully");
      }
      setShowProductModal(false);
    } catch (error) {
      addToast(
        "error",
        product.id ? "Failed to update product" : "Failed to add product"
      );
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Render sort indicator for table headers
  const renderSortIndicator = (field: keyof AdminProduct) => {
    if (sortField !== field) {
      return <ChevronUpIcon className="h-4 w-4 text-gray-400 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 text-accent" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-accent" />
    );
  };

  if (loading) {
    return <Loader size="lg" text="Loading products..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-800 font-medium text-lg">{error}</p>
        <button
          className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-medium text-gray-900">Products Manager</h2>
        <button
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
          onClick={handleAddProduct}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={clearSearch}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div>
          <select
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-accent focus:border-accent"
            value={currentCategory}
            onChange={(e) => {
              setCurrentCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden bg-white p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    {renderSortIndicator("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {renderSortIndicator("category")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    {renderSortIndicator("price")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("stock")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock</span>
                    {renderSortIndicator("stock")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                      {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          ${product.oldPrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        product.stock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                      {product.featured && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-accent hover:text-accent/80 transition-colors"
                          onClick={() => handleEditProduct(product)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors"
                          onClick={() => handleDelete(product.id)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-gray-200 px-4 py-5 sm:px-6 mt-4 gap-4">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstProduct + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastProduct, filteredProducts.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredProducts.length}</span>{" "}
                products
              </p>
            </div>

            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() =>
                  setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
                }
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                  currentPage === 1
                    ? "bg-gray-100 cursor-not-allowed"
                    : "hover:bg-accent/10 hover:text-accent"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              {totalPages <= 7 ? (
                // If we have 7 pages or fewer, show all page numbers
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        page === currentPage
                          ? "z-10 bg-accent text-white focus-visible:outline-accent"
                          : "text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-accent/10 hover:text-accent"
                      }`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )
                )
              ) : (
                // If we have more than 7 pages, show a truncated version
                <>
                  {/* First page always shown */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      1 === currentPage
                        ? "z-10 bg-accent text-white focus-visible:outline-accent"
                        : "text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-accent/10 hover:text-accent"
                    }`}
                    aria-current={1 === currentPage ? "page" : undefined}
                  >
                    1
                  </button>

                  {/* Show ellipsis if current page is past 3 */}
                  {currentPage > 3 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page !== 1 &&
                        page !== totalPages &&
                        (Math.abs(page - currentPage) < 2 ||
                          (currentPage <= 3 && page <= 5) ||
                          (currentPage >= totalPages - 2 &&
                            page >= totalPages - 4))
                    )
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          page === currentPage
                            ? "z-10 bg-accent text-white focus-visible:outline-accent"
                            : "text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-accent/10 hover:text-accent"
                        }`}
                        aria-current={page === currentPage ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Show ellipsis if current page is before totalPages - 2 */}
                  {currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                      ...
                    </span>
                  )}

                  {/* Last page always shown */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      totalPages === currentPage
                        ? "z-10 bg-accent text-white focus-visible:outline-accent"
                        : "text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-accent/10 hover:text-accent"
                    }`}
                    aria-current={
                      totalPages === currentPage ? "page" : undefined
                    }
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  setCurrentPage(
                    currentPage < totalPages ? currentPage + 1 : totalPages
                  )
                }
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${
                  currentPage === totalPages
                    ? "bg-gray-100 cursor-not-allowed"
                    : "hover:bg-accent/10 hover:text-accent"
                }`}
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonType="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <ProductFormModal
          product={currentProduct}
          categories={categories.filter((c) => c !== "All")}
          onSave={handleSaveProduct}
          onCancel={() => setShowProductModal(false)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmButtonText: string;
  confirmButtonType: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmButtonText,
  confirmButtonType,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`${
              confirmButtonType === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-accent hover:bg-accent/90"
            } text-white px-4 py-2 rounded-lg transition-colors`}
            onClick={onConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProductFormModalProps {
  product: AdminProduct | null;
  categories: string[];
  onSave: (product: AdminProduct) => void;
  onCancel: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<AdminProduct>>(
    product || {
      name: "",
      price: 0,
      oldPrice: undefined,
      image: "",
      rating: 0,
      reviewCount: 0,
      category: categories[0],
      stock: 0,
      description: "",
      featured: false,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" ? "" : parseFloat(value),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as AdminProduct);
  };

  // Generate placeholder image URL for preview
  const getPlaceholderImage = (name: string) => {
    if (!name) return "";
    const color = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
    return `https://via.placeholder.com/150/${color}/ffffff?text=${encodeURIComponent(
      name
    )}`;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white p-0 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="bg-accent text-white px-8 py-5 flex justify-between items-center">
          <h3 className="text-xl font-medium">
            {product ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            className="text-white hover:text-gray-200 transition-colors"
            onClick={onCancel}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                required
                min="0"
                step="0.01"
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Old Price ($){" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                name="oldPrice"
                value={formData.oldPrice === undefined ? "" : formData.oldPrice}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
                required
                min="0"
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleNumberChange}
                required
                min="0"
                max="5"
                step="0.1"
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Review Count
              </label>
              <input
                type="number"
                name="reviewCount"
                value={formData.reviewCount}
                onChange={handleNumberChange}
                required
                min="0"
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2 flex items-center py-2">
              <label className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg w-full">
                <input
                  type="checkbox"
                  name="featured"
                  checked={!!formData.featured}
                  onChange={handleChange}
                  className="h-5 w-5 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Featured Product
                  </span>
                  <p className="text-xs text-gray-500">
                    Featured products appear prominently on the homepage
                  </p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Product Preview
            </h4>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = getPlaceholderImage(formData.name as string);
                    }}
                  />
                ) : formData.name ? (
                  <img
                    src={getPlaceholderImage(formData.name as string)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {formData.name || "Product Name"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formData.category || "Category"}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-accent font-medium">
                    ${formData.price?.toFixed(2) || "0.00"}
                  </span>
                  {formData.oldPrice && (
                    <span className="ml-2 text-gray-500 line-through text-sm">
                      ${formData.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg transition-colors"
            >
              {product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductsManager;

import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Product } from "../../types/product";
import Loader from "../ui/Loader";
import { ToastType } from "../ui/Toast";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import { productService } from "../../services/productService";

const getPrimaryImage = (product: Product): string => {
  if (!product.images || product.images.length === 0) {
    return "https://placehold.co/50x50?text=No+Image";
  }

  const primaryImage = product.images.find((img) => img.isPrimary);

  return primaryImage ? primaryImage.url : product.images[0].url;
};

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All");
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  // Add a ref to track if we've already fetched products
  const fetchedRef = useRef(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Toast notifications
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Categories derived from products
  const [categories, setCategories] = useState<string[]>(["All"]);

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
      if (fetchedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const productsResponse = await productService.getAllProducts();
        setProducts(productsResponse);

        // Extract unique categories
        const uniqueCategories = [
          "All",
          ...new Set(productsResponse.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);

        fetchedRef.current = true;
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products data:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle sorting
  const handleSortChange = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply sorting to filtered products
  const sortProducts = (products: Product[]) => {
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

  // Sort filtered products - use all products directly
  const sortedProducts = sortProducts(filteredProducts);

  // Pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!id || id.trim() === "") {
      addToast("error", "Cannot delete product - invalid ID");
      return;
    }

    try {
      console.log("Starting direct delete for product ID:", id);
      setDeletingProductId(id);

      // Call API to delete the product
      const response = await productService.deleteProduct(id);
      console.log("Delete API response:", response);

      // Update UI
      setProducts(products.filter((p) => p.id !== id));
      addToast("success", "Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("error", "Failed to delete product. Please try again.");
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditProduct = (product: Product) => {
    // Make a deep copy of the product to avoid reference issues
    const productCopy = JSON.parse(JSON.stringify(product));
    setCurrentProduct(productCopy);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    const defaultCategory = categories.length > 1 ? categories[1] : "Plants";
    setCurrentProduct(productService.createEmptyProduct(defaultCategory));
    setShowProductModal(true);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      // Validate product data before submitting
      if (
        !product.name ||
        !product.description ||
        !product.category ||
        product.price < 0
      ) {
        addToast("error", "Please fill in all required fields correctly");
        return;
      }

      setLoading(true);

      // Make sure we send the expected format to the API
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        scientificName: product.scientificName,
        category: product.category,
        images: product.images || [],
        specifications: product.specifications || [],
        features: product.features || [],
        careInfo: product.careInfo,
      };

      if (product.id && product.id.trim() !== "") {
        // Update existing product
        const updatedProduct = await productService.updateProduct(
          product.id,
          productData
        );

        if (updatedProduct) {
          // Update the product in the local state
          setProducts(
            products.map((p) => (p.id === product.id ? updatedProduct : p))
          );
          addToast("success", "Product updated successfully");
          setShowProductModal(false);
        } else {
          throw new Error("Failed to update product");
        }
      } else {
        // Create new product
        const newProduct = await productService.createProduct(productData);

        if (newProduct) {
          // Add the new product to the local state
          setProducts([...products, newProduct]);
          addToast("success", "Product added successfully");
          setShowProductModal(false);
        } else {
          throw new Error("Failed to create product");
        }
      }
    } catch (error: any) {
      addToast(
        "error",
        error.message ||
          (product.id ? "Failed to update product" : "Failed to add product")
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Render sort indicator for table headers
  const renderSortIndicator = (field: keyof Product) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1 transform rotate-180" />
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-3">
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
                onClick={() => setSearchTerm("")}
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
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
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
                  onClick={() => handleSortChange("name")}
                >
                  <div className="flex items-center">
                    <span>Product</span>
                    {renderSortIndicator("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("category")}
                >
                  <div className="flex items-center">
                    <span>Category</span>
                    {renderSortIndicator("category")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("price")}
                >
                  <div className="flex items-center">
                    <span>Price</span>
                    {renderSortIndicator("price")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("stock")}
                >
                  <div className="flex items-center">
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
                currentProducts.map((product, index) => (
                  <tr
                    key={product.id || `product-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getPrimaryImage(product)}
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
                          className={`transition-colors ${
                            deletingProductId === product.id
                              ? "text-gray-400 animate-pulse"
                              : "text-red-600 hover:text-red-800"
                          }`}
                          onClick={() => handleDelete(product.id)}
                          disabled={
                            !product.id || deletingProductId === product.id
                          }
                          title={
                            product.id
                              ? deletingProductId === product.id
                                ? "Deleting..."
                                : "Delete product"
                              : "Cannot delete - no ID"
                          }
                        >
                          {deletingProductId === product.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
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
        {currentProducts.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">
                Showing {indexOfFirstProduct + 1} to{" "}
                {Math.min(indexOfLastProduct, sortedProducts.length)} of{" "}
                {sortedProducts.length} products
              </span>
              <select
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-accent focus:border-accent"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                {[5, 10, 25, 50].map((value) => (
                  <option key={value} value={value}>
                    {value} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-accent text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Edit Modal */}
      {showProductModal && currentProduct && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentProduct.id ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowProductModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
              <ProductForm
                product={currentProduct}
                categories={categories.filter((c) => c !== "All")}
                onSave={handleSaveProduct}
                onCancel={() => setShowProductModal(false)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

interface ProductFormProps {
  product: Product;
  categories: string[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSave,
  onCancel,
  loading,
}) => {
  // Initialize with the product passed as prop
  const [formData, setFormData] = useState<Product>(product);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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
      [name]: value === "" ? 0 : parseFloat(value),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;

    // Add new image to the array
    setFormData({
      ...formData,
      images: [
        ...(formData.images || []),
        {
          url: imageUrl,
          alt: `${formData.name || "Product"} image`,
          isPrimary: formData.images.length === 0, // Only set as primary if it's the first image
        },
      ],
    });

    // Clear the input field
    setImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    const isRemovingPrimary = updatedImages[index].isPrimary;

    // Remove the image
    updatedImages.splice(index, 1);

    // If we're removing the primary image, set the first remaining image as primary (if any)
    if (isRemovingPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    const updatedImages = [...formData.images];

    // Reset all images to non-primary
    updatedImages.forEach((img) => (img.isPrimary = false));

    // Set the selected image as primary
    updatedImages[index].isPrimary = true;

    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  const handleCareInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      careInfo: {
        ...formData.careInfo,
        [name]: value,
      },
    });
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

  // Add feature to the product
  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), { description: "" }],
    });
  };

  // Remove feature from the product
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Update feature
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], description: value };
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Add specification to the product
  const handleAddSpecification = () => {
    setFormData({
      ...formData,
      specifications: [
        ...(formData.specifications || []),
        { name: "", value: "" },
      ],
    });
  };

  // Remove specification from the product
  const handleRemoveSpecification = (index: number) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs.splice(index, 1);
    setFormData({
      ...formData,
      specifications: updatedSpecs,
    });
  };

  // Update specification
  const handleSpecificationChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setFormData({
      ...formData,
      specifications: updatedSpecs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            ) : (
              <option value="Plants">Plants</option>
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Scientific Name
          </label>
          <input
            type="text"
            name="scientificName"
            value={formData.scientificName}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
            placeholder="Enter scientific name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Price ($)
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

        {/* Images Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-gray-800">
              Product Images
            </h4>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={imageUrl}
              onChange={handleImageChange}
              className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
              placeholder="Enter image URL"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-accent hover:bg-accent/90 text-white px-3 py-3 rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          {formData.images && formData.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="flex p-3 border border-gray-200 rounded-lg"
                >
                  <div className="h-16 w-16 flex-shrink-0 mr-3">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-16 w-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getPlaceholderImage(formData.name);
                      }}
                    />
                  </div>
                  <div className="flex flex-col flex-grow overflow-hidden">
                    <div className="text-sm truncate">{image.url}</div>
                    <div className="flex items-center mt-auto space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        disabled={image.isPrimary}
                        className={`text-xs px-2 py-1 rounded ${
                          image.isPrimary
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        {image.isPrimary ? "Primary" : "Set as Primary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No images added</p>
          )}
        </div>

        {/* Plant Care Information */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            Plant Care Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Light Requirement
              </label>
              <select
                name="lightRequirement"
                value={formData.careInfo?.lightRequirement || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
              >
                <option value="">Select light requirement</option>
                <option value="low">Low Light</option>
                <option value="medium">Medium Light</option>
                <option value="bright">Bright Light</option>
                <option value="direct">Direct Sunlight</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Watering Frequency
              </label>
              <select
                name="wateringFrequency"
                value={formData.careInfo?.wateringFrequency || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
              >
                <option value="">Select watering frequency</option>
                <option value="rarely">Rarely</option>
                <option value="once a week">Weekly</option>
                <option value="twice a week">Twice Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Temperature
              </label>
              <input
                type="text"
                name="temperature"
                value={formData.careInfo?.temperature || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="e.g. 18-24°C"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Humidity
              </label>
              <input
                type="text"
                name="humidity"
                value={formData.careInfo?.humidity || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="e.g. High"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fertilizing
              </label>
              <input
                type="text"
                name="fertilizing"
                value={formData.careInfo?.fertilizing || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                placeholder="e.g. Monthly during growing season"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.careInfo?.difficulty || ""}
                onChange={handleCareInfoChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-gray-800">Features</h4>
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Feature
            </button>
          </div>

          {formData.features && formData.features.length > 0 ? (
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No features added</p>
          )}
        </div>

        {/* Specifications Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-medium text-gray-800">
              Specifications
            </h4>
            <button
              type="button"
              onClick={handleAddSpecification}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Specification
            </button>
          </div>

          {formData.specifications && formData.specifications.length > 0 ? (
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={spec.name}
                    onChange={(e) =>
                      handleSpecificationChange(index, "name", e.target.value)
                    }
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                    placeholder="Specification name"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                    className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-accent focus:border-accent"
                    placeholder="Specification value"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              No specifications added
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-colors"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center"
          disabled={loading}
        >
          {loading && <span className="mr-2 animate-spin">⏳</span>}
          {product?.id ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductsManager;

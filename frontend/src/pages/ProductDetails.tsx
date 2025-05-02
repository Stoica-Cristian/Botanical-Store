import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  StarIcon,
  MinusIcon,
  PlusIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  SunIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastContainer, { ToastData } from "../components/ui/ToastContainer";
import { Tab } from "@headlessui/react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { Product, Pot, Review } from "../types/product";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import reviewService from "../services/reviewService";

const potStyles: Pot[] = [
  {
    _id: "1",
    name: "Terra Cotta",
    image:
      "https://media.istockphoto.com/id/1210620582/ro/fotografie/gradinarit-interior-potting-plante-de-apartament-suculente.jpg?s=612x612&w=0&k=20&c=OSyTYwSfIr8fXUo5L0a6kkU1tRDlnw6iyp4N-fM5hes=",
    quantity: 500,
  },
  {
    _id: "2",
    name: "Ceramic White",
    image:
      "https://images.unsplash.com/photo-1463320898484-cdee8141c787?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D",
    quantity: 500,
  },
  {
    _id: "3",
    name: "Ceramic Black",
    image:
      "https://images.unsplash.com/photo-1606661426858-4ccc05e25c71?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    quantity: 10,
  },
];

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPotStyle, setSelectedPotStyle] = useState<Pot | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!productId) {
          setError("Product ID is missing");
          return;
        }

        // Fetch product details
        const productData = await productService.getProductById(productId);

        // Fetch reviews for the product
        const reviews = await reviewService.getProductReviews(productId);

        // Update product with reviews
        setProduct({
          ...productData,
          reviews,
          reviewsCount: reviews.length,
          rating:
            reviews.length > 0
              ? Number(
                  (
                    reviews.reduce((acc, review) => acc + review.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                )
              : 0,
        });

        if (productData?.images?.length > 0) {
          const mainImage =
            productData.images.find((img) => img.isPrimary) ||
            productData.images[0];
          setSelectedImage(mainImage.url);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [productId]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const updateQuantity = (newQuantity: number) => {
    if (!product) return;

    if (newQuantity < 1) {
      showToast("error", "Quantity cannot be less than 1");
      return;
    }

    if (product && newQuantity > product.stock) {
      showToast("error", "Cannot exceed available stock");
      return;
    }

    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedPotStyle) {
      showToast("error", "Please select pot style");
      return;
    }

    if (!isAuthenticated) {
      showToast("error", "Please login to add items to your cart");
      return;
    }

    try {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0].url,
        alt: product.images[0].alt,
      });

      showToast("success", `${product.name} has been added to cart!`);
    } catch (error) {
      showToast("error", "Error adding to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    const productInWishlist = isInWishlist(product._id);

    if (!productInWishlist) {
      addToWishlist(product);
    } else {
      removeFromWishlist(product._id);
    }
  };

  const handleReviewFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewFormData({
      ...reviewFormData,
      [name]: value,
    });
  };

  const handleRatingChange = (newRating: number) => {
    setReviewFormData({
      ...reviewFormData,
      rating: newRating,
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !user || !user.id || !user.firstName || !user.lastName) {
      showToast("error", "User information is incomplete");
      return;
    }

    // Check if user already has a review
    const userReview = product.reviews.find(
      (review) => review.user._id === user.id
    );
    if (userReview) {
      showToast(
        "error",
        "You have already reviewed this product. You can only submit one review per product."
      );
      return;
    }

    try {
      await reviewService.createReview({
        productId: product._id,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      // Fetch updated product data
      const updatedProduct = await productService.getProductById(product._id);

      // Fetch updated reviews
      const updatedReviews = await reviewService.getProductReviews(product._id);

      // Update the product state
      setProduct({
        ...updatedProduct,
        reviews: updatedReviews,
        reviewsCount: updatedReviews.length,
        rating:
          updatedReviews.length > 0
            ? Number(
                (
                  updatedReviews.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / updatedReviews.length
                ).toFixed(1)
              )
            : 0,
      });

      showToast("success", "Review submitted successfully");
      setReviewFormData({
        rating: 5,
        comment: "",
      });
      setShowWriteReview(false);
    } catch (error: any) {
      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else {
        showToast("error", "Failed to submit review");
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!product || !user) return;

    try {
      await reviewService.deleteReview(reviewId, user.id);

      // Fetch updated reviews
      const updatedReviews = await reviewService.getProductReviews(product._id);

      // Update the product state
      setProduct((prevProduct) => {
        if (!prevProduct) return null;
        return {
          ...prevProduct,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating:
            updatedReviews.length > 0
              ? Number(
                  (
                    updatedReviews.reduce(
                      (acc, review) => acc + review.rating,
                      0
                    ) / updatedReviews.length
                  ).toFixed(1)
                )
              : 0,
        };
      });

      showToast("success", "Review deleted successfully");
    } catch (error: any) {
      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else {
        showToast("error", "Failed to delete review");
      }
    }
  };

  const totalPages = Math.ceil(
    (product?.reviews?.length || 0) / reviewsPerPage
  );
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews =
    product?.reviews?.slice(indexOfFirstReview, indexOfLastReview) || [];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenAllReviews = () => {
    setCurrentPage(1);
    setShowAllReviews(true);
  };

  const handleWriteReview = (show: boolean) => {
    setShowWriteReview(show);
  };

  const handleEditReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !product ||
      !user ||
      !user.id ||
      !user.firstName ||
      !user.lastName ||
      !editingReview
    ) {
      showToast("error", "Missing required information");
      return;
    }

    try {
      await reviewService.updateReview({
        reviewId: editingReview._id!,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      // Fetch updated reviews
      const updatedReviews = await reviewService.getProductReviews(product._id);

      // Update the product state
      setProduct((prevProduct) => {
        if (!prevProduct) return null;
        return {
          ...prevProduct,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
          rating:
            updatedReviews.length > 0
              ? Number(
                  (
                    updatedReviews.reduce(
                      (acc, review) => acc + review.rating,
                      0
                    ) / updatedReviews.length
                  ).toFixed(1)
                )
              : 0,
        };
      });

      showToast("success", "Review updated successfully");
      setReviewFormData({
        rating: 5,
        comment: "",
      });
      setEditingReview(null);
      setShowWriteReview(false);
    } catch (error: any) {
      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else {
        showToast("error", "Failed to update review");
      }
    }
  };

  const startEditingReview = (review: Review) => {
    setEditingReview(review);
    setReviewFormData({
      rating: review.rating,
      comment: review.comment,
    });
    setShowWriteReview(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="text-center">
            <ExclamationCircleIcon className="mx-auto h-20 w-20 text-red-500" />
            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Product Not Found
            </h2>
            <div className="mt-10">
              <Link
                to="/store"
                className="text-accent hover:text-accent-dark font-medium"
              >
                ← Back to Plant Store
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const oldPrice = product.price * 1.2;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 container mx-auto px-4 sm:px-20 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-0 bg-white rounded-2xl p-4 sm:p-8 shadow-sm">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="relative aspect-square max-w-xl bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 space-y-2">
                  {oldPrice && (
                    <span className="inline-block bg-accent text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                      Save{" "}
                      {Math.round(
                        ((oldPrice - product.price) / oldPrice) * 100
                      )}
                      %
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 flex justify-end">
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-2 rounded-lg transition-colors ${
                      isInWishlist(product?._id || "")
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white/90 hover:bg-white text-gray-700"
                    }`}
                  >
                    <HeartIcon
                      className={`h-5 w-5 ${
                        isInWishlist(product?._id || "") ? "fill-current" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Thumbnail Navigation - Scrollable on mobile */}
              <div className="flex gap-3 mt-2 overflow-x-auto pb-6 snap-x">
                {product.images
                  .sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0))
                  .map((image, index) => (
                    <div key={index} className="flex-shrink-0 p-2">
                      <button
                        onClick={() => setSelectedImage(image.url)}
                        className={`relative block w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 rounded-lg p-1 ${
                          selectedImage === image.url
                            ? "border-accent shadow-md"
                            : "border-gray-200 hover:border-accent/50"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Badges */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1">
                {product.name}
              </h1>
              <p className="text-md italic text-gray-500 mb-3">
                {product.scientificName}
              </p>

              {/* Rating and Stock */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <StarIconSolid
                        key={index}
                        className={`h-3 w-3 sm:h-5 sm:w-5 ${
                          index < Math.floor(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm sm:text-base">
                    {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-400">|</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  {product.stock} in stock
                </span>
              </div>
            </div>

            {/* Price and Special Offers */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {oldPrice && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    ${oldPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Pot Style Selection */}
            <div className="my-10 mb-18">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                SELECT POT STYLE
              </label>
              <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                {potStyles.map((potStyle) => {
                  const isOutOfStock = potStyle.quantity <= 0;
                  const isSelected = selectedPotStyle?.name === potStyle.name;

                  return (
                    <div key={potStyle._id} className="relative">
                      <button
                        onClick={() => setSelectedPotStyle(potStyle)}
                        disabled={isOutOfStock}
                        className={`
                          relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all duration-200
                          ${
                            isSelected
                              ? "ring-2 ring-accent ring-offset-2 shadow-lg transform scale-105"
                              : isOutOfStock
                              ? "opacity-50 cursor-not-allowed grayscale bg-gray-100"
                              : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:shadow-md hover:scale-102"
                          }
                        `}
                      >
                        <img
                          src={potStyle.image}
                          alt={potStyle.name}
                          className={`
                            absolute inset-0 rounded-xl object-cover w-full h-full
                            ${isSelected ? "brightness-110" : ""}
                          `}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-accent/10 border-2 border-accent flex items-center justify-center">
                            <div className="bg-accent rounded-full p-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>

                      <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                        <span className="block text-sm font-medium text-gray-800">
                          {potStyle.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-gray-200 rounded-xl bg-white w-full sm:w-auto">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="p-3 hover:bg-gray-50 transition-colors rounded-l-xl"
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>
                <span className="w-full sm:w-16 text-center font-medium text-base sm:text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors rounded-r-xl"
                  disabled={quantity >= product.stock}
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-accent hover:bg-accent-dark text-white gap-2 rounded-xl text-sm sm:text-base py-3 sm:py-4 flex items-center justify-center"
              >
                <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </button>
            </div>

            {/* Enhanced Delivery and Returns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 sm:py-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-accent/[0.08] p-3 rounded-full">
                  <TruckIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    Safe Plant Shipping
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Free shipping on orders over $75
                  </p>
                  <p className="text-xs text-accent mt-1">
                    Delivered in nursery pot with care
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-accent/[0.08] p-3 rounded-full">
                  <ShieldCheckIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    Plant Guarantee
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">
                    30-day plant health guarantee
                  </p>
                  <p className="text-xs text-accent mt-1">
                    Arrives healthy or we replace it free
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 sm:mt-12">
          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm overflow-x-auto">
              {[
                "Description",
                "Plant Care",
                `Reviews (${product.reviews.length})`,
              ].map((category, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2 px-3 text-xs sm:text-sm font-medium leading-5 whitespace-nowrap
                  ${
                    selected
                      ? "bg-accent text-white shadow"
                      : "text-gray-700 hover:bg-accent/[0.12] hover:text-accent"
                  }
                `
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="mt-4">
              {({ selectedIndex }) => (
                <>
                  {/* Description Panel */}
                  {selectedIndex === 0 && (
                    <div className="rounded-xl bg-white p-4 sm:p-8 shadow-sm">
                      <div className="prose max-w-none prose-sm sm:prose-base">
                        <p className="text-gray-600 leading-relaxed">
                          {product.description}
                        </p>
                        <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4">
                          Key Features
                        </h3>
                        <ul className="space-y-2">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                              <span>{feature.description}</span>
                            </li>
                          ))}
                        </ul>

                        <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4">
                          About {product.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                          {product.specifications.map((spec) => (
                            <div
                              key={spec.name}
                              className="border-b pb-3 sm:pb-4"
                            >
                              <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                                {spec.name.charAt(0).toUpperCase() +
                                  spec.name.slice(1)}
                              </dt>
                              <dd className="text-sm sm:text-base text-gray-900">
                                {spec.value}
                              </dd>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Plant Care Panel */}
                  {selectedIndex === 1 && (
                    <div className="rounded-xl bg-white p-4 sm:p-8 shadow-sm">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                          {/* Light Requirements */}
                          <div className="bg-accent/[0.08] p-4 rounded-xl flex items-start gap-3">
                            <SunIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Light
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.lightRequirement}
                              </p>
                            </div>
                          </div>

                          {/* Watering */}
                          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                            <CloudIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Watering
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.wateringFrequency}
                              </p>
                            </div>
                          </div>

                          {/* Temperature */}
                          <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                              />
                            </svg>
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Temperature
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.temperature}
                              </p>
                            </div>
                          </div>

                          {/* Humidity */}
                          <div className="bg-indigo-50 p-4 rounded-xl flex items-start gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                              />
                            </svg>
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Humidity
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.humidity}
                              </p>
                            </div>
                          </div>

                          {/* Fertilizing */}
                          <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.4-2.253M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082"
                              />
                            </svg>
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Fertilizing
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.fertilizing}
                              </p>
                            </div>
                          </div>

                          {/* Difficulty */}
                          <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3">
                            <SparklesIcon className="h-5 w-5 text-purple-500 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                Care Difficulty
                              </h3>
                              <p className="text-sm text-gray-600">
                                {product.careInfo.difficulty}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Panel */}
                  {selectedIndex === 2 && (
                    <div className="rounded-xl bg-white p-4 sm:p-8 shadow-sm">
                      <div className="space-y-6 sm:space-y-8">
                        {/* Review Summary */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 p-4 sm:p-6 bg-accent/[0.08] rounded-xl">
                          <div className="w-full sm:w-auto text-center sm:text-left">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                                  {product.rating.toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, index) => (
                                    <StarIconSolid
                                      key={index}
                                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                        product.reviews.length > 0 &&
                                        index < Math.floor(product.rating)
                                          ? "text-yellow-400"
                                          : "text-gray-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex-1 min-w-[120px] text-left">
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {product.reviews.length > 0
                                    ? `Based on ${product.reviews.length} reviews`
                                    : "No reviews yet"}
                                </div>
                                {product.reviews.length > 0 && (
                                  <div className="mt-1">
                                    <button
                                      className="text-xs sm:text-sm text-accent hover:text-accent-dark font-medium"
                                      onClick={handleOpenAllReviews}
                                    >
                                      View all reviews
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto sm:ml-auto">
                            <button
                              className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-white text-sm px-6 py-2 rounded-lg flex items-center justify-center gap-2"
                              onClick={() => setShowWriteReview(true)}
                            >
                              <StarIcon className="h-4 w-4" />
                              <span>Write a Review</span>
                            </button>
                          </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-6">
                          {product.reviews.length > 0 ? (
                            currentReviews?.map((review) => (
                              <div
                                key={review._id}
                                className="border-b pb-4 last:border-b-0"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                  <div>
                                    <div className="flex items-center flex-wrap gap-2">
                                      <span className="font-medium text-gray-900 text-sm">
                                        {review.name}
                                      </span>
                                      {review.verified && (
                                        <span className="inline-flex items-center gap-1 text-accent text-xs">
                                          <CheckIcon className="h-3 w-3" />
                                          Verified Purchase
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex">
                                        {[...Array(5)].map((_, index) => (
                                          <StarIconSolid
                                            key={index}
                                            className={`h-3 w-3 ${
                                              index < review.rating
                                                ? "text-yellow-400"
                                                : "text-gray-200"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          review.createdAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  {isAuthenticated &&
                                    user &&
                                    review.user._id === user.id && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            startEditingReview(review)
                                          }
                                          className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                          </svg>
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteReview(review._id!)
                                          }
                                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                  {review.comment}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="mx-auto h-16 w-16 text-gray-300">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                                  />
                                </svg>
                              </div>
                              <h3 className="mt-2 text-lg font-medium text-gray-900">
                                No reviews yet
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Be the first to review this product!
                              </p>
                            </div>
                          )}

                          {product.reviews.length > 0 && totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-4">
                              <button
                                onClick={() =>
                                  handlePageChange(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${
                                  currentPage === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-accent hover:bg-accent/[0.1]"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>

                              <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`w-8 h-8 rounded-md ${
                                      currentPage === index + 1
                                        ? "bg-accent text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    {index + 1}
                                  </button>
                                ))}
                              </div>

                              <button
                                onClick={() =>
                                  handlePageChange(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md ${
                                  currentPage === totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-accent hover:bg-accent/[0.1]"
                                }`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </main>

      {showAllReviews && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllReviews(false)}
        >
          <div
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                All Reviews for {product.name}
              </h3>
              <button
                onClick={() => setShowAllReviews(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 bg-accent/[0.08] p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{product.rating}</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <StarIconSolid
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Based on {product.reviewsCount} reviews
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">
                          {review.name}
                        </span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-accent text-xs">
                            <CheckIcon className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, index) => (
                            <StarIconSolid
                              key={index}
                              className={`h-3 w-3 ${
                                index < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showWriteReview && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowWriteReview(false)}
        >
          <div
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Write a Review</h3>
              <button
                onClick={() => handleWriteReview(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={editingReview ? handleEditReview : handleSubmitReview}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none"
                    >
                      {star <= reviewFormData.rating ? (
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Review
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  required
                  rows={4}
                  value={reviewFormData.comment}
                  onChange={handleReviewFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => {
                    setShowWriteReview(false);
                    setEditingReview(null);
                    setReviewFormData({
                      rating: 5,
                      comment: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark"
                >
                  {editingReview ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetails;

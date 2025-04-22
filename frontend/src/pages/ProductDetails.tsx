import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  TagIcon,
  ClockIcon,
  ExclamationCircleIcon,
  SunIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastContainer, { ToastData } from "../components/ui/ToastContainer";
import { Tab } from "@headlessui/react";
import { useCart } from "../context/CartContext";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  size: Size;
  potStyle: PotStyle;
}

interface ProductSpecification {
  id: string;
  name: string;
  value: string;
}

interface ProductFeature {
  id: string;
  description: string;
  icon?: string;
}

interface PlantCareInfo {
  lightRequirement: string;
  wateringFrequency: string;
  temperature: string;
  humidity: string;
  fertilizing: string;
  difficulty: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  verified: boolean;
}

interface Size {
  label: string;
  value: string;
  inStock: boolean;
}

interface PotStyle {
  name: string;
  value: string;
  image: string;
}

interface Badge {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice?: number;
  sku: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  scientificName: string;
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  features: ProductFeature[];
  reviews: Review[];
  careInfo: PlantCareInfo;
  createdAt: string;
  updatedAt: string;
  warranty?: string;
  shippingInfo?: {
    freeShippingThreshold?: number;
    estimatedDays: number;
  };
}

const sizes: Size[] = [
  { label: "Small", value: "small", inStock: true },
  { label: "Medium", value: "medium", inStock: true },
  { label: "Large", value: "large", inStock: true },
  { label: "Extra Large", value: "xl", inStock: false },
];

const potStyles: PotStyle[] = [
  {
    name: "Terra Cotta",
    value: "terra-cotta",
    image: "https://placehold.co/600x600?text=Terra+Cotta+Pot",
  },
  {
    name: "Ceramic White",
    value: "ceramic-white",
    image: "https://placehold.co/600x600?text=White+Ceramic+Pot",
  },
  {
    name: "Ceramic Black",
    value: "ceramic-black",
    image: "https://placehold.co/600x600?text=Black+Ceramic+Pot",
  },
];

const productBadges: Badge[] = [
  { icon: SunIcon, label: "Low Light", color: "text-yellow-600" },
  { icon: CloudIcon, label: "Low Maintenance", color: "text-blue-600" },
  { icon: TagIcon, label: "Air Purifying", color: "text-green-600" },
];

// Mock data
const MOCK_PRODUCT: Product = {
  id: "1",
  name: "Monstera Deliciosa",
  slug: "monstera-deliciosa",
  scientificName: "Monstera deliciosa",
  description:
    "The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its stunning, glossy, perforated leaves. This tropical plant is native to the rainforests of Central America and is an excellent statement plant for your home. Easy to care for and fast-growing, it will bring an instant jungle feel to any room.",
  shortDescription:
    "Stunning tropical plant with unique split leaves, perfect for brightening any indoor space",
  price: 39.99,
  oldPrice: 49.99,
  sku: "PLT-MON-001",
  stock: 25,
  rating: 4.8,
  reviewsCount: 156,
  brand: {
    id: "b1",
    name: "GreenThumb",
    slug: "green-thumb",
  },
  categories: [
    {
      id: "c1",
      name: "Indoor Plants",
      slug: "indoor-plants",
    },
    {
      id: "c2",
      name: "Tropical Plants",
      slug: "tropical-plants",
    },
  ],
  tags: [
    {
      id: "t1",
      name: "Air Purifying",
      slug: "air-purifying",
    },
    {
      id: "t2",
      name: "Pet Friendly",
      slug: "pet-friendly",
    },
  ],
  images: [
    {
      id: "img1",
      url: "https://placehold.co/600x600?text=Monstera+Plant",
      alt: "Monstera Deliciosa",
      isPrimary: true,
    },
    {
      id: "img2",
      url: "https://placehold.co/600x600?text=Monstera+Leaves",
      alt: "Monstera Deliciosa Leaves Close-up",
      isPrimary: false,
    },
    {
      id: "img3",
      url: "https://placehold.co/600x600?text=Monstera+in+Room",
      alt: "Monstera in Living Room Setting",
      isPrimary: false,
    },
  ],
  variants: [
    {
      id: "v1",
      name: "Small in Terra Cotta",
      sku: "PLT-MON-S-TC",
      price: 39.99,
      oldPrice: 49.99,
      stock: 10,
      size: {
        label: "Small",
        value: "small",
        inStock: true,
      },
      potStyle: {
        name: "Terra Cotta",
        value: "terra-cotta",
        image: "https://placehold.co/600x600?text=Monstera+Terra+Cotta",
      },
    },
    {
      id: "v2",
      name: "Medium in Ceramic White",
      sku: "PLT-MON-M-CW",
      price: 59.99,
      oldPrice: 69.99,
      stock: 8,
      size: {
        label: "Medium",
        value: "medium",
        inStock: true,
      },
      potStyle: {
        name: "Ceramic White",
        value: "ceramic-white",
        image: "https://placehold.co/600x600?text=Monstera+White+Ceramic",
      },
    },
    {
      id: "v3",
      name: "Large in Ceramic Black",
      sku: "PLT-MON-L-CB",
      price: 79.99,
      oldPrice: 89.99,
      stock: 5,
      size: {
        label: "Large",
        value: "large",
        inStock: true,
      },
      potStyle: {
        name: "Ceramic Black",
        value: "ceramic-black",
        image: "https://placehold.co/600x600?text=Monstera+Black+Ceramic",
      },
    },
  ],
  specifications: [
    {
      id: "spec1",
      name: "Mature Height",
      value: "2-3 feet (indoor)",
    },
    {
      id: "spec2",
      name: "Mature Width",
      value: "1-2 feet",
    },
    {
      id: "spec3",
      name: "Growth Rate",
      value: "Fast",
    },
    {
      id: "spec4",
      name: "Bloom Time",
      value: "Rarely blooms indoors",
    },
    {
      id: "spec5",
      name: "Native Region",
      value: "Central America",
    },
  ],
  features: [
    {
      id: "f1",
      description: "Air purifying qualities improve indoor air quality",
      icon: "leaf",
    },
    {
      id: "f2",
      description: "Distinctive split leaves add unique tropical aesthetic",
      icon: "cloud",
    },
    {
      id: "f3",
      description: "Fast-growing and easy to propagate",
      icon: "sun",
    },
    {
      id: "f4",
      description: "Adaptable to various light conditions",
      icon: "sun",
    },
    {
      id: "f5",
      description: "Makes a statement in any room",
      icon: "home",
    },
  ],
  careInfo: {
    lightRequirement: "medium",
    wateringFrequency:
      "Allow soil to dry between waterings, approximately once a week",
    temperature: "65-85°F (18-29°C)",
    humidity: "Medium to high humidity",
    fertilizing: "Monthly during growing season (spring to summer)",
    difficulty: "beginner",
  },
  reviews: [
    {
      id: "r1",
      author: "Julia Chen",
      rating: 5,
      date: "2024-04-15",
      comment:
        "My Monstera arrived in perfect condition! The leaves are gorgeous and it came with care instructions. It's already putting out a new leaf after just 3 weeks.",
      likes: 24,
      verified: true,
    },
    {
      id: "r2",
      author: "Marcus Lee",
      rating: 4,
      date: "2024-04-10",
      comment:
        "Beautiful plant that looks exactly like the pictures. Shipping was carefully done. Only giving 4 stars because I wish there were more size options available.",
      likes: 12,
      verified: true,
    },
    {
      id: "r3",
      author: "Sophia Williams",
      rating: 5,
      date: "2024-04-05",
      comment:
        "This monstera is thriving in my apartment! The seller included a helpful care guide and the plant was packaged perfectly. Highly recommend!",
      likes: 8,
      verified: true,
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-04-15T00:00:00Z",
  warranty: "30-day plant health guarantee",
  shippingInfo: {
    freeShippingThreshold: 75,
    estimatedDays: 3,
  },
};

const ProductDetails = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedPotStyle, setSelectedPotStyle] = useState<PotStyle | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCareGuide, setShowCareGuide] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProduct(MOCK_PRODUCT);

        if (MOCK_PRODUCT.variants.length > 0) {
          setSelectedPotStyle(MOCK_PRODUCT.variants[0].potStyle);
          setSelectedSize(MOCK_PRODUCT.variants[0].size.value);
          setSelectedImage(MOCK_PRODUCT.variants[0].potStyle.image);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

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

    const selectedVariant = product.variants.find(
      (v) =>
        v.potStyle.value === selectedPotStyle?.value &&
        v.size.value === selectedSize
    );

    if (selectedVariant && newQuantity > selectedVariant.stock) {
      showToast("error", "Cannot exceed available stock");
      return;
    }

    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedPotStyle || !selectedSize) {
      showToast("error", "Please select size and pot style");
      return;
    }

    try {
      const selectedVariant = product.variants.find(
        (v) =>
          v.potStyle.value === selectedPotStyle.value &&
          v.size.value === selectedSize
      );

      if (!selectedVariant) {
        showToast("error", "Selected variant not available");
        return;
      }

      addToCart({
        id: parseInt(product.id),
        name: product.name,
        price: selectedVariant.price,
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

    try {
      setIsWishlisted(!isWishlisted);

      if (!isWishlisted) {
        showToast("success", "Plant added to wishlist successfully");
      } else {
        showToast("success", "Plant removed from wishlist");
      }
    } catch (err) {
      showToast("error", "Failed to update wishlist");
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("success", "Review submitted successfully");
    setReviewFormData({
      rating: 5,
      comment: "",
    });
    setShowWriteReview(false);
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
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-2 text-lg font-semibold text-gray-900">
              Plant Not Found
            </h2>
            <p className="mt-1 text-gray-500">
              {error || "This plant could not be found."}
            </p>
            <div className="mt-6">
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 bg-white rounded-2xl p-4 sm:p-8 shadow-sm">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 space-y-2">
                  {product.oldPrice && (
                    <span className="inline-block bg-accent text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                      Save{" "}
                      {Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100
                      )}
                      %
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 flex justify-end">
                  <button
                    onClick={() => handleToggleWishlist()}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 transition-colors"
                  >
                    {isWishlisted ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Thumbnail Navigation - Scrollable on mobile */}
              <div className="flex gap-3 mt-2 overflow-x-auto pb-6 snap-x">
                {product.images.map((image, index) => (
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {product.name}
              </h1>
              <p className="text-sm italic text-gray-500 mb-3">
                {product.scientificName}
              </p>

              {/* Product Badges */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {productBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-green-50"
                  >
                    <badge.icon
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${badge.color}`}
                    />
                    <span
                      className={`text-xs sm:text-sm font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Rating and Stock */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <StarIconSolid
                        key={index}
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${
                          index < Math.floor(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {product.rating} ({product.reviewsCount} reviews)
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
                {product.oldPrice && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Special Offers */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                  <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Spring Sale - Ends in 3 days</span>
                </div>
              </div>
            </div>

            {/* Pot Style Selection */}
            <div className="my-6 mb-12">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                POT STYLE:
              </label>
              <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                {potStyles.map((potStyle) => (
                  <button
                    key={potStyle.value}
                    onClick={() => setSelectedPotStyle(potStyle)}
                    className={`group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl transition-all ${
                      selectedPotStyle?.value === potStyle.value
                        ? "ring-2 ring-accent ring-offset-2"
                        : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                    }`}
                  >
                    <img
                      src={potStyle.image}
                      alt={potStyle.name}
                      className="absolute inset-0 rounded-xl object-cover w-full h-full"
                    />
                    <span className="sr-only">{potStyle.name}</span>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap font-medium">
                      {potStyle.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  PLANT SIZE:
                </label>
                <button
                  onClick={() => setShowCareGuide(true)}
                  className="text-xs sm:text-sm text-accent hover:underline"
                >
                  Care Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => size.inStock && setSelectedSize(size.value)}
                    disabled={!size.inStock}
                    className={`
                      w-full sm:w-auto px-4 h-12 rounded-xl flex items-center justify-center text-sm sm:text-base
                      ${
                        !size.inStock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : selectedSize === size.value
                          ? "bg-accent text-white"
                          : "bg-white border border-gray-200 hover:border-accent text-gray-900"
                      }
                    `}
                  >
                    {size.label}
                  </button>
                ))}
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
                    Free shipping on orders over $
                    {product.shippingInfo?.freeShippingThreshold}
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
                    {product.warranty}
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
                              key={spec.id}
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
                                {product.careInfo.lightRequirement === "low" &&
                                  "Low light tolerant. Place in a spot with bright, indirect light away from windows."}
                                {product.careInfo.lightRequirement ===
                                  "medium" &&
                                  "Medium light. Place in a spot with bright, indirect light."}
                                {product.careInfo.lightRequirement === "high" &&
                                  "High light. Place in a bright spot with some direct morning sunlight."}
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
                                {product.careInfo.difficulty === "beginner" &&
                                  "Beginner - Easy to care for, very forgiving."}
                                {product.careInfo.difficulty ===
                                  "intermediate" &&
                                  "Intermediate - Needs consistent care but tolerates occasional neglect."}
                                {product.careInfo.difficulty === "expert" &&
                                  "Expert - Requires precise and attentive care."}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center bg-accent/[0.08] p-4 rounded-xl mt-6">
                          <h3 className="font-medium mb-2">Plant Care Tip</h3>
                          <p className="text-sm text-gray-600">
                            Keep your {product.name} away from drafts and
                            heating vents. Clean the leaves occasionally with a
                            damp cloth to remove dust and help the plant
                            breathe.
                          </p>
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
                                  {product.rating}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, index) => (
                                    <StarIconSolid
                                      key={index}
                                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
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
                                  Based on {product.reviews.length} reviews
                                </div>
                                <div className="mt-1">
                                  <button
                                    className="text-xs sm:text-sm text-accent hover:text-accent-dark font-medium"
                                    onClick={handleOpenAllReviews}
                                  >
                                    View all reviews
                                  </button>
                                </div>
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
                          {currentReviews?.map((review) => (
                            <div
                              key={review.id}
                              className="border-b pb-4 last:border-b-0"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                <div>
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {review.author}
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
                                        review.date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <button className="text-xs text-gray-500 hover:text-accent self-start">
                                  Helpful ({review.likes})
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {review.comment}
                              </p>
                            </div>
                          ))}

                          {/* Controale pentru paginare */}
                          {totalPages > 1 && (
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

      {/* Plant Care Guide Modal */}
      {showCareGuide && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCareGuide(false)}
        >
          <div
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                Care Guide for {product.name}
              </h3>
              <button
                onClick={() => setShowCareGuide(false)}
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

            <div className="space-y-4">
              <div className="bg-accent/[0.08] p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                  Light Requirements
                </h4>
                <p className="text-sm text-gray-600">
                  {product.careInfo.lightRequirement === "low" &&
                    "Your plant thrives in low to medium indirect light. It can tolerate lower light conditions but growth may slow. Keep away from direct sunlight which can burn the leaves."}
                  {product.careInfo.lightRequirement === "medium" &&
                    "Your plant prefers bright, indirect light. Place near a window with filtered light or a few feet away from a south or west-facing window. Avoid direct afternoon sun which can scorch the leaves."}
                  {product.careInfo.lightRequirement === "high" &&
                    "Your plant needs bright light to thrive. Place near a south or west-facing window with some direct morning sunlight. If leaves begin to yellow or brown, it may be getting too much direct sun."}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <CloudIcon className="h-5 w-5 text-blue-500" />
                  Watering Tips
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {product.careInfo.wateringFrequency}
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>
                    Check soil moisture by inserting your finger an inch into
                    the soil
                  </li>
                  <li>
                    Water thoroughly until water drains from the bottom of the
                    pot
                  </li>
                  <li>Empty any water that collects in the saucer</li>
                  <li>
                    Adjust watering frequency based on season and home
                    conditions
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-amber-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Z"
                    />
                  </svg>
                  Fertilizing Schedule
                </h4>
                <p className="text-sm text-gray-600">
                  {product.careInfo.fertilizing}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 text-indigo-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                      />
                    </svg>
                    Ideal Humidity
                  </h4>
                  <p className="text-sm text-gray-600">
                    {product.careInfo.humidity}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 text-orange-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                      />
                    </svg>
                    Temperature Range
                  </h4>
                  <p className="text-sm text-gray-600">
                    {product.careInfo.temperature}
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <SparklesIcon className="h-5 w-5 text-purple-500" />
                  Additional Care Tips
                </h4>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>
                    Dust leaves regularly with a damp cloth to keep them clean
                    and healthy
                  </li>
                  <li>
                    Rotate your plant every few weeks to promote even growth
                  </li>
                  <li>
                    Inspect regularly for pests, especially on the undersides of
                    leaves
                  </li>
                  <li>
                    Repot every 1-2 years in fresh potting soil when roots begin
                    to outgrow the pot
                  </li>
                  <li>
                    Prune yellowing or damaged leaves at the base with clean
                    scissors
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">
                          {review.author}
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
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button className="text-xs text-gray-500 hover:text-accent self-start">
                      Helpful ({review.likes})
                    </button>
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
                onClick={() => setShowWriteReview(false)}
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

            <form onSubmit={handleSubmitReview} className="space-y-4">
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
                  onClick={() => setShowWriteReview(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-accent-dark"
                >
                  Submit Review
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

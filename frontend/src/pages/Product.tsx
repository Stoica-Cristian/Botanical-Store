import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Product as ProductType } from "../types/product";
import axios from "axios";
import { API_BASE_URL } from "../config/constants";

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        const data = response.data;

        // Normalize the data to match our Product interface
        const normalizedProduct: ProductType = {
          id: data._id || data.id,
          _id: data._id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category || "Uncategorized",
          stock: data.stock || 0,
          images: data.images || [],
          rating: data.rating || 0,
          reviews: data.reviews || [],
        };

        setProduct(normalizedProduct);
        if (normalizedProduct.images && normalizedProduct.images.length > 0) {
          setSelectedImage(normalizedProduct.images[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Added ${quantity} of ${product?.name} to cart`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link
            to="/products"
            className="text-primary underline mt-2 inline-block"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const { name, description, price, category, stock, images, rating, reviews } =
    product;

  const formattedPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          to="/products"
          className="text-primary hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg overflow-hidden mb-4 h-96">
            <img
              src={
                selectedImage ||
                (images && images.length > 0
                  ? images[0]
                  : "https://via.placeholder.com/600x400?text=No+Image")
              }
              alt={name}
              className="w-full h-full object-contain p-4"
            />
          </div>

          {images && images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`border-2 rounded-md overflow-hidden h-20 ${
                    selectedImage === img ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    i < Math.floor(rating || 0)
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating?.toFixed(1)} ({reviews?.length || 0} reviews)
            </span>
          </div>

          <div className="text-2xl font-bold text-primary mb-4">
            {formattedPrice}
          </div>

          <div className="mb-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
              ${
                stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}
            </span>
            {category && (
              <span className="inline-block ml-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {category}
              </span>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700">{description}</p>
          </div>

          {stock > 0 && (
            <>
              <div className="mb-6">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={decreaseQuantity}
                    className="bg-gray-200 px-3 py-2 rounded-l-md hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={stock}
                    className="border-y border-gray-300 py-2 px-3 w-16 text-center focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={increaseQuantity}
                    className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-dark transition duration-300 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="font-medium">
                    {review.user.firstName} {review.user.lastName}
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <time className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        i < review.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500">No reviews yet.</p>
            {user && (
              <button className="mt-2 text-primary hover:underline">
                Be the first to write a review
              </button>
            )}
          </div>
        )}

        {user && (
          <div className="mt-8">
            <button className="inline-flex items-center px-4 py-2 border border-primary text-primary bg-white rounded-md hover:bg-primary hover:text-white transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
              Write a Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;

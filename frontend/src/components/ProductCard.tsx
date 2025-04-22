import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { id, _id, name, price, stock, images, image, rating } = product;
  const productId = _id || id;

  // Format price with 2 decimal places
  const CURRENCY = "€";
  const LOCALE = "de-DE";
  const formattedPrice = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "EUR",
  }).format(price);

  // Display the first image or a placeholder
  const imageUrl =
    images && images.length > 0
      ? images[0]
      : image || "https://via.placeholder.com/300x300?text=No+Image";

  // Determine stock status and label
  const getStockStatus = () => {
    if (stock <= 0) return { label: "Out of Stock", color: "bg-red-500" };
    if (stock < 5) return { label: "Low Stock", color: "bg-yellow-500" };
    return { label: "In Stock", color: "bg-green-500" };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105">
      <Link to={`/product/${productId}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute top-2 right-2 ${stockStatus.color} text-white text-xs px-2 py-1 rounded-full`}
          >
            {stockStatus.label}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-800 truncate">{name}</h3>
          <div className="mt-1 flex justify-between items-center">
            <span className="text-xl font-bold text-primary">
              {formattedPrice}
            </span>
            {rating && (
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </span>
                <span className="text-sm text-gray-600">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

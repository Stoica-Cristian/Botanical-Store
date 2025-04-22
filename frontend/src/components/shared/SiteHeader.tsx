import { Link } from "react-router-dom";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";

export default function SiteHeader() {
  const { totalItems } = useCart();

  return (
    <div className="flex items-center space-x-6">
      <Link to="/profile/wishlist" className="relative">
        <HeartIcon className="h-6 w-6 text-gray-700" />
      </Link>

      <Link to="/cart" className="relative">
        <div className="relative">
          <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
              {totalItems}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

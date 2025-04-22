import { useState } from "react";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import ToastContainer, { ToastData } from "../components/ui/ToastContainer";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    const item = cart.find((item) => item.id === id);

    if (!item) return;

    if (newQuantity <= 0) {
      showToast("error", "Minimum quantity is 1");
      return;
    }

    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: number) => {
    const itemToRemove = cart.find((item) => item.id === id);
    if (itemToRemove) {
      removeFromCart(id);
      showToast("success", `Removed ${itemToRemove.name} from cart`);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("error", "Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = totalPrice;
  const shipping = cart.length > 0 ? 15.0 : 0;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/store"
              className="btn btn-accent text-white hover:bg-accent/90"
            >
              Continue Shopping
            </Link>
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm p-6 relative"
                >
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>

                  <div className="flex gap-6">
                    <Link to={`/store/product/${item.id}`} className="group">
                      <div className="avatar relative">
                        <div className="mask mask-squircle w-24 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                      </div>
                    </Link>

                    <div className="flex-1">
                      <Link to={`/store/product/${item.id}`} className="group">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-accent transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-accent font-bold mb-4">
                        ${item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="h-4 w-4 text-gray-400" />
                          </button>
                          <span className="px-4 py-2 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-accent text-white hover:bg-accent/90"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/store"
                  className="w-full btn btn-ghost mt-4 hover:bg-gray-100"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;

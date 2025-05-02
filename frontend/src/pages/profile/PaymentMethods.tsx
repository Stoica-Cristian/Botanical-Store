import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ToastContainer, { ToastData } from "../../components/ui/ToastContainer";
import { PaymentMethod } from "../../types/paymentMethod";
import { paymentMethodService } from "../../services/paymentMethodService";

const PaymentMethods = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const data = await paymentMethodService.getAll();
      setPaymentMethods(data);
    } catch (error) {
      showToast("error", "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodService.setDefault(id);
      setPaymentMethods((prevMethods) =>
        prevMethods.map((method) => ({
          ...method,
          isDefault: method._id === id,
        }))
      );
      showToast("success", "Default payment method updated");
    } catch (error) {
      showToast("error", "Failed to update default payment method");
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      try {
        const methodToDelete = paymentMethods.find((m) => m._id === id);
        if (methodToDelete?.isDefault) {
          showToast("error", "Cannot delete default payment method");
          return;
        }
        await paymentMethodService.delete(id);
        setPaymentMethods((prevMethods) =>
          prevMethods.filter((method) => method._id !== id)
        );
        showToast("success", "Payment method removed successfully");
        setDeleteConfirm(null);
      } catch (error) {
        showToast("error", "Failed to delete payment method");
        setDeleteConfirm(null);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const newPaymentMethod = await paymentMethodService.create({
        cardType: formData.get("cardType") as string,
        lastFour: formData.get("lastFour") as string,
        expiryDate: `${formData.get("expiryMonth")}/${formData.get(
          "expiryYear"
        )}`,
        isDefault: paymentMethods.length === 0,
      });

      if (newPaymentMethod) {
        setPaymentMethods((prev) => [...prev, newPaymentMethod]);
        setIsAddCardModalOpen(false);
        showToast("success", "Payment method added successfully");
        e.currentTarget.reset();
      }
    } catch (error) {}
  };

  // Redirect if user is not authenticated and auth loading is complete
  if (!loading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="flex-1 container mx-auto px-4 py-8 min-h-[400px]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Methods
              </h1>
            </div>
            <button
              onClick={() => setIsAddCardModalOpen(true)}
              className="btn btn-accent text-white gap-2 hover:bg-accent/90"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Card
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payment methods
                </h3>
                <p className="text-gray-500 mb-4">
                  Add a credit or debit card and start shopping
                </p>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          method.isDefault ? "bg-accent/10" : "bg-gray-100"
                        }`}
                      >
                        <CreditCardIcon
                          className={`h-6 w-6 ${
                            method.isDefault ? "text-accent" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {method.cardType} ending in {method.lastFour}
                          </p>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method._id)}
                          className="btn btn-sm btn-ghost hover:bg-accent/5 hover:text-accent"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(method._id)}
                        className={`btn btn-sm ${
                          deleteConfirm === method._id
                            ? "btn-error text-white"
                            : "btn-ghost text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          method.isDefault
                            ? "Cannot delete default payment method"
                            : deleteConfirm === method._id
                            ? "Click again to confirm deletion"
                            : "Delete payment method"
                        }
                      >
                        <TrashIcon className="h-5 w-5" />
                        {deleteConfirm === method._id && " Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Card</h2>
              <button
                onClick={() => setIsAddCardModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Type
                </label>
                <select
                  name="cardType"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                >
                  <option value="">Select card type</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="lastFour"
                  placeholder="Last 4 digits"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  maxLength={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Month
                  </label>
                  <select
                    name="expiryMonth"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0");
                      return (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Year
                  </label>
                  <select
                    name="expiryYear"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year.toString().slice(-2)}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 btn btn-accent text-white hover:bg-accent/90"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="flex-1 btn btn-ghost hover:bg-gray-100"
                >
                  Cancel
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

export default PaymentMethods;

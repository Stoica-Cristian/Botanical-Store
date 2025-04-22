import {
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ToastContainer, { ToastData } from "../../components/ui/ToastContainer";

interface PaymentMethod {
  id: number;
  cardType: string;
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
}

const PaymentMethods = () => {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      cardType: "Visa",
      lastFour: "4242",
      expiryDate: "12/25",
      isDefault: true,
    },
    {
      id: 2,
      cardType: "Mastercard",
      lastFour: "8888",
      expiryDate: "09/24",
      isDefault: false,
    },
  ]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    showToast("success", "Default payment method updated");
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      const methodToDelete = paymentMethods.find((m) => m.id === id);
      if (methodToDelete?.isDefault) {
        showToast("error", "Cannot delete default payment method");
        return;
      }
      setPaymentMethods((prevMethods) =>
        prevMethods.filter((method) => method.id !== id)
      );
      showToast("success", "Payment method removed successfully");
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="flex-1 container mx-auto px-4 py-8">
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
                  Add a credit or debit card to start shopping
                </p>
                <button
                  onClick={() => setIsAddCardModalOpen(true)}
                  className="btn btn-accent text-white gap-2 hover:bg-accent/90"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add New Card
                </button>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
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
                          onClick={() => handleSetDefault(method.id)}
                          className="btn btn-sm btn-ghost hover:bg-accent/5 hover:text-accent"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(method.id)}
                        className={`btn btn-sm ${
                          deleteConfirm === method.id
                            ? "btn-error text-white"
                            : "btn-ghost text-red-500 hover:bg-red-50"
                        }`}
                        disabled={method.isDefault}
                        title={
                          method.isDefault
                            ? "Cannot delete default payment method"
                            : ""
                        }
                      >
                        <TrashIcon className="h-5 w-5" />
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

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
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

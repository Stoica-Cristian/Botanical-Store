import { useState, useEffect } from "react";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  settingsService,
  type Settings,
  type ShippingMethod,
  type PaymentGateway,
} from "../../services/settingsService";
import Loader from "../ui/Loader";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "shipping" | "payment"
  >("general");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { user } = useAuth();

  // Editing states
  const [generalSettings, setGeneralSettings] = useState({
    storeName: "",
    currency: "",
    taxRate: 0,
  });

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [currentShippingMethod, setCurrentShippingMethod] =
    useState<ShippingMethod | null>(null);

  // Add confirmation dialog state for shipping methods
  const [showDeleteShippingConfirmation, setShowDeleteShippingConfirmation] =
    useState(false);
  const [shippingMethodToDelete, setShippingMethodToDelete] = useState<
    string | null
  >(null);

  // Payment gateway modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPaymentGateway, setCurrentPaymentGateway] =
    useState<PaymentGateway | null>(null);
  const [paymentGatewayToDelete, setPaymentGatewayToDelete] = useState<
    string | null
  >(null);
  const [showDeletePaymentConfirmation, setShowDeletePaymentConfirmation] =
    useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await settingsService.getSettings(user?.id || "");
        setGeneralSettings({
          storeName: data.storeName,
          currency: data.currency,
          taxRate: data.taxRate,
        });
        setShippingMethods(data.shippingMethods);
        setPaymentGateways(data.paymentGateways);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to load settings. Please try again later.");
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const addToast = (type: "success" | "error", message: string) => {
    const newToast: ToastData = {
      id: Date.now(),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings(generalSettings, user?.id || "");
      addToast("success", "General settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      addToast("error", "Failed to update settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentGatewayToggle = async (id: string) => {
    try {
      const gateway = paymentGateways.find((g) => g._id === id);
      if (!gateway) return;

      const updatedGateway = await settingsService.updatePaymentGateway(
        id,
        {
          enabled: !gateway.enabled,
        },
        user?.id || ""
      );

      setPaymentGateways((prev) =>
        prev.map((g) => (g._id === id ? updatedGateway : g))
      );

      addToast(
        "success",
        `${gateway.name} ${
          gateway.enabled ? "disabled" : "enabled"
        } successfully`
      );
    } catch (error) {
      console.error("Error toggling payment gateway:", error);
      addToast("error", "Failed to update payment gateway. Please try again.");
    }
  };

  const handleAddShippingMethod = () => {
    setCurrentShippingMethod(null);
    setShowShippingModal(true);
  };

  const handleEditShippingMethod = (method: ShippingMethod) => {
    setCurrentShippingMethod(method);
    setShowShippingModal(true);
  };

  const handleDeleteShippingMethod = (id: string) => {
    setShippingMethodToDelete(id);
    setShowDeleteShippingConfirmation(true);
  };

  const confirmDeleteShippingMethod = async () => {
    if (!shippingMethodToDelete) return;

    try {
      await settingsService.deleteShippingMethod(
        shippingMethodToDelete,
        user?.id || ""
      );
      setShippingMethods((prev) =>
        prev.filter((method) => method._id !== shippingMethodToDelete)
      );
      addToast("success", "Shipping method deleted successfully");
      setShowDeleteShippingConfirmation(false);
      setShippingMethodToDelete(null);
    } catch (error) {
      console.error("Error deleting shipping method:", error);
      addToast("error", "Failed to delete shipping method. Please try again.");
    }
  };

  const handleSaveShippingMethod = async (
    method: Omit<ShippingMethod, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      let updatedMethod: ShippingMethod;
      if (currentShippingMethod?._id) {
        updatedMethod = await settingsService.updateShippingMethod(
          currentShippingMethod._id,
          method,
          user?.id || ""
        );
        setShippingMethods((prev) =>
          prev.map((m) =>
            m._id === currentShippingMethod._id ? updatedMethod : m
          )
        );
      } else {
        updatedMethod = await settingsService.createShippingMethod(
          method,
          user?.id || ""
        );
        setShippingMethods((prev) => [...prev, updatedMethod]);
      }

      setShowShippingModal(false);
      addToast(
        "success",
        `Shipping method ${
          currentShippingMethod ? "updated" : "added"
        } successfully`
      );
    } catch (error) {
      console.error("Error saving shipping method:", error);
      addToast("error", "Failed to save shipping method. Please try again.");
    }
  };

  const handleAddPaymentGateway = () => {
    setCurrentPaymentGateway(null);
    setShowPaymentModal(true);
  };

  const handleEditPaymentGateway = (gateway: PaymentGateway) => {
    setCurrentPaymentGateway(gateway);
    setShowPaymentModal(true);
  };

  const handleDeletePaymentGateway = (id: string) => {
    setPaymentGatewayToDelete(id);
    setShowDeletePaymentConfirmation(true);
  };

  const confirmDeletePaymentGateway = async () => {
    if (!paymentGatewayToDelete) return;

    try {
      await settingsService.deletePaymentGateway(
        paymentGatewayToDelete,
        user?.id || ""
      );
      setPaymentGateways((prev) =>
        prev.filter((gateway) => gateway._id !== paymentGatewayToDelete)
      );
      addToast("success", "Payment gateway deleted successfully");
      setShowDeletePaymentConfirmation(false);
      setPaymentGatewayToDelete(null);
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      addToast("error", "Failed to delete payment gateway. Please try again.");
    }
  };

  const handleSavePaymentGateway = async (
    gateway: Omit<PaymentGateway, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      let updatedGateway: PaymentGateway;
      if (currentPaymentGateway?._id) {
        updatedGateway = await settingsService.updatePaymentGateway(
          currentPaymentGateway._id,
          gateway,
          user?.id || ""
        );
        setPaymentGateways((prev) =>
          prev.map((g) =>
            g._id === currentPaymentGateway._id ? updatedGateway : g
          )
        );
      } else {
        updatedGateway = await settingsService.createPaymentGateway(
          gateway,
          user?.id || ""
        );
        setPaymentGateways((prev) => [...prev, updatedGateway]);
      }

      setShowPaymentModal(false);
      addToast(
        "success",
        `Payment gateway ${
          currentPaymentGateway ? "updated" : "added"
        } successfully`
      );
    } catch (error) {
      console.error("Error saving payment gateway:", error);
      addToast("error", "Failed to save payment gateway. Please try again.");
    }
  };

  if (loading) {
    return <Loader size="lg" text="Loading settings..." />;
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
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-medium text-gray-900">Store Settings</h2>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === "general"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === "shipping"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === "payment"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("payment")}
            >
              Payment
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <form onSubmit={handleGeneralSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={generalSettings.storeName}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      storeName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      currency: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
                  required
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={generalSettings.taxRate}
                  onChange={(e) =>
                    setGeneralSettings({
                      ...generalSettings,
                      taxRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Shipping Settings */}
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Shipping Methods
                </h3>
                <button
                  onClick={handleAddShippingMethod}
                  className="bg-accent hover:bg-accent/90 text-white px-3 py-1.5 text-sm rounded-lg inline-flex items-center transition-colors"
                >
                  Add Shipping Method
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated Delivery
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shippingMethods.length > 0 ? (
                      shippingMethods.map((method) => (
                        <tr key={method._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {method.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {method.price === 0
                              ? "Free"
                              : `$${method.price.toFixed(2)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {method.estimatedDelivery}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditShippingMethod(method)}
                              className="text-accent hover:text-accent/80 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteShippingMethod(method._id)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No shipping methods found. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Gateways
                </h3>
                <button
                  onClick={handleAddPaymentGateway}
                  className="bg-accent hover:bg-accent/90 text-white px-3 py-1.5 text-sm rounded-lg inline-flex items-center transition-colors"
                >
                  Add Payment Gateway
                </button>
              </div>

              <div className="space-y-4">
                {paymentGateways.length > 0 ? (
                  paymentGateways.map((gateway) => (
                    <div
                      key={gateway._id}
                      className={`rounded-lg p-4 flex justify-between items-center transition-colors ${
                        gateway.enabled
                          ? "bg-green-50 border border-green-100"
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <h4 className="text-base font-medium text-gray-900">
                          {gateway.name}
                        </h4>
                        <p
                          className={`text-sm ${
                            gateway.enabled
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {gateway.enabled ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {gateway.enabled ? "On" : "Off"}
                          </span>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={gateway.enabled}
                              onChange={() =>
                                handlePaymentGatewayToggle(gateway._id)
                              }
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </label>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPaymentGateway(gateway)}
                            className="text-accent hover:text-accent/80"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeletePaymentGateway(gateway._id)
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg">
                    No payment gateways found. Add one to get started.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Method Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentShippingMethod
                  ? "Edit Shipping Method"
                  : "Add Shipping Method"}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowShippingModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <ShippingMethodForm
              method={currentShippingMethod}
              onSave={handleSaveShippingMethod}
              onCancel={() => setShowShippingModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Shipping Confirmation Dialog */}
      {showDeleteShippingConfirmation && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this shipping method? This
                action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowDeleteShippingConfirmation(false);
                  setShippingMethodToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                onClick={confirmDeleteShippingMethod}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentPaymentGateway
                  ? "Edit Payment Gateway"
                  : "Add Payment Gateway"}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPaymentModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <PaymentGatewayForm
              gateway={currentPaymentGateway}
              onSave={handleSavePaymentGateway}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Payment Gateway Confirmation Dialog */}
      {showDeletePaymentConfirmation && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete this payment gateway? This
                action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowDeletePaymentConfirmation(false);
                  setPaymentGatewayToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                onClick={confirmDeletePaymentGateway}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ShippingMethodFormProps {
  method: ShippingMethod | null;
  onSave: (
    method: Omit<ShippingMethod, "_id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const ShippingMethodForm: React.FC<ShippingMethodFormProps> = ({
  method,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: method?.name || "",
    price: method?.price || 0,
    estimatedDelivery: method?.estimatedDelivery || "",
    isDefault: method?.isDefault || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Method Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price ($)
        </label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="0"
          step="0.01"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
        <p className="mt-1 text-xs text-gray-500">Set to 0 for free shipping</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Delivery
        </label>
        <input
          type="text"
          name="estimatedDelivery"
          value={formData.estimatedDelivery}
          onChange={handleChange}
          placeholder="e.g. 2-3 business days"
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {method ? "Update Method" : "Add Method"}
        </button>
      </div>
    </form>
  );
};

interface PaymentGatewayFormProps {
  gateway: PaymentGateway | null;
  onSave: (
    gateway: Omit<PaymentGateway, "_id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
}

const PaymentGatewayForm: React.FC<PaymentGatewayFormProps> = ({
  gateway,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: gateway?.name || "",
    enabled: gateway?.enabled || false,
    credentials: gateway?.credentials || {},
    isDefault: gateway?.isDefault || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gateway Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
      </div>

      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            Enable Gateway
          </span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          {gateway ? "Update Gateway" : "Add Gateway"}
        </button>
      </div>
    </form>
  );
};

export default Settings;

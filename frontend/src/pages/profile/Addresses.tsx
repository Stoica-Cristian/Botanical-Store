import {
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ToastContainer, { ToastData } from "../../components/ui/ToastContainer";

interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const Addresses = () => {
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: "Home",
      street: "123 Main Street",
      city: "Bucharest",
      state: "Sector 1",
      zipCode: "012345",
      isDefault: true,
    },
    {
      id: 2,
      name: "Office",
      street: "456 Business Avenue",
      city: "Bucharest",
      state: "Sector 2",
      zipCode: "023456",
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
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
    showToast("success", "Default delivery address updated");
  };

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) {
      const addressToDelete = addresses.find((a) => a.id === id);
      if (addressToDelete?.isDefault) {
        showToast("error", "Cannot delete default address");
        return;
      }
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address.id !== id)
      );
      showToast("success", "Address removed successfully");
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
                <MapPinIcon className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Delivery Addresses
              </h1>
            </div>
            <button
              onClick={() => setIsAddAddressModalOpen(true)}
              className="btn btn-accent text-white gap-2 hover:bg-accent/90"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Address
            </button>
          </div>

          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No addresses yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add a delivery address to start shopping
                </p>
                <button
                  onClick={() => setIsAddAddressModalOpen(true)}
                  className="btn btn-accent text-white gap-2 hover:bg-accent/90"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add New Address
                </button>
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          address.isDefault ? "bg-accent/10" : "bg-gray-100"
                        }`}
                      >
                        <MapPinIcon
                          className={`h-6 w-6 ${
                            address.isDefault ? "text-accent" : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {address.name}
                          </p>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {address.street}
                        </p>
                        <p className="text-sm text-gray-500">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="btn btn-sm btn-ghost hover:bg-accent/5 hover:text-accent"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
                        className={`btn btn-sm ${
                          deleteConfirm === address.id
                            ? "btn-error text-white"
                            : "btn-ghost text-red-500 hover:bg-red-50"
                        }`}
                        disabled={address.isDefault}
                        title={
                          address.isDefault
                            ? "Cannot delete default address"
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

      {/* Add Address Modal */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Address
              </h2>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home, Office"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Sector
                  </label>
                  <input
                    type="text"
                    placeholder="State or sector"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="ZIP code"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 btn btn-accent text-white hover:bg-accent/90"
                >
                  Add Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
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

export default Addresses;

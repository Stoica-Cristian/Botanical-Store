import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HeartIcon,
  CreditCardIcon,
  XMarkIcon,
  CameraIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastContainer, { ToastData } from "../components/ui/ToastContainer";
import { useAuth } from "../context/AuthContext";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  stats: {
    orders: number;
    wishlist: number;
    savedCards: number;
  };
}

const Profile = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+40 123 456 789",
    address: "123 Street Name, City, Country",
    avatar: "",
    stats: {
      orders: 0,
      wishlist: 0,
      savedCards: 0,
    },
  });

  useEffect(() => {
    if (authUser) {
      setUser((prevUser) => ({
        ...prevUser,
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
        avatar:
          authUser.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() ||
              "User"
          )}&background=random&color=fff`,
        stats: {
          orders: 12,
          wishlist: 8,
          savedCards: 2,
        },
      }));
      setIsLoading(false);
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [authUser, authLoading]);

  const [editForm, setEditForm] = useState<Omit<UserProfile, "stats">>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });

  useEffect(() => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    });
  }, [user]);

  const fullName = `${user.firstName} ${user.lastName}`.trim() || "Loading...";

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUser((prev) => ({
        ...prev,
        ...editForm,
      }));
      setIsEditModalOpen(false);
      showToast("success", "Profile updated successfully");
    } catch (error) {
      showToast("error", "Failed to update profile");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Image size should be less than 5MB");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "error",
          "Please upload a valid image file (JPG, PNG, or GIF)"
        );
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setEditForm((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));
    }
  };

  const LoadingPlaceholder = () => (
    <div className="animate-pulse h-4 bg-gray-200 rounded w-2/3"></div>
  );

  // Redirect if user is not authenticated and auth loading is complete
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="avatar">
                  <div className="mask mask-squircle w-24">
                    {isLoading ? (
                      <div className="bg-gray-200 w-full h-full animate-pulse rounded-full"></div>
                    ) : (
                      <img
                        src={user.avatar}
                        alt={fullName}
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 p-2 bg-accent text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-accent/90"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isLoading ? <LoadingPlaceholder /> : fullName}
                </h1>
                <p className="text-gray-500 mt-1">
                  Member since{" "}
                  {isLoading ? (
                    <span className="inline-block animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
                  ) : authUser?.createdAt ? (
                    new Date(authUser.createdAt).toLocaleDateString()
                  ) : (
                    "January 2024"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                    <ShoppingBagIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-xl font-bold text-gray-900">
                      {isLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-6 w-8 rounded"></span>
                      ) : (
                        user.stats.orders
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                    <HeartIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wishlist</p>
                    <p className="text-xl font-bold text-gray-900">
                      {isLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-6 w-8 rounded"></span>
                      ) : (
                        user.stats.wishlist
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                    <CreditCardIcon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Saved Cards</p>
                    <p className="text-xl font-bold text-gray-900">
                      {isLoading ? (
                        <span className="inline-block animate-pulse bg-gray-200 h-6 w-8 rounded"></span>
                      ) : (
                        user.stats.savedCards
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                    <h2 className="text-xl font-bold text-gray-900">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="btn btn-accent text-white gap-2 w-full sm:w-auto"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                  <div className="space-y-7">
                    <div className="flex items-center gap-4">
                      <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Full Name</p>
                        {isLoading ? (
                          <LoadingPlaceholder />
                        ) : (
                          <p className="text-gray-900 break-words">
                            {`${user.firstName} ${user.lastName}`.trim() ||
                              "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Email</p>
                        {isLoading ? (
                          <LoadingPlaceholder />
                        ) : (
                          <p className="text-gray-900 break-words">
                            {user.email || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <PhoneIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Phone</p>
                        {isLoading ? (
                          <LoadingPlaceholder />
                        ) : (
                          <p className="text-gray-900 break-words">
                            {user.phone || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Address</p>
                        {isLoading ? (
                          <LoadingPlaceholder />
                        ) : (
                          <p className="text-gray-900 break-words">
                            {user.address || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link
                      to="/profile/orders"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors text-left"
                    >
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <ShoppingBagIcon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="font-medium">View Orders</span>
                    </Link>
                    <Link
                      to="/profile/wishlist"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors text-left"
                    >
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <HeartIcon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="font-medium">View Wishlist</span>
                    </Link>
                    <Link
                      to="/profile/payment-methods"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors text-left"
                    >
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <CreditCardIcon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="font-medium">
                        Manage Payment Methods
                      </span>
                    </Link>
                    <Link
                      to="/profile/addresses"
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors text-left"
                    >
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="font-medium">Manage Addresses</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="avatar">
                    <div className="mask mask-squircle w-24">
                      {isLoading ? (
                        <div className="bg-gray-200 w-full h-full animate-pulse rounded-full"></div>
                      ) : (
                        <img
                          src={editForm.avatar}
                          alt="Profile"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-1.5 bg-accent text-white rounded-full cursor-pointer hover:bg-accent/90 transition-colors"
                  >
                    <CameraIcon className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click the camera to change avatar
                </p>
                <p className="text-xs text-gray-400">
                  Maximum size: 5MB (JPG, PNG, or GIF)
                </p>
              </div>

              {/* First Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  minLength={2}
                />
              </div>

              {/* Last Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  minLength={2}
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  pattern="[+]?[0-9\s-]+"
                />
              </div>

              {/* Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                <button
                  type="submit"
                  className="w-full btn btn-accent text-white hover:bg-accent/90"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full btn btn-ghost hover:bg-gray-100"
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

export default Profile;

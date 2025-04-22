import { useState } from "react";
import {
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ToastContainer, { ToastData } from "../../components/ui/ToastContainer";
import { Link } from "react-router-dom";

const Settings = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    savePaymentInfo: true,
    darkMode: false,
    autoLogin: true,
  });

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const validatePassword = (password: string) => {
    return {
      isValid:
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
      hasMinLength: password.length >= 8,
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      showToast("error", "Password does not meet the requirements");
      return;
    }

    if (!passwordsMatch) {
      showToast("error", "New passwords do not match");
      return;
    }

    showToast("success", "Password changed successfully");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    showToast("success", `Setting updated successfully`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-8">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li className="font-semibold">Settings</li>
            </ul>
          </div>

          <h1 className="text-3xl font-bold mb-10">Account Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Security settings */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <ShieldCheckIcon className="h-7 w-7 text-accent" />
                  <h2 className="text-2xl font-bold">Security</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-7">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base">
                        Current Password
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        className="input input-bordered w-full pr-10"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base">
                        New Password
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className={`input input-bordered w-full pr-10 ${
                          newPassword && !passwordValidation.isValid
                            ? "input-error"
                            : ""
                        }`}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {newPassword && (
                    <div className="grid grid-cols-2 gap-3 text-sm mt-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasUppercase ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasLowercase ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasNumber ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasSpecialChar ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span>Special character</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasMinLength ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium text-base">
                        Confirm New Password
                      </span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className={`input input-bordered w-full pr-10 ${
                          confirmPassword && !passwordsMatch
                            ? "input-error"
                            : ""
                        }`}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <span className="text-error text-sm mt-2 block">
                        Passwords do not match
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent text-white mt-4"
                    disabled={
                      !oldPassword ||
                      !passwordValidation.isValid ||
                      !passwordsMatch
                    }
                  >
                    Change Password
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <BellIcon className="h-7 w-7 text-accent" />
                  <h2 className="text-2xl font-bold">Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Receive order updates and promotions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.emailNotifications}
                      onChange={() =>
                        handleTogglePreference("emailNotifications")
                      }
                    />
                  </div>

                  <div className="divider my-3"></div>

                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Receive text messages for order status
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.smsNotifications}
                      onChange={() =>
                        handleTogglePreference("smsNotifications")
                      }
                    />
                  </div>

                  <div className="divider my-3"></div>

                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.twoFactorAuth}
                      onChange={() => handleTogglePreference("twoFactorAuth")}
                    />
                  </div>

                  <div className="divider my-3"></div>

                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">
                        Save Payment Information
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Securely store payment methods for faster checkout
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.savePaymentInfo}
                      onChange={() => handleTogglePreference("savePaymentInfo")}
                    />
                  </div>

                  <div className="divider my-3"></div>

                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">Dark Mode</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Switch to dark theme
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.darkMode}
                      onChange={() => handleTogglePreference("darkMode")}
                    />
                  </div>

                  <div className="divider my-3"></div>

                  <div className="flex items-center justify-between p-2">
                    <div>
                      <h3 className="font-medium text-base">Auto Login</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Stay logged in on this device
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-accent toggle-lg"
                      checked={preferences.autoLogin}
                      onChange={() => handleTogglePreference("autoLogin")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-6">Account Management</h3>
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors w-full text-left"
                  >
                    <span>Personal Information</span>
                  </Link>
                  <Link
                    to="/profile/addresses"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors w-full text-left"
                  >
                    <span>Addresses</span>
                  </Link>
                  <Link
                    to="/profile/payment-methods"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors w-full text-left"
                  >
                    <span>Payment Methods</span>
                  </Link>
                  <Link
                    to="/profile/settings"
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 text-accent font-medium transition-colors w-full text-left"
                  >
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="divider my-6"></div>

                <button className="w-full btn btn-outline btn-error mt-4">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;

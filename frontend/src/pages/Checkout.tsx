import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Address } from "../types/address";
import { PaymentMethod } from "../types/paymentMethod";
import { addressService } from "../services/addressService";
import { paymentMethodService } from "../services/paymentMethodService";
import {
  settingsService,
  ShippingMethod,
  PaymentGateway,
} from "../services/settingsService";
import ToastContainer, { ToastData } from "../components/ui/ToastContainer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

type CheckoutStep = "address" | "shipping" | "payment" | "review";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(
    null
  );
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState<ShippingMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addressOption, setAddressOption] = useState<"existing" | "new">(
    "existing"
  );
  const [shippingAddress, setShippingAddress] = useState<Omit<Address, "_id">>({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [cardOption, setCardOption] = useState<"existing" | "new">("existing");
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [isCardTouched, setIsCardTouched] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"success" | "error" | null>(
    null
  );
  const [orderMessage, setOrderMessage] = useState<string>("");

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const loadData = async () => {
    try {
      const [
        addressesData,
        paymentMethodsData,
        shippingMethodsData,
        paymentGatewaysData,
      ] = await Promise.all([
        addressService.getAll(),
        paymentMethodService.getAll(),
        settingsService.getShippingMethods(),
        settingsService.getPaymentGateways(),
      ]);

      console.log(paymentGatewaysData);

      setAddresses(addressesData);
      setPaymentMethods(paymentMethodsData);
      setShippingMethods(shippingMethodsData);
      setPaymentGateways(paymentGatewaysData);

      // Set default selections
      const defaultAddress = addressesData.find((addr) => addr.isDefault);
      const defaultPayment = paymentMethodsData.find((pm) => pm.isDefault);
      const defaultGateway = paymentGatewaysData.find((pg) => pg.isDefault);
      const defaultShipping =
        shippingMethodsData.find((sm) => sm.isDefault) ||
        shippingMethodsData[0];

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setAddressOption("existing");
      }
      if (defaultPayment) {
        setSelectedPayment(defaultPayment._id);
      }
      if (defaultGateway) {
        setSelectedGateway(defaultGateway);
      }
      if (defaultShipping) {
        setSelectedShipping(defaultShipping._id);
        setSelectedDeliveryMethod(defaultShipping);
      }
    } catch (error) {
      showToast("error", "Failed to load checkout data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (
      currentStep === "shipping" &&
      shippingMethods.length > 0 &&
      !selectedShipping
    ) {
      const defaultShipping =
        shippingMethods.find((sm) => sm.isDefault) || shippingMethods[0];
      setSelectedShipping(defaultShipping._id);
      setSelectedDeliveryMethod(defaultShipping);
    }
  }, [currentStep, shippingMethods, selectedShipping]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!shippingAddress.name.trim()) {
      errors.name = "Name is required";
    }

    if (!shippingAddress.street.trim()) {
      errors.street = "Street address is required";
    }

    if (!shippingAddress.city.trim()) {
      errors.city = "City is required";
    }

    if (!shippingAddress.state.trim()) {
      errors.state = "State is required";
    }

    if (!shippingAddress.zipCode.trim()) {
      errors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) {
      errors.zipCode = "Please enter a valid ZIP code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof typeof shippingAddress,
    value: string
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (isFormTouched) {
      validateForm();
    }
  };

  const handleBlur = () => {
    setIsFormTouched(true);
    validateForm();
  };

  const handleNextStep = () => {
    if (addressOption === "new") {
      setIsFormTouched(true);
      if (!validateForm()) {
        return;
      }
    }
    switch (currentStep) {
      case "address":
        if (addressOption === "existing" && !selectedAddress) {
          showToast("error", "Please select a delivery address");
          return;
        }
        setCurrentStep("shipping");
        break;
      case "shipping":
        if (!selectedShipping) {
          showToast("error", "Please select a shipping method");
          return;
        }
        setCurrentStep("payment");
        break;
      case "payment":
        if (!selectedPayment) {
          showToast("error", "Please select a payment method");
          return;
        }
        setCurrentStep("review");
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case "shipping":
        setCurrentStep("address");
        break;
      case "payment":
        setCurrentStep("shipping");
        break;
      case "review":
        setCurrentStep("payment");
        break;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedGateway) {
        throw new Error("No payment gateway selected");
      }

      const orderData = {
        customer: {
          _id: user?.id || "",
        },
        items: cart.map((item) => ({
          product: { _id: item.id },
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: selectedAddress
          ? {
              ...selectedAddress,
            }
          : {
              _id: "new-address",
              ...shippingAddress,
            },
        payment: {
          method: selectedGateway.name as
            | "Credit Card"
            | "Paypal"
            | "Bank Transfer",
          status: "pending" as const,
          amount:
            cart.reduce(
              (total, item) => total + item.price * item.quantity,
              0
            ) + (selectedDeliveryMethod?.price || 0),
        },
        totalAmount: cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        shippingCost: selectedDeliveryMethod?.price || 0,
        tax: 0,
        status: "pending" as const,
      };

      await orderService.createOrder(orderData);
      setOrderStatus("success");
      setOrderMessage("Order placed successfully!");
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderStatus("error");
      setOrderMessage("Failed to place order. Please try again.");
    }
  };

  // Add validation for card form
  const validateCardForm = () => {
    const errors: Record<string, string> = {};

    if (!newCard.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(newCard.cardNumber.replace(/\s/g, ""))) {
      errors.cardNumber = "Please enter a valid card number";
    }

    if (!newCard.cardHolder.trim()) {
      errors.cardHolder = "Card holder name is required";
    }

    if (!newCard.expiryDate.trim()) {
      errors.expiryDate = "Expiry date is required";
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(newCard.expiryDate)) {
      errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
    }

    if (!newCard.cvv.trim()) {
      errors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(newCard.cvv)) {
      errors.cvv = "Please enter a valid CVV";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardInputChange = (
    field: keyof typeof newCard,
    value: string
  ) => {
    setNewCard((prev) => ({ ...prev, [field]: value }));
    if (isCardTouched) {
      validateCardForm();
    }
  };

  const handleCardBlur = () => {
    setIsCardTouched(true);
    validateCardForm();
  };

  if (orderStatus) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className={`card bg-base-100 shadow-xl border-2 ${
                orderStatus === "success" ? "border-accent" : "border-error"
              }`}
            >
              <div className="card-body items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    orderStatus === "success" ? "bg-accent/10" : "bg-error/10"
                  }`}
                >
                  {orderStatus === "success" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-error"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    orderStatus === "success" ? "text-accent" : "text-error"
                  }`}
                >
                  {orderStatus === "success"
                    ? "Order Placed Successfully!"
                    : "Order Failed"}
                </h2>
                <p className="text-base-content/80 mb-6">{orderMessage}</p>
                <div className="card-actions justify-center">
                  <button
                    onClick={() => navigate("/store")}
                    className="btn btn-accent"
                  >
                    Continue Shopping
                  </button>
                  {orderStatus === "success" && (
                    <button
                      onClick={() => navigate("/profile/orders")}
                      className="btn btn-outline btn-accent"
                    >
                      View Orders
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <button
              onClick={() => navigate("/store")}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="steps steps-horizontal w-full mb-12">
            <div
              className={`step cursor-pointer ${
                currentStep === "address" ? "step-accent" : ""
              }`}
              onClick={() => setCurrentStep("address")}
            >
              1. Address
            </div>
            <div
              className={`step cursor-pointer ${
                currentStep === "shipping" ? "step-accent" : ""
              }`}
              onClick={() => {
                if (addressOption === "existing" && !selectedAddress) {
                  showToast("error", "Please select a delivery address");
                  return;
                }
                if (addressOption === "new") {
                  setIsFormTouched(true);
                  if (!validateForm()) {
                    showToast(
                      "error",
                      "Please fill in all required address fields"
                    );
                    return;
                  }
                }
                setCurrentStep("shipping");
              }}
            >
              2. Shipping
            </div>
            <div
              className={`step cursor-pointer ${
                currentStep === "payment" ? "step-accent" : ""
              }`}
              onClick={() => {
                if (!selectedShipping) {
                  showToast("error", "Please select a shipping method");
                  return;
                }
                setCurrentStep("payment");
              }}
            >
              3. Payment
            </div>
            <div
              className={`step cursor-pointer ${
                currentStep === "review" ? "step-accent" : ""
              }`}
              onClick={() => {
                if (!selectedPayment) {
                  showToast("error", "Please select a payment method");
                  return;
                }
                setCurrentStep("review");
              }}
            >
              4. Review
            </div>
          </div>

          {/* Address Step */}
          {currentStep === "address" && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold mb-6">
                  Delivery Address
                </h2>

                {/* Address Option Selection */}
                <div className="flex gap-4 mb-6">
                  <button
                    className={`btn flex-1 ${
                      addressOption === "existing"
                        ? "btn-accent"
                        : "btn-outline"
                    }`}
                    onClick={() => setAddressOption("existing")}
                  >
                    Use Existing Address
                  </button>
                  <button
                    className={`btn flex-1 ${
                      addressOption === "new" ? "btn-accent" : "btn-outline"
                    }`}
                    onClick={() => setAddressOption("new")}
                  >
                    New Address
                  </button>
                </div>

                {addressOption === "existing" ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent ${
                          selectedAddress === address
                            ? "border-accent bg-accent/5"
                            : "border-base-200"
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">
                                {address.name}
                              </p>
                              {address.isDefault && (
                                <span className="badge badge-accent">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 text-base-content/80">
                              <p className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-accent"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {address.street}
                              </p>
                              <p className="flex items-center gap-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-accent"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                  />
                                </svg>
                                {address.city}, {address.state}{" "}
                                {address.zipCode}
                              </p>
                            </div>
                          </div>
                          {selectedAddress === address && (
                            <div className="text-accent">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                          Address Label
                        </span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          className={`input input-bordered w-full ${
                            formErrors.name ? "input-error" : ""
                          }`}
                          value={shippingAddress.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          onBlur={handleBlur}
                          placeholder="e.g. Home, Office, Vacation Home"
                        />
                        {formErrors.name && (
                          <label className="label">
                            <span className="label-text-alt text-error mt-1">
                              {formErrors.name}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Street Address
                        </span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          className={`input input-bordered w-full ${
                            formErrors.street ? "input-error" : ""
                          }`}
                          value={shippingAddress.street}
                          onChange={(e) =>
                            handleInputChange("street", e.target.value)
                          }
                          onBlur={handleBlur}
                          placeholder="e.g. Strada Victoriei nr. 10, bl. A1, sc. 2, ap. 5"
                        />
                        {formErrors.street && (
                          <label className="label">
                            <span className="label-text-alt text-error mt-1">
                              {formErrors.street}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-accent"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            City
                          </span>
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            className={`input input-bordered w-full ${
                              formErrors.city ? "input-error" : ""
                            }`}
                            value={shippingAddress.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            onBlur={handleBlur}
                            placeholder="e.g. București, Cluj-Napoca, Timișoara"
                          />
                          {formErrors.city && (
                            <label className="label">
                              <span className="label-text-alt text-error mt-1">
                                {formErrors.city}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-accent"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            County
                          </span>
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            className={`input input-bordered w-full ${
                              formErrors.state ? "input-error" : ""
                            }`}
                            value={shippingAddress.state}
                            onChange={(e) =>
                              handleInputChange("state", e.target.value)
                            }
                            onBlur={handleBlur}
                            placeholder="e.g. București, Cluj, Timiș"
                          />
                          {formErrors.state && (
                            <label className="label">
                              <span className="label-text-alt text-error mt-1">
                                {formErrors.state}
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          Postal Code
                        </span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          className={`input input-bordered w-full ${
                            formErrors.zipCode ? "input-error" : ""
                          }`}
                          value={shippingAddress.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          onBlur={handleBlur}
                          placeholder="e.g. 010101"
                          maxLength={6}
                        />
                        {formErrors.zipCode && (
                          <label className="label">
                            <span className="label-text-alt text-error mt-1">
                              {formErrors.zipCode}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Step */}
          {currentStep === "shipping" && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold mb-6">
                  Shipping Method
                </h2>
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent ${
                        selectedShipping === method._id
                          ? "border-accent bg-accent/5"
                          : "border-base-200"
                      }`}
                      onClick={() => {
                        setSelectedShipping(method._id);
                        setSelectedDeliveryMethod(method);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">{method.name}</p>
                            {method.isDefault && (
                              <span className="badge badge-accent">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-2 text-base-content/80">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-accent"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Estimated delivery: {method.estimatedDelivery}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-accent">
                            ${method.price.toFixed(2)}
                          </p>
                          {selectedShipping === method._id && (
                            <div className="text-accent">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === "payment" && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold mb-6">
                  Payment Method
                </h2>
                <div className="space-y-4">
                  {paymentGateways.map((gateway) => (
                    <div
                      key={gateway._id}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent ${
                        selectedGateway === gateway
                          ? "border-accent bg-accent/5"
                          : "border-base-200"
                      }`}
                      onClick={() => setSelectedGateway(gateway)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">{gateway.name}</p>
                            {gateway.isDefault && (
                              <span className="badge badge-accent">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedGateway === gateway && (
                          <div className="text-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show saved cards only if the selected gateway is for card payments */}
                {selectedGateway &&
                  selectedGateway.name.toLowerCase().includes("card") && (
                    <div className="mt-8">
                      <div className="flex gap-4 mb-6">
                        <button
                          className={`btn flex-1 ${
                            cardOption === "existing"
                              ? "btn-accent"
                              : "btn-outline"
                          }`}
                          onClick={() => setCardOption("existing")}
                        >
                          Use Saved Card
                        </button>
                        <button
                          className={`btn flex-1 ${
                            cardOption === "new" ? "btn-accent" : "btn-outline"
                          }`}
                          onClick={() => setCardOption("new")}
                        >
                          New Card
                        </button>
                      </div>

                      {cardOption === "existing" ? (
                        <div className="space-y-4">
                          {paymentMethods.map((method) => (
                            <div
                              key={method._id}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-accent ${
                                selectedPayment === method._id
                                  ? "border-accent bg-accent/5"
                                  : "border-base-200"
                              }`}
                              onClick={() => setSelectedPayment(method._id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg">
                                      {method.cardType}
                                    </p>
                                    {method.isDefault && (
                                      <span className="badge badge-accent">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-base-content/80">
                                    <p className="flex items-center gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-accent"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                        />
                                      </svg>
                                      **** **** **** {method.lastFour}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-accent"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      Expires: {method.expiryDate}
                                    </p>
                                  </div>
                                </div>
                                {selectedPayment === method._id && (
                                  <div className="text-accent">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-6 w-6"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-accent"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                  />
                                </svg>
                                Card Number
                              </span>
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                className={`input input-bordered w-full ${
                                  cardErrors.cardNumber ? "input-error" : ""
                                }`}
                                value={newCard.cardNumber}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    "cardNumber",
                                    e.target.value
                                  )
                                }
                                onBlur={handleCardBlur}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                              />
                              {cardErrors.cardNumber && (
                                <label className="label">
                                  <span className="label-text-alt text-error mt-1">
                                    {cardErrors.cardNumber}
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-accent"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                Card Holder Name
                              </span>
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                className={`input input-bordered w-full ${
                                  cardErrors.cardHolder ? "input-error" : ""
                                }`}
                                value={newCard.cardHolder}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    "cardHolder",
                                    e.target.value
                                  )
                                }
                                onBlur={handleCardBlur}
                                placeholder="John Doe"
                              />
                              {cardErrors.cardHolder && (
                                <label className="label">
                                  <span className="label-text-alt text-error mt-1">
                                    {cardErrors.cardHolder}
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-accent"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Expiry Date
                                </span>
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  className={`input input-bordered w-full ${
                                    cardErrors.expiryDate ? "input-error" : ""
                                  }`}
                                  value={newCard.expiryDate}
                                  onChange={(e) =>
                                    handleCardInputChange(
                                      "expiryDate",
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleCardBlur}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                />
                                {cardErrors.expiryDate && (
                                  <label className="label">
                                    <span className="label-text-alt text-error mt-1">
                                      {cardErrors.expiryDate}
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>

                            <div className="form-control">
                              <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2 text-base-content/80">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-accent"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                  CVV
                                </span>
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  className={`input input-bordered w-full ${
                                    cardErrors.cvv ? "input-error" : ""
                                  }`}
                                  value={newCard.cvv}
                                  onChange={(e) =>
                                    handleCardInputChange("cvv", e.target.value)
                                  }
                                  onBlur={handleCardBlur}
                                  placeholder="123"
                                  maxLength={4}
                                />
                                {cardErrors.cvv && (
                                  <label className="label">
                                    <span className="label-text-alt text-error mt-1">
                                      {cardErrors.cvv}
                                    </span>
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === "review" && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold mb-6">
                  Order Summary
                </h2>
                <div className="space-y-8">
                  {/* Order Items */}
                  <div className="border-b pb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 bg-base-200 rounded-lg"
                        >
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-base-content/80">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-base-content/80">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="border-b pb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Delivery Address
                    </h3>
                    {addressOption === "existing" &&
                    addresses.find((a) => a._id === selectedAddress?._id) ? (
                      <div className="p-4 bg-base-200 rounded-lg">
                        <p className="font-semibold">
                          {
                            addresses.find(
                              (a) => a._id === selectedAddress?._id
                            )?.name
                          }
                        </p>
                        <p className="text-base-content/80">
                          {
                            addresses.find(
                              (a) => a._id === selectedAddress?._id
                            )?.street
                          }
                        </p>
                        <p className="text-base-content/80">
                          {
                            addresses.find(
                              (a) => a._id === selectedAddress?._id
                            )?.city
                          }
                          ,{" "}
                          {
                            addresses.find(
                              (a) => a._id === selectedAddress?._id
                            )?.state
                          }{" "}
                          {
                            addresses.find(
                              (a) => a._id === selectedAddress?._id
                            )?.zipCode
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-base-200 rounded-lg">
                        <p className="font-semibold">{shippingAddress.name}</p>
                        <p className="text-base-content/80">
                          {shippingAddress.street}
                        </p>
                        <p className="text-base-content/80">
                          {shippingAddress.city}, {shippingAddress.state}{" "}
                          {shippingAddress.zipCode}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Method */}
                  <div className="border-b pb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Shipping Method
                    </h3>
                    {shippingMethods.find(
                      (s) => s._id === selectedShipping
                    ) && (
                      <div className="p-4 bg-base-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              {
                                shippingMethods.find(
                                  (s) => s._id === selectedShipping
                                )?.name
                              }
                            </p>
                            <p className="text-base-content/80">
                              Estimated delivery:{" "}
                              {
                                shippingMethods.find(
                                  (s) => s._id === selectedShipping
                                )?.estimatedDelivery
                              }
                            </p>
                          </div>
                          <p className="font-semibold text-accent">
                            $
                            {shippingMethods
                              .find((s) => s._id === selectedShipping)
                              ?.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="border-b pb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Payment Method
                    </h3>
                    {selectedGateway &&
                      paymentGateways.find(
                        (pg) => pg._id === selectedGateway._id
                      ) && (
                        <div className="p-4 bg-base-200 rounded-lg">
                          <p className="font-semibold">
                            {
                              paymentGateways.find(
                                (pg) => pg._id === selectedGateway._id
                              )?.name
                            }
                          </p>
                          {cardOption === "existing" &&
                            paymentMethods.find(
                              (p) => p._id === selectedPayment
                            ) && (
                              <div className="mt-2 text-base-content/80">
                                <p>
                                  **** **** ****{" "}
                                  {
                                    paymentMethods.find(
                                      (p) => p._id === selectedPayment
                                    )?.lastFour
                                  }
                                </p>
                                <p>
                                  Expires:{" "}
                                  {
                                    paymentMethods.find(
                                      (p) => p._id === selectedPayment
                                    )?.expiryDate
                                  }
                                </p>
                              </div>
                            )}
                        </div>
                      )}
                  </div>

                  {/* Order Total */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Order Total
                    </h3>
                    <div className="space-y-2 text-base-content/80">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          $
                          {shippingMethods
                            .find((s) => s._id === selectedShipping)
                            ?.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg text-accent">
                          <span>Total</span>
                          <span>
                            $
                            {(
                              totalPrice +
                              (shippingMethods.find(
                                (s) => s._id === selectedShipping
                              )?.price || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep !== "address" && (
              <button
                className="btn btn-outline btn-accent"
                onClick={handlePreviousStep}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
            )}
            {currentStep !== "review" ? (
              <button
                className="btn btn-accent ml-auto"
                onClick={handleNextStep}
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <button
                className="btn btn-accent ml-auto"
                onClick={handlePlaceOrder}
              >
                Place Order
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

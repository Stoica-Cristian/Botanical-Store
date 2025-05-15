import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SignupData } from "../services/api";
import { FaArrowLeft } from "react-icons/fa";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        return !value.trim() ? "First Name is required" : "";
      case "lastName":
        return !value.trim() ? "Last Name is required" : "";
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return "Email is required";
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      firstName: validateField("firstName", formData.firstName),
      lastName: validateField("lastName", formData.lastName),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField(
        "confirmPassword",
        formData.confirmPassword
      ),
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      const signupData: SignupData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      await signup(signupData);
      navigate("/");
    } catch (err: any) {
      console.error("Signup failed:", err);
      if (err.response?.data) {
        setErrors((prev) => ({ ...prev, email: err.response.data }));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(255, 255, 255, 0.9) inset !important;
            -webkit-text-fill-color: black !important;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .shake {
            animation: shake 0.3s ease-in-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1536762131871-17373957273e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIxfHx8ZW58MHx8fHx8)`,
          filter: "blur(7px)",
          scale: "1.02",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-6 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors duration-200 text-gray-600 hover:text-gray-900 z-100"
        aria-label="Go back"
      >
        <FaArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-accent hover:text-accent/80 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name*
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`w-full px-4 py-3 border ${
                      errors.firstName && touched.firstName
                        ? "border-red-500"
                        : "border-gray-300 hover:border-accent/50"
                    } rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:!text-black`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="mt-1 text-sm text-red-500 fade-in">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name*
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`w-full px-4 py-3 border ${
                      errors.lastName && touched.lastName
                        ? "border-red-500"
                        : "border-gray-300 hover:border-accent/50"
                    } rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:!text-black`}
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="mt-1 text-sm text-red-500 fade-in">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 border ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300 hover:border-accent/50"
                  } rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:!text-black`}
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-500 fade-in">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password*
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`w-full px-4 py-3 border pr-10 ${
                      errors.password && touched.password
                        ? "border-red-500"
                        : "border-gray-300 hover:border-accent/50"
                    } rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:!text-black`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-accent transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-500 fade-in">
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password*
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`w-full px-4 py-3 border pr-10 ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300 hover:border-accent/50"
                    } rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:!text-black`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-accent transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 fade-in">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${
                  Object.values(errors).some((error) => error) ? "shake" : ""
                }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

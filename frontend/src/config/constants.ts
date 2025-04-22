// API configuration
export const API_BASE_URL = "http://localhost:5000/api";

// Other application constants
export const APP_NAME = "Plant Store";
export const ITEMS_PER_PAGE = 12;
export const DEFAULT_CURRENCY = "RON";
export const DEFAULT_LOCALE = "ro-RO";

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "plant_store_auth_token",
  CART: "plant_store_cart",
  USER_PREFERENCES: "plant_store_user_prefs",
};

// Routes
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAILS: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  ADMIN: {
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    USERS: "/admin/users",
  },
}; 
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, SignupData } from "../services/api";
import { userService } from "../services/userService";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthState = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const userData = await userService.getProfile();
          setUser({
            id: userData._id,
            _id: userData._id,
            email: userData.email,
            role: userData.role || "user",
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
            phoneNumber: userData.phoneNumber,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            wishlist: userData.wishlist || [],
          });
        } catch (err) {
          localStorage.removeItem("token");
        }
      }

      setLoading(false);
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.token);

      try {
        const userData = await userService.getProfile();

        const userObj = {
          id: userData._id,
          _id: userData._id,
          email: userData.email,
          role: userData.role || "user",
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          phoneNumber: userData.phoneNumber,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          wishlist: userData.wishlist || [],
        };

        setUser(userObj);
      } catch (profileErr) {
        setError("Could not fetch user profile");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err.response?.status === 403) {
        setError("Account is inactive. Please contact support.");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      await authService.signup(data);
      await login(data.email, data.password);
    } catch (err) {
      setError("Registration failed");
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

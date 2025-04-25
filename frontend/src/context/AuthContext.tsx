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
            email: userData.email,
            role: userData.role || "user",
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
            phoneNumber: userData.phoneNumber,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
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
          email: userData.email,
          role: userData.role || "user",
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          phoneNumber: userData.phoneNumber,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        };

        setUser(userObj);
      } catch (profileErr) {
        setError("Could not fetch user profile");
      }
    } catch (err) {
      setError("Invalid email or password");
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

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

import api from "./api";
import { User } from "../types/user";

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  status: string;
  password?: string;
}

interface UpdateProfileData {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  password?: string;
}

// User functions
export const userService = {
  getProfile: async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },

  updateProfile: async (userData: UpdateProfileData) => {
    const response = await api.put("/api/users/profile", userData);
    return response;
  },

  getUserStats: async () => {
    const response = await api.get("/api/users/stats");
    return response.data;
  },

  // Admin functions
  getUsers: async (adminId: string) => {
    try {
      // Only add admin header if we have a valid adminId
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.get("/api/users", config);
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { data: [] };
    }
  },

  createUser: async (userData: CreateUserData, adminId: string = "") => {
    try {
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.post("/api/users", userData, config);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  deleteUser: async (id: string, adminId: string = "") => {
    try {
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.delete(`/api/users/${id}`, config);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  updateUser: async (user: User, adminId: string = "") => {
    try {
      const config = adminId ? {
        headers: {
          "X-Admin-Id": adminId,
        },
      } : undefined;
      
      const response = await api.put(`/api/users/${user.id}`, user, config);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};

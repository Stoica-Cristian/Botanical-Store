import api from "./api";
import { User } from "../types/user";

// User functions
export const userService = {
  getProfile: async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
  },

  updateProfile: async (user: User) => {
    const response = await api.put("/api/users/profile", user);
    return response.data;
  },

  // Admin functions
  getUsers: async (adminId: string) => {
    try {
      const response = await api.get("/api/users", {
        headers: {
          "X-Admin-Id": adminId,
        },
      });

      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { data: [] };
    }
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  updateUser: async (user: User) => {
    const response = await api.put(`/api/users/${user.id}`, user);
    return response.data;
  },
};

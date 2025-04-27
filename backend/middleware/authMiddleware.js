import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
  logger.info("Checking admin privileges");

  const adminId = req.headers["x-admin-id"];
  if (!adminId) {
    logger.error("No admin ID provided in request");
    return res.status(401).json({ message: "No admin ID provided" });
  }
  try {
    const user = await User.findById(adminId);
    if (!user) {
      logger.error(`User not found with ID: ${adminId}`);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      logger.error(`User is not an admin: ${user.email}`);
      return res.status(403).json({ message: "Admin access required" });
    }

    logger.info(`Admin access granted for: ${user.email}`);
    next();
  } catch (err) {
    logger.error(`Error verifying admin ID: ${err.message}`);
    return res.status(403).json({ message: "Invalid admin ID" });
  }
};

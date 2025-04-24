import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

// Middleware to authenticate users
export const isAuthenticated = async (req, res, next) => {
  logger.info("Verifying user authentication");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.error("No token provided in request");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user and attach to the request
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.error(`User not found with ID: ${decoded.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.id;

    logger.info(
      `User authenticated: ${user.email} (${user.firstName} ${user.lastName})`
    );
    next();
  } catch (err) {
    logger.error(`Token verification error: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

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

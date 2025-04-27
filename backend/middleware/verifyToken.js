import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ Token lipsă în cerere");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = decoded.id;

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log(`❌ Utilizator negăsit pentru ID: ${decoded.id}`);
      return res.status(401).json({ message: "User not found" });
    }

    req.userRole = user.role || "user";
    next();
  } catch (err) {
    console.error(`❌ Eroare la verificarea token-ului: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;

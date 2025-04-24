import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

const verifyToken = async (req, res, next) => {
  console.log("🔒 Verificare token de autentificare");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("❌ Token lipsă în cerere");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Adăugăm id-ul utilizatorului în obiectul request pentru a fi utilizat în rutele protejate
    req.userId = decoded.id;

    // Obținem rolul utilizatorului din baza de date
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log(`❌ Utilizator negăsit pentru ID: ${decoded.id}`);
      return res.status(401).json({ message: "User not found" });
    }

    req.userRole = user.role || "user";
    console.log(
      `✅ Token valid pentru utilizatorul cu ID: ${decoded.id}, rol: ${req.userRole}`
    );
    next();
  } catch (err) {
    console.error(`❌ Eroare la verificarea token-ului: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;

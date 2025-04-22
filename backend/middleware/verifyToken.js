import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = (req, res, next) => {
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
    console.log(`✅ Token valid pentru utilizatorul cu ID: ${decoded.id}`);
    next();
  } catch (err) {
    console.error(`❌ Eroare la verificarea token-ului: ${err.message}`);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;

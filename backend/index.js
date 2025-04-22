import express from "express";
import mongoose from "mongoose";
import usersRoute from "./routes/usersRoute.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import verifyToken from "./middleware/verifyToken.js";

dotenv.config();

const PORT = process.env.PORT || 5555;
const MONGO_URI =
  "mongodb+srv://cristian:yCQRGY49q622yKW@project.gvgwv.mongodb.net/?retryWrites=true&w=majority&appName=Project";

const app = express();

app.use(express.json());
app.use(cors());

// Middleware de logging pentru toate cererile
app.use((req, res, next) => {
  console.log(
    `📨 ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
  );
  next();
});

app.get("/", (req, res) => {
  console.log("🏠 RUTA: / - Pagină principală");
  res.send("API Server is running!");
});

// API routes with /api prefix
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoute);
app.use("/api/products", productRoutes);

// Keep old routes for backward compatibility
app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoute);
app.use("/products", productRoutes);

// Handler pentru rute inexistente
app.use((req, res) => {
  console.log(`⚠️ Rută inexistentă: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("🌐 Conectat la MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`❌ Eroare la conectarea la MongoDB: ${err.message}`);
  });

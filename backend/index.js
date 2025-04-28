import express from "express";
import mongoose from "mongoose";

import usersRoute from "./routes/usersRoute.js";
import authRoutes from "./routes/authRoutes.js";
import productsRoute from "./routes/productsRoute.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import paymentMethodRoutes from "./routes/paymentMethodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5555;
const MONGO_URI = process.env.MONGO_URI;
const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log("=====================================================");
  console.log(
    `📨 ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
  );
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoute);
app.use("/api/products", productsRoute);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

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

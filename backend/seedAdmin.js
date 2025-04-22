import mongoose from "mongoose";
import User from "./models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://cristian:yCQRGY49q622yKW@project.gvgwv.mongodb.net/?retryWrites=true&w=majority&appName=Project";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: "admin@example.com",
      password: "admin123", // Will be hashed by the pre-save hook
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully!");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

seedAdmin();

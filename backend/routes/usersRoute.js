import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import Order from "../models/orderModel.js";
import PaymentMethod from "../models/PaymentMethod.js";

const router = express.Router();
router.use(verifyToken);

// User routes
router.get("/profile", async (req, res) => {
  console.log("👤 RUTA: /users/profile - Obținere profil utilizator");
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      console.log(`❌ Profil negăsit: ID=${req.user._id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profil obținut cu succes: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    console.log(`❌ Eroare la obținerea profilului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/profile", async (req, res) => {
  console.log("🔄 RUTA: /users/profile (PUT) - Actualizare profil utilizator");
  try {
    const updates = {};

    if (req.body.email) updates.email = req.body.email;
    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;
    if (req.body.avatar) updates.avatar = req.body.avatar;
    if (req.body.phoneNumber) updates.phoneNumber = req.body.phoneNumber;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      select: "-password",
    });

    if (!user) {
      console.log(
        `❌ Utilizator negăsit pentru actualizare: ID=${req.user._id}`
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profil actualizat cu succes: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    console.log(`❌ Eroare la actualizarea profilului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/stats", async (req, res) => {
  console.log("📊 RUTA: /users/stats - Obținere statistici utilizator");
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log(
        `❌ Utilizator negăsit pentru statistici: ID=${req.user._id}`
      );
      return res.status(404).json({ message: "User not found" });
    }

    // Get order count
    const orderCount = await Order.countDocuments({ customer: user._id });

    // Get saved cards count
    const savedCardsCount = await PaymentMethod.countDocuments({
      user: user._id,
    });

    // Calculate user stats according to the frontend interface
    const stats = {
      orders: orderCount,
      wishlist: user.wishlist?.length || 0,
      savedCards: savedCardsCount,
    };

    console.log(`✅ Statistici obținute cu succes pentru: ${user.email}`);
    res.status(200).json(stats);
  } catch (error) {
    console.log(`❌ Eroare la obținerea statisticilor: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/password", async (req, res) => {
  console.log("🔐 RUTA: /users/password - Actualizare parolă utilizator");
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current password and new password are required",
      });
    }

    const user = await User.findById(req.user._id);
    console.log("req.user._id", req.user._id);
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    console.log(`✅ Parolă actualizată cu succes pentru: ${user.email}`);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(`❌ Eroare la actualizarea parolei: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/profile", async (req, res) => {
  console.log(
    "🗑️ RUTA: /users/profile (DELETE) - Ștergere profil utilizator curent"
  );
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);

    if (!deletedUser) {
      console.log(`❌ Utilizatorul cu ID-ul ${req.user._id} nu a fost găsit`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      `✅ Utilizatorul cu ID-ul ${req.user._id} a fost șters cu succes`
    );
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(`❌ Eroare la ștergerea utilizatorului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Admin routes
router.get("/", isAdmin, async (req, res) => {
  console.log("👥 RUTA: /users - Listare utilizatori");
  try {
    const users = await User.find({}, { password: 0 });
    console.log(`✅ Număr utilizatori returnați: ${users.length}`);
    res.status(200).json(users);
  } catch (error) {
    console.log(`❌ Eroare la listarea utilizatorilor: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/", isAdmin, async (req, res) => {
  console.log("➕ RUTA: /users (POST) - Creare utilizator");
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || "user",
    });

    await user.save();

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log(`✅ Utilizator creat cu succes: ${user.email}`);
    res.status(201).json(userResponse);
  } catch (error) {
    console.log(`❌ Eroare la crearea utilizatorului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  console.log(
    `✏️ RUTA: /users/${req.params.id} (PUT) - Actualizare utilizator`
  );
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      console.log(`❌ Utilizatorul cu ID-ul ${id} nu a fost găsit`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Utilizator actualizat cu succes: ${updatedUser.email}`);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(`❌ Eroare la actualizarea utilizatorului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:id", isAdmin, async (req, res) => {
  console.log(
    `🗑️ RUTA: /users/${req.params.id} (DELETE) - Ștergere utilizator`
  );
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      console.log(`❌ Utilizatorul cu ID-ul ${id} nu a fost găsit`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Utilizatorul cu ID-ul ${id} a fost șters cu succes`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(`❌ Eroare la ștergerea utilizatorului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;

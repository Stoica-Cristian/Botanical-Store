import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Obține toți utilizatorii (doar admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
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

// Creare utilizator (doar admin)
router.post("/", verifyToken, isAdmin, async (req, res) => {
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

// Actualizează un utilizator după ID (doar admin)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
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

// Ruta pentru profilul utilizatorului autentificat
router.get("/profile", verifyToken, async (req, res) => {
  console.log("👤 RUTA: /users/profile - Obținere profil utilizator");
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      console.log(`❌ Profil negăsit: ID=${req.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profil obținut cu succes: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    console.log(`❌ Eroare la obținerea profilului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Actualizare profil utilizator
router.put("/profile", verifyToken, async (req, res) => {
  console.log("🔄 RUTA: /users/profile (PUT) - Actualizare profil utilizator");
  try {
    const updates = {};

    if (req.body.email) updates.email = req.body.email;
    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      select: "-password",
    });

    if (!user) {
      console.log(`❌ Utilizator negăsit pentru actualizare: ID=${req.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profil actualizat cu succes: ${user.email}`);
    res.status(200).json(user);
  } catch (error) {
    console.log(`❌ Eroare la actualizarea profilului: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
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

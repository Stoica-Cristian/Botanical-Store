import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Obține profilul utilizatorului logat
router.get("/profile", verifyToken, async (req, res) => {
  console.log("👤 RUTA: /users/profile - Obținere profil utilizator");
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      console.log(`❌ Profil negăsit: ID=${req.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User role from database: "${user.role || "user"}"`);

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log(
      `✅ Profil obținut cu succes: ${user.email} (Role: ${userResponse.role})`
    );
    res.status(200).json(userResponse);
  } catch (error) {
    console.log(`❌ Eroare la obținerea profilului: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

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

    console.log(`📝 Câmpuri actualizate: ${Object.keys(updates).join(", ")}`);

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    if (!user) {
      console.log(`❌ Utilizator negăsit pentru actualizare: ID=${req.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log(`✅ Profil actualizat cu succes: ${user.email}`);
    res.status(200).json(userResponse);
  } catch (error) {
    console.log(`❌ Eroare la actualizarea profilului: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

// Creare utilizator
router.post("/", async (req, res) => {
  console.log("➕ RUTA: /users (POST) - Creare utilizator");
  try {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
      return res.status(400).send("Email and Password are required");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userData = {
      email: req.body.email,
      password: hashedPassword,
    };

    // Adăugăm firstName și lastName dacă sunt furnizate
    if (req.body.firstName) userData.firstName = req.body.firstName;
    if (req.body.lastName) userData.lastName = req.body.lastName;

    const user = new User(userData);
    await user.save();

    console.log(`✅ Utilizator creat cu succes: ${user.email}`);
    // Returnăm utilizatorul fără parolă
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    res.status(201).json(userResponse);
  } catch (error) {
    console.log(`❌ Eroare la crearea utilizatorului: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

// Obține toți utilizatorii
router.get("/", async (req, res) => {
  console.log("👥 RUTA: /users - Listare utilizatori");
  try {
    const users = await User.find({}, { password: 0 }); // Excludem parola din rezultate
    console.log(`✅ Număr utilizatori returnați: ${users.length}`);
    res.status(200).json(users);
  } catch (error) {
    console.log(`❌ Eroare la listarea utilizatorilor: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

export default router;

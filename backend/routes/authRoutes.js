import express from "express";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Rută pentru înregistrare
router.post("/signup", async (req, res) => {
  console.log("🔑 RUTA: /signup - Încercare de înregistrare nou utilizator");
  try {
    console.log(req.body);
    if (
      !req.body.email ||
      !req.body.password ||
      !req.body.firstName ||
      !req.body.lastName
    ) {
      return res
        .status(400)
        .send("Email, Password, First Name and Last Name are required");
    }

    const user = new User({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    await user.save();

    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "user",
    };

    console.log(
      `✅ Utilizator înregistrat cu succes: ${user.email} (${user.firstName} ${user.lastName})`
    );
    res.status(201).json(userResponse);
  } catch (error) {
    console.log(`❌ Eroare la înregistrare: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

// Rută pentru autentificare
router.post("/login", async (req, res) => {
  console.log("🔑 RUTA: /login - Încercare de autentificare");
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log(`❌ Autentificare eșuată: Email invalid - ${email}`);
      return res.status(401).send("Invalid Email or Password");
    }

    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET);
      console.log(`✅ Autentificare reușită: ${user.email}`);
      res.status(200).json({ token: token });
    } else {
      console.log(`❌ Autentificare eșuată: Parolă invalidă pentru ${email}`);
      res.status(401).send("Invalid Email or Password");
    }
  } catch (error) {
    console.log(`❌ Eroare la autentificare: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

export default router;

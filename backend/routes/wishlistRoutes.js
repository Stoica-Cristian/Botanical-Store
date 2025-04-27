import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import User from "../models/userModel.js";

const router = express.Router();
router.use(verifyToken);

// Get user's wishlist
router.get("/", async (req, res) => {
  try {
    console.log(
      `📥 RUTA: /wishlist - Obținere wishlist pentru user ${req.user._id}`
    );

    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select:
        "_id name price images rating reviewsCount description stock scientificName category specifications features careInfo createdAt updatedAt reviews",
    });

    if (!user) {
      console.log(`❌ Utilizatorul cu ID ${req.user._id} nu a fost găsit`);
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure wishlist is an array
    const wishlist = user.wishlist || [];
    console.log(
      `✅ Wishlist obținut cu succes. Număr produse: ${wishlist.length}`
    );
    res.json(wishlist);
  } catch (error) {
    console.error("❌ Eroare la obținerea wishlist-ului:", error);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
});

// Add product to wishlist
router.post("/:productId", async (req, res) => {
  try {
    console.log(
      `➕ RUTA: /wishlist/${req.params.productId} - Adăugare produs în wishlist`
    );
    const user = await User.findById(req.user._id);

    // Check if product is already in wishlist
    if (user.wishlist.includes(req.params.productId)) {
      console.log(
        `⚠️ Produsul ${req.params.productId} există deja în wishlist`
      );
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    console.log(
      `✅ Produs adăugat cu succes în wishlist. Wishlist size: ${user.wishlist.length}`
    );
    res.json({ message: "Product added to wishlist" });
  } catch (error) {
    console.error("❌ Eroare la adăugarea în wishlist:", error);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
});

// Remove product from wishlist
router.delete("/:productId", async (req, res) => {
  try {
    console.log(
      `🗑️ RUTA: /wishlist/${req.params.productId} - Ștergere produs din wishlist`
    );
    const user = await User.findById(req.user._id);

    // Check if product is in wishlist
    if (!user.wishlist.includes(req.params.productId)) {
      console.log(`⚠️ Produsul ${req.params.productId} nu există în wishlist`);
      return res.status(400).json({ message: "Product not in wishlist" });
    }

    const oldLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      (productId) => productId.toString() !== req.params.productId
    );
    await user.save();

    console.log(
      `✅ Produs șters cu succes din wishlist. Produse rămase: ${user.wishlist.length}`
    );
    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("❌ Eroare la ștergerea din wishlist:", error);
    res.status(500).json({ message: "Error removing from wishlist" });
  }
});

// Check if product is in wishlist
router.get("/check/:productId", async (req, res) => {
  try {
    console.log(
      `🔍 RUTA: /wishlist/check/${req.params.productId} - Verificare produs în wishlist`
    );
    const user = await User.findById(req.user._id);
    const isInWishlist = user.wishlist.includes(req.params.productId);
    console.log(
      `✅ Verificare completă. Produs ${
        isInWishlist ? "găsit" : "negăsit"
      } în wishlist`
    );
    res.json({ isInWishlist });
  } catch (error) {
    console.error("❌ Eroare la verificarea wishlist-ului:", error);
    res.status(500).json({ message: "Error checking wishlist" });
  }
});

export default router;

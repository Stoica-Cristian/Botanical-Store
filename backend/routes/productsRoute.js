import express from "express";
import Product from "../models/productModel.js";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  console.log("🌿 RUTA: /products - Listare produse");
  try {
    const products = await Product.find({});
    console.log(`✅ Număr produse returnate: ${products.length}`);
    res.status(200).json(products);
  } catch (error) {
    console.log(`❌ Eroare la listarea produselor: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  console.log(
    `🌿 RUTA: /products/category/${req.params.category} - Produse după categorie`
  );
  try {
    const products = await Product.find({ category: req.params.category });

    console.log(
      `✅ Număr produse returnate pentru categoria ${req.params.category}: ${products.length}`
    );
    res.status(200).json(products);
  } catch (error) {
    console.log(
      `❌ Eroare la listarea produselor după categorie: ${error.message}`
    );
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  console.log(`🌿 RUTA: /products/${req.params.id} - Detalii produs`);
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log(`❌ Produs negăsit: ID=${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`✅ Produs găsit: ${product.name}`);
    res.status(200).json(product);
  } catch (error) {
    console.log(`❌ Eroare la obținerea produsului: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Create product (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  console.log("➕ RUTA: /products (POST) - Creare produs");
  try {
    // Check if user is admin
    if (req.userRole !== "admin") {
      console.log(`❌ Acces interzis: Utilizatorul nu este admin`);
      return res.status(403).json({ message: "Access denied" });
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      scientificName: req.body.scientificName,
      category: req.body.category,
      images: req.body.images,
      specifications: req.body.specifications,
      features: req.body.features,
      careInfo: req.body.careInfo,
      sizes: req.body.sizes,
      potStyles: req.body.potStyles,
    };

    const product = new Product(productData);
    await product.save();

    console.log(`✅ Produs creat cu succes: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    console.log(`❌ Eroare la crearea produsului: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Update product (admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  console.log(`🔄 RUTA: /products/${req.params.id} (PUT) - Actualizare produs`);
  try {
    // Check if user is admin
    if (req.userRole !== "admin") {
      console.log(`❌ Acces interzis: Utilizatorul nu este admin`);
      return res.status(403).json({ message: "Access denied" });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) {
      console.log(`❌ Produs negăsit pentru actualizare: ID=${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`✅ Produs actualizat cu succes: ${product.name}`);
    res.status(200).json(product);
  } catch (error) {
    console.log(`❌ Eroare la actualizarea produsului: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  console.log(`❌ RUTA: /products/${req.params.id} (DELETE) - Ștergere produs`);
  try {
    // Check if user is admin
    if (req.userRole !== "admin") {
      console.log(`❌ Acces interzis: Utilizatorul nu este admin`);
      return res.status(403).json({ message: "Access denied" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      console.log(`❌ Produs negăsit pentru ștergere: ID=${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`✅ Produs șters cu succes: ${product.name}`);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(`❌ Eroare la ștergerea produsului: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a review to product
router.post("/:id/reviews", verifyToken, async (req, res) => {
  console.log(
    `➕ RUTA: /products/${req.params.id}/reviews - Adăugare recenzie`
  );
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log(`❌ Produs negăsit: ID=${req.params.id}`);
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      author: req.body.author,
      rating: req.body.rating,
      comment: req.body.comment,
      verified: true,
    };

    product.reviews.push(review);

    // Update product rating
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = totalRating / product.reviews.length;
    product.reviewsCount = product.reviews.length;

    await product.save();

    console.log(`✅ Recenzie adăugată cu succes pentru: ${product.name}`);
    res.status(201).json(product);
  } catch (error) {
    console.log(`❌ Eroare la adăugarea recenziei: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

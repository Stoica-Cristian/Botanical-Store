import express from "express";
import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import Category from "../models/categoryModel.js";
import Tag from "../models/tagModel.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// GET /api/products - Get all products
router.get("/", async (req, res) => {
  try {
    // Optionally get limit parameter (to limit the amount of data returned)
    const limit = parseInt(req.query.limit) || 0;

    // Default sorting by creation date, descending (newest first)
    const sort = { createdAt: -1 };

    // Execute simple query
    const query = Product.find().sort(sort);

    // Apply limit only if specified
    if (limit > 0) {
      query.limit(limit);
    }

    const products = await query.exec();

    logger.info(`Products retrieved successfully: ${products.length} products`);
    res.json(products);
  } catch (error) {
    logger.error(`Error retrieving products: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
});

// POST /api/products/seed - Seed database with test products
router.post("/seed", isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Clear existing data
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});

    // Create brands
    const greenThumbBrand = await Brand.create({
      name: "GreenThumb",
      description: "Quality plants and accessories for your home",
      logo: "https://placehold.co/200x100?text=GreenThumb",
    });

    const terraBrand = await Brand.create({
      name: "Terra",
      description: "Premium pottery and plant containers",
      logo: "https://placehold.co/200x100?text=Terra",
    });

    // Create categories
    const indoorCategory = await Category.create({
      name: "Indoor Plants",
      description: "Plants perfect for indoor spaces",
      image: "https://placehold.co/300x200?text=Indoor+Plants",
      featured: true,
    });

    const tropicalCategory = await Category.create({
      name: "Tropical Plants",
      description: "Exotic tropical plants for your home",
      image: "https://placehold.co/300x200?text=Tropical+Plants",
      featured: true,
    });

    const accessoriesCategory = await Category.create({
      name: "Accessories",
      description: "Plant care accessories and tools",
      image: "https://placehold.co/300x200?text=Accessories",
      featured: false,
    });

    const potsCategory = await Category.create({
      name: "Pots",
      description: "Decorative pots and planters",
      image: "https://placehold.co/300x200?text=Pots",
      featured: true,
    });

    // Create tags
    const airPurifyingTag = await Tag.create({
      name: "Air Purifying",
      description: "Plants that help clean the air",
    });

    const petFriendlyTag = await Tag.create({
      name: "Pet Friendly",
      description: "Safe for homes with pets",
    });

    const lowLightTag = await Tag.create({
      name: "Low Light",
      description: "Thrives in low light conditions",
    });

    const easyToMaintainTag = await Tag.create({
      name: "Easy To Maintain",
      description: "Perfect for beginners",
    });

    // Create test products
    const products = [
      {
        name: "Monstera Deliciosa",
        description:
          "The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its stunning, glossy, perforated leaves. This tropical plant is native to the rainforests of Central America and is an excellent statement plant for your home. Easy to care for and fast-growing, it will bring an instant jungle feel to any room.",
        shortDescription:
          "Stunning tropical plant with unique split leaves, perfect for brightening any indoor space",
        price: 39.99,
        oldPrice: 49.99,
        sku: "PLT-MON-001",
        stock: 25,
        scientificName: "Monstera deliciosa",
        brand: {
          id: greenThumbBrand._id,
          name: greenThumbBrand.name,
          slug: greenThumbBrand.slug,
        },
        categories: [
          {
            id: indoorCategory._id,
            name: indoorCategory.name,
            slug: indoorCategory.slug,
          },
          {
            id: tropicalCategory._id,
            name: tropicalCategory.name,
            slug: tropicalCategory.slug,
          },
        ],
        tags: [
          {
            id: airPurifyingTag._id,
            name: airPurifyingTag.name,
            slug: airPurifyingTag.slug,
          },
          {
            id: petFriendlyTag._id,
            name: petFriendlyTag.name,
            slug: petFriendlyTag.slug,
          },
        ],
        images: [
          {
            url: "https://placehold.co/600x600?text=Monstera+Plant",
            alt: "Monstera Deliciosa",
            isPrimary: true,
          },
          {
            url: "https://placehold.co/600x600?text=Monstera+Leaves",
            alt: "Monstera Deliciosa Leaves Close-up",
            isPrimary: false,
          },
        ],
        variants: [
          {
            name: "Small in Terra Cotta",
            sku: "PLT-MON-S-TC",
            price: 39.99,
            oldPrice: 49.99,
            stock: 10,
            size: {
              label: "Small",
              value: "small",
              inStock: true,
            },
            potStyle: {
              name: "Terra Cotta",
              value: "terra-cotta",
              image: "https://placehold.co/600x600?text=Monstera+Terra+Cotta",
            },
          },
          {
            name: "Medium in Ceramic White",
            sku: "PLT-MON-M-CW",
            price: 59.99,
            oldPrice: 69.99,
            stock: 8,
            size: {
              label: "Medium",
              value: "medium",
              inStock: true,
            },
            potStyle: {
              name: "Ceramic White",
              value: "ceramic-white",
              image: "https://placehold.co/600x600?text=Monstera+White+Ceramic",
            },
          },
        ],
        specifications: [
          {
            name: "Mature Height",
            value: "2-3 feet (indoor)",
          },
          {
            name: "Mature Width",
            value: "1-2 feet",
          },
          {
            name: "Growth Rate",
            value: "Fast",
          },
        ],
        features: [
          {
            description: "Air purifying qualities improve indoor air quality",
            icon: "leaf",
          },
          {
            description:
              "Distinctive split leaves add unique tropical aesthetic",
            icon: "cloud",
          },
        ],
        reviews: [],
        careInfo: {
          lightRequirement: "medium",
          wateringFrequency:
            "Allow soil to dry between waterings, approximately once a week",
          temperature: "65-85°F (18-29°C)",
          humidity: "Medium to high humidity",
          fertilizing: "Monthly during growing season (spring to summer)",
          difficulty: "beginner",
        },
        warranty: "30-day plant health guarantee",
        shippingInfo: {
          freeShippingThreshold: 75,
          estimatedDays: 3,
        },
        featured: true,
      },
      {
        name: "Snake Plant",
        description:
          "The Snake Plant, or Sansevieria, is one of the most tolerant houseplants you can find. With its stiff, upright leaves, this plant can grow in almost any condition and requires minimal care. It's perfect for beginners or busy plant parents. Snake plants are also known for their air-purifying qualities, removing toxins and producing oxygen at night.",
        shortDescription:
          "Easy-care snake plant purifies air and thrives in low light conditions",
        price: 29.99,
        oldPrice: 39.99,
        sku: "PLT-SNK-001",
        stock: 15,
        scientificName: "Sansevieria trifasciata",
        brand: {
          id: greenThumbBrand._id,
          name: greenThumbBrand.name,
          slug: greenThumbBrand.slug,
        },
        categories: [
          {
            id: indoorCategory._id,
            name: indoorCategory.name,
            slug: indoorCategory.slug,
          },
        ],
        tags: [
          {
            id: airPurifyingTag._id,
            name: airPurifyingTag.name,
            slug: airPurifyingTag.slug,
          },
          {
            id: lowLightTag._id,
            name: lowLightTag.name,
            slug: lowLightTag.slug,
          },
          {
            id: easyToMaintainTag._id,
            name: easyToMaintainTag.name,
            slug: easyToMaintainTag.slug,
          },
        ],
        images: [
          {
            url: "https://placehold.co/600x600?text=Snake+Plant",
            alt: "Snake Plant",
            isPrimary: true,
          },
          {
            url: "https://placehold.co/600x600?text=Snake+Plant+Detail",
            alt: "Snake Plant Detail",
            isPrimary: false,
          },
        ],
        variants: [
          {
            name: "Small in Terra Cotta",
            sku: "PLT-SNK-S-TC",
            price: 29.99,
            oldPrice: 39.99,
            stock: 8,
            size: {
              label: "Small",
              value: "small",
              inStock: true,
            },
            potStyle: {
              name: "Terra Cotta",
              value: "terra-cotta",
              image: "https://placehold.co/600x600?text=Snake+Terra+Cotta",
            },
          },
        ],
        specifications: [
          {
            name: "Mature Height",
            value: "1-3 feet (indoor)",
          },
          {
            name: "Mature Width",
            value: "0.5-1 feet",
          },
          {
            name: "Growth Rate",
            value: "Slow",
          },
        ],
        features: [
          {
            description: "Air purifying qualities, perfect for bedrooms",
            icon: "leaf",
          },
          {
            description: "Extremely drought tolerant",
            icon: "water",
          },
        ],
        reviews: [],
        careInfo: {
          lightRequirement: "low",
          wateringFrequency:
            "Water every 2-3 weeks, allowing soil to dry completely between waterings",
          temperature: "60-85°F (15-29°C)",
          humidity: "Low to average humidity",
          fertilizing: "Feed once per season with diluted fertilizer",
          difficulty: "beginner",
        },
        warranty: "30-day plant health guarantee",
        shippingInfo: {
          freeShippingThreshold: 75,
          estimatedDays: 3,
        },
        featured: true,
      },
      {
        name: "Ceramic Plant Pot - White",
        description:
          "Elevate your plant display with this minimalist ceramic pot in clean white. The simple, modern design complements any decor style and makes your plants stand out. This pot features a drainage hole and matching saucer to keep your plants healthy and your surfaces protected.",
        shortDescription:
          "Minimalist ceramic pot with drainage hole and saucer",
        price: 24.99,
        sku: "POT-CER-W-001",
        stock: 25,
        brand: {
          id: terraBrand._id,
          name: terraBrand.name,
          slug: terraBrand.slug,
        },
        categories: [
          {
            id: potsCategory._id,
            name: potsCategory.name,
            slug: potsCategory.slug,
          },
          {
            id: accessoriesCategory._id,
            name: accessoriesCategory.name,
            slug: accessoriesCategory.slug,
          },
        ],
        tags: [],
        images: [
          {
            url: "https://placehold.co/600x600?text=White+Ceramic+Pot",
            alt: "White Ceramic Pot",
            isPrimary: true,
          },
          {
            url: "https://placehold.co/600x600?text=White+Pot+With+Plant",
            alt: "White Ceramic Pot With Plant",
            isPrimary: false,
          },
        ],
        variants: [
          {
            name: "Small White Ceramic",
            sku: "POT-CER-W-S",
            price: 24.99,
            stock: 15,
            size: {
              label: "Small (4-inch)",
              value: "small",
              inStock: true,
            },
            potStyle: {
              name: "Ceramic White",
              value: "ceramic-white",
              image: "https://placehold.co/600x600?text=Small+White+Pot",
            },
          },
          {
            name: "Medium White Ceramic",
            sku: "POT-CER-W-M",
            price: 34.99,
            stock: 10,
            size: {
              label: "Medium (6-inch)",
              value: "medium",
              inStock: true,
            },
            potStyle: {
              name: "Ceramic White",
              value: "ceramic-white",
              image: "https://placehold.co/600x600?text=Medium+White+Pot",
            },
          },
        ],
        specifications: [
          {
            name: "Material",
            value: "Ceramic",
          },
          {
            name: "Color",
            value: "White",
          },
          {
            name: "Includes Saucer",
            value: "Yes",
          },
        ],
        features: [
          {
            description: "Drainage hole to prevent root rot",
            icon: "water",
          },
          {
            description: "Glazed interior to prevent moisture seepage",
            icon: "shield",
          },
        ],
        reviews: [],
        featured: false,
      },
    ];

    // Insert products
    const createdProducts = await Product.insertMany(products);

    logger.info(`Database seeded with ${createdProducts.length} products`);
    res.status(201).json({
      message: `Database seeded with ${
        createdProducts.length
      } products, ${await Brand.countDocuments()} brands, ${await Category.countDocuments()} categories, and ${await Tag.countDocuments()} tags`,
    });
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error seeding database", error: error.message });
  }
});

// GET /api/products/featured - Get featured products
router.get("/featured", async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(8);

    logger.info(
      `Featured products retrieved successfully: ${featuredProducts.length} products`
    );
    res.json(featuredProducts);
  } catch (error) {
    logger.error(`Error retrieving featured products: ${error.message}`);
    res.status(500).json({
      message: "Error retrieving featured products",
      error: error.message,
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Product retrieved successfully: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`Error retrieving product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
});

// GET /api/products/slug/:slug - Get product by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`Product retrieved successfully by slug: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`Error retrieving product by slug: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error retrieving product", error: error.message });
  }
});

// Protected routes - require authentication and admin roles

// POST /api/products - Add a new product
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();

    logger.info(`New product created: ${savedProduct.name}`);
    res.status(201).json(savedProduct);
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    res
      .status(400)
      .json({ message: "Error creating product", error: error.message });
  }
});

// PUT /api/products/:id - Update an existing product
router.put("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Product updated: ${updatedProduct.name}`);
    res.json(updatedProduct);
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    res
      .status(400)
      .json({ message: "Error updating product", error: error.message });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);

    logger.info(`Product deleted: ${product.name}`);
    res.json({ message: "Product successfully deleted" });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
});

// POST /api/products/:id/reviews - Add a review to a product
router.post("/:id/reviews", isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user has already added a review
    const alreadyReviewed = product.reviews.find(
      (r) => r.author === req.user.firstName + " " + req.user.lastName
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = {
      author: req.user.firstName + " " + req.user.lastName,
      rating: Number(rating),
      comment,
      verified: true,
    };

    product.reviews.push(review);
    await product.save();

    logger.info(`New review added for product: ${product.name}`);
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    logger.error(`Error adding review: ${error.message}`);
    res
      .status(400)
      .json({ message: "Error adding review", error: error.message });
  }
});

export default router;

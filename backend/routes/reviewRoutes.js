import express from "express";
import { Review } from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment, user } = req.body;
    console.log(
      `📝 Attempting to create review for product ${productId} by user ${user._id}`
    );

    // Validate input
    if (!productId || !rating || !comment || !user || !user._id || !user.name) {
      console.log("❌ Missing required fields in review creation request");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate rating is a number between 1 and 5
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      console.log(`❌ Invalid rating value: ${rating}`);
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: user._id,
    });

    if (existingReview) {
      console.log(`❌ User ${user._id} already reviewed product ${productId}`);
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create new review
    const review = await Review.create({
      user: user._id,
      name: user.name,
      product: productId,
      rating: numericRating,
      comment,
      verified: true,
    });
    console.log(`✅ Review created successfully: ${review._id}`);

    // Update product's reviews array
    product.reviews.push(review._id);
    product.reviewsCount = product.reviews.length;

    // Calculate new average rating
    const reviews = await Review.find({ product: productId });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      product.rating = Number((totalRating / reviews.length).toFixed(1));
      console.log(`📊 Updated product rating to ${product.rating}`);
    } else {
      product.rating = numericRating;
    }

    await product.save();
    console.log(`✅ Product ${productId} updated with new review`);

    res.status(201).json(review);
  } catch (error) {
    console.error("❌ Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(`📥 Fetching reviews for product ${productId}`);

    // First verify if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log(`❌ Product not found: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }

    // Find all reviews for the product
    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      console.log(`ℹ️ No reviews found for product ${productId}`);
      return res.json([]);
    }

    console.log(`✅ Found ${reviews.length} reviews for product ${productId}`);

    // Transform reviews to match frontend expectations
    const transformedReviews = reviews
      .map((review) => {
        if (!review.user) {
          console.warn(`⚠️ Review ${review._id} has no user data`);
          return null;
        }

        return {
          _id: review._id,
          user: {
            _id: review.user._id,
            name: `${review.user.firstName} ${review.user.lastName}`,
          },
          name: `${review.user.firstName} ${review.user.lastName}`,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      })
      .filter((review) => review !== null);

    console.log(`📤 Sending ${transformedReviews.length} reviews to frontend`);
    res.json(transformedReviews);
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    console.log(`🗑️ Attempting to delete review ${req.params.id}`);
    const review = await Review.findById(req.params.id);

    if (!review) {
      console.log(`❌ Review not found: ${req.params.id}`);
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      console.log(`❌ Unauthorized deletion attempt by user ${req.user._id}`);
      return res.status(401).json({ message: "Not authorized" });
    }

    const product = await Product.findById(review.product);
    if (product) {
      product.reviews = product.reviews.filter(
        (reviewId) => reviewId.toString() !== review._id.toString()
      );
      product.reviewsCount = product.reviews.length;

      if (product.reviews.length > 0) {
        const totalRating = product.reviews.reduce((acc, reviewId) => {
          const review = product.reviews.find(
            (r) => r._id.toString() === reviewId.toString()
          );
          return acc + (review ? review.rating : 0);
        }, 0);
        product.rating = totalRating / product.reviewsCount;
      } else {
        product.rating = 0;
      }

      await product.save();
      console.log(`✅ Product ${product._id} updated after review deletion`);
    }

    await review.deleteOne();
    console.log(`✅ Review ${req.params.id} deleted successfully`);
    res.json({ message: "Review removed" });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

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

    // Check if user already has a review for this product
    const existingReview = await Review.findOne({
      product: productId,
      user: user._id,
    });

    if (existingReview) {
      console.log(
        `❌ User ${user._id} already has a review for product ${productId}`
      );
      return res.status(400).json({
        message:
          "You have already reviewed this product. You can only submit one review per product.",
      });
    }

    // Create new review
    const review = await Review.create({
      user: user._id,
      product: productId,
      name: user.name,
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
    const reviewId = req.params.id;
    console.log(`🗑️ Attempting to delete review ${reviewId}`);

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log(`❌ Review not found: ${reviewId}`);
      return res.status(404).json({ message: "Review not found" });
    }

    // Get user from request body (sent from frontend)
    const { user } = req.body;
    if (!user || !user._id) {
      console.log("❌ User information missing in request");
      return res.status(400).json({ message: "User information is required" });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== user._id) {
      console.log(`❌ Unauthorized deletion attempt by user ${user._id}`);
      return res
        .status(401)
        .json({ message: "Not authorized to delete this review" });
    }

    // Find and update the product
    const product = await Product.findById(review.product);
    if (product) {
      // Remove review from product's reviews array
      product.reviews = product.reviews.filter(
        (reviewId) => reviewId.toString() !== review._id.toString()
      );
      product.reviewsCount = product.reviews.length;

      // Recalculate average rating
      const remainingReviews = await Review.find({ product: product._id });
      if (remainingReviews.length > 0) {
        const totalRating = remainingReviews.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        product.rating = Number(
          (totalRating / remainingReviews.length).toFixed(1)
        );
      } else {
        product.rating = 0;
      }

      await product.save();
      console.log(`✅ Product ${product._id} updated after review deletion`);
    }

    // Delete the review
    await review.deleteOne();
    console.log(`✅ Review ${reviewId} deleted successfully`);
    res.json({ message: "Review removed" });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment, user } = req.body;
    console.log(`📝 Attempting to update review ${reviewId}`);

    // Validate input
    if (!rating || !comment || !user || !user._id) {
      console.log("❌ Missing required fields in review update request");
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

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log(`❌ Review not found: ${reviewId}`);
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the review belongs to the user
    if (review.user.toString() !== user._id) {
      console.log(`❌ Unauthorized update attempt by user ${user._id}`);
      return res
        .status(401)
        .json({ message: "Not authorized to update this review" });
    }

    // Update the review
    review.rating = numericRating;
    review.comment = comment;
    await review.save();
    console.log(`✅ Review ${reviewId} updated successfully`);

    // Update product rating
    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: product._id });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        product.rating = Number((totalRating / reviews.length).toFixed(1));
        console.log(`📊 Updated product rating to ${product.rating}`);
      }
      await product.save();
    }

    res.json(review);
  } catch (error) {
    console.error("❌ Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get the 3 most recent reviews
router.get("/recent", async (req, res) => {
  try {
    console.log("📥 Fetching most recent reviews");

    const reviews = await Review.find()
      .populate("user", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .limit(3);

    if (!reviews || reviews.length === 0) {
      console.log("ℹ️ No reviews found");
      return res.json([]);
    }

    console.log(`✅ Found ${reviews.length} recent reviews`);

    // Transform reviews for a more frontend-friendly structure
    const transformedReviews = reviews
      .map((review) => {
        const userExists = review.user;
        const productExists = review.product;

        const userName = userExists
          ? `${review.user.firstName} ${review.user.lastName}`.trim()
          : "Utilizator Anonim";

        const productName = productExists
          ? review.product.name
          : "Produs Indisponibil";

        const productImage =
          productExists &&
          review.product.images &&
          review.product.images.length > 0 &&
          typeof review.product.images[0] === "object" &&
          review.product.images[0] !== null &&
          "url" in review.product.images[0]
            ? review.product.images[0].url
            : productExists &&
              review.product.images &&
              review.product.images.length > 0 &&
              typeof review.product.images[0] === "string"
            ? review.product.images[0]
            : "/placeholder-image.jpg";

        return {
          _id: review._id,
          user: {
            _id: userExists ? review.user._id : null,
            name: userName,
          },
          product: {
            _id: productExists ? review.product._id : null,
            name: productName,
            image: productImage,
          },
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        };
      })
      .filter((review) => review !== null);

    console.log(
      `📤 Sending ${transformedReviews.length} transformed recent reviews`
    );
    res.json(transformedReviews);
  } catch (error) {
    console.error("❌ Error fetching recent reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

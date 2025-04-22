import mongoose from "mongoose";

// Schema for images
const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

// Schema for specifications
const productSpecificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

// Schema for features
const productFeatureSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
});

// Schema for plant care information
const plantCareInfoSchema = new mongoose.Schema({
  lightRequirement: {
    type: String,
    enum: ["low", "medium", "high"],
    required: true,
  },
  wateringFrequency: {
    type: String,
    required: true,
  },
  temperature: {
    type: String,
    required: true,
  },
  humidity: {
    type: String,
    required: true,
  },
  fertilizing: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
});

// Schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Schema for size
const sizeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
});

// Schema for pot style
const potStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Schema for product variants
const productVariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  oldPrice: {
    type: Number,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  size: sizeSchema,
  potStyle: potStyleSchema,
});

// Main schema for products
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    scientificName: {
      type: String,
    },
    brand: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
      name: String,
      slug: String,
    },
    categories: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        name: String,
        slug: String,
      },
    ],
    tags: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tag",
        },
        name: String,
        slug: String,
      },
    ],
    images: [productImageSchema],
    variants: [productVariantSchema],
    specifications: [productSpecificationSchema],
    features: [productFeatureSchema],
    reviews: [reviewSchema],
    careInfo: plantCareInfoSchema,
    warranty: {
      type: String,
    },
    shippingInfo: {
      freeShippingThreshold: {
        type: Number,
      },
      estimatedDays: {
        type: Number,
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware for calculating average rating
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.rating = totalRating / this.reviews.length;
    this.reviewsCount = this.reviews.length;
  }
  next();
});

// Middleware for generating slug
productSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;

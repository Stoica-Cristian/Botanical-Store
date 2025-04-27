import mongoose from "mongoose";
import { reviewSchema } from "./reviewModel.js";

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

const productFeatureSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
  },
});

const plantCareInfoSchema = new mongoose.Schema({
  lightRequirement: {
    type: String,
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
    required: true,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rating: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    scientificName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: [productImageSchema],
    specifications: [productSpecificationSchema],
    features: [productFeatureSchema],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    careInfo: plantCareInfoSchema,
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

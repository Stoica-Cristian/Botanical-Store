import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware for generating slug
brandSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  next();
});

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;

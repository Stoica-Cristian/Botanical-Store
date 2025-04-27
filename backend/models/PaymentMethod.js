import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardType: {
      type: String,
      required: true,
      enum: ["Visa", "Mastercard", "American Express"],
    },
    lastFour: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid last 4 digits!`,
      },
    },
    expiryDate: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid expiry date! Use format MM/YY`,
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

export default PaymentMethod;

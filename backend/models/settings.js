import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: "Botanical Store",
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    taxRate: {
      type: Number,
      required: true,
      default: 19,
    },
    shippingMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShippingMethod",
      },
    ],
    paymentGateways: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentGateway",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

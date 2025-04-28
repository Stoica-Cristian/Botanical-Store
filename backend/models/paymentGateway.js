import mongoose from "mongoose";

const paymentGatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    credentials: {
      type: Map,
      of: String,
      default: {},
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

const PaymentGateway = mongoose.model("PaymentGateway", paymentGatewaySchema);

export default PaymentGateway;

import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import PaymentGateway from "../models/paymentGateway.js";
import ShippingMethod from "../models/shippingMethod.js";
import Settings from "../models/settings.js";

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

// Get current settings with populated shipping methods and payment gateways
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne()
      .populate("shippingMethods")
      .populate("paymentGateways");

    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
});

// Update general settings
router.put("/", async (req, res) => {
  try {
    const { storeName, currency, taxRate } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.storeName = storeName;
    settings.currency = currency;
    settings.taxRate = taxRate;

    await settings.save();
    const updatedSettings = await Settings.findById(settings._id)
      .populate("shippingMethods")
      .populate("paymentGateways");

    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
});

// Shipping Methods Routes
router.post("/shipping", async (req, res) => {
  try {
    const { name, price, estimatedDelivery, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await ShippingMethod.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const shippingMethod = new ShippingMethod({
      name,
      price,
      estimatedDelivery,
      isDefault,
    });

    await shippingMethod.save();

    // Add to settings if not already there
    const settings = await Settings.findOne();
    if (!settings.shippingMethods.includes(shippingMethod._id)) {
      settings.shippingMethods.push(shippingMethod._id);
      await settings.save();
    }

    res.json(shippingMethod);
  } catch (error) {
    console.error("Error creating shipping method:", error);
    res.status(500).json({ message: "Error creating shipping method" });
  }
});

router.put("/shipping/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, estimatedDelivery, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await ShippingMethod.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const shippingMethod = await ShippingMethod.findByIdAndUpdate(
      id,
      { name, price, estimatedDelivery, isDefault },
      { new: true }
    );

    if (!shippingMethod) {
      return res.status(404).json({ message: "Shipping method not found" });
    }

    res.json(shippingMethod);
  } catch (error) {
    console.error("Error updating shipping method:", error);
    res.status(500).json({ message: "Error updating shipping method" });
  }
});

router.delete("/shipping/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from settings
    const settings = await Settings.findOne();
    settings.shippingMethods = settings.shippingMethods.filter(
      (methodId) => methodId.toString() !== id
    );
    await settings.save();

    // Delete the shipping method
    await ShippingMethod.findByIdAndDelete(id);

    res.json({ message: "Shipping method deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    res.status(500).json({ message: "Error deleting shipping method" });
  }
});

// Payment Gateway Routes
router.post("/payment", async (req, res) => {
  try {
    const { name, enabled, credentials, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentGateway.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const paymentGateway = new PaymentGateway({
      name,
      enabled,
      credentials,
      isDefault,
    });

    await paymentGateway.save();

    // Add to settings if not already there
    const settings = await Settings.findOne();
    if (!settings.paymentGateways.includes(paymentGateway._id)) {
      settings.paymentGateways.push(paymentGateway._id);
      await settings.save();
    }

    res.json(paymentGateway);
  } catch (error) {
    console.error("Error creating payment gateway:", error);
    res.status(500).json({ message: "Error creating payment gateway" });
  }
});

router.put("/payment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, enabled, credentials, isDefault } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentGateway.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const paymentGateway = await PaymentGateway.findByIdAndUpdate(
      id,
      { name, enabled, credentials, isDefault },
      { new: true }
    );

    if (!paymentGateway) {
      return res.status(404).json({ message: "Payment gateway not found" });
    }

    res.json(paymentGateway);
  } catch (error) {
    console.error("Error updating payment gateway:", error);
    res.status(500).json({ message: "Error updating payment gateway" });
  }
});

router.delete("/payment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from settings
    const settings = await Settings.findOne();
    settings.paymentGateways = settings.paymentGateways.filter(
      (gatewayId) => gatewayId.toString() !== id
    );
    await settings.save();

    // Delete the payment gateway
    await PaymentGateway.findByIdAndDelete(id);

    res.json({ message: "Payment gateway deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment gateway:", error);
    res.status(500).json({ message: "Error deleting payment gateway" });
  }
});

export default router;

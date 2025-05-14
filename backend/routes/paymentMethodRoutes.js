import express from "express";
import PaymentMethod from "../models/PaymentMethod.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", async (req, res) => {
  try {
    console.log(
      `[GET /payment-methods] Fetching payment methods for user ${req.user._id}`
    );
    const paymentMethods = await PaymentMethod.find({ user: req.user._id });
    console.log(
      `[GET /payment-methods] Found ${paymentMethods.length} payment methods`
    );
    res.json(paymentMethods);
  } catch (error) {
    console.error(`[GET /payment-methods] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log(
      `[POST /payment-methods] Creating new payment method for user ${req.user._id}`
    );
    const { cardType, lastFour, expiryDate, isDefault } = req.body;
    const existingMethods = await PaymentMethod.countDocuments({
      user: req.user._id,
    });
    const shouldBeDefault = isDefault || existingMethods === 0;
    console.log(
      `[POST /payment-methods] Existing methods: ${existingMethods}, Will be default: ${shouldBeDefault}`
    );

    const paymentMethod = new PaymentMethod({
      user: req.user._id,
      cardType,
      lastFour,
      expiryDate,
      isDefault: shouldBeDefault,
    });

    await paymentMethod.save();
    console.log(
      `[POST /payment-methods] Created payment method ${paymentMethod._id}`
    );
    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error(`[POST /payment-methods] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[PUT /payment-methods/${id}] Updating payment method for user ${req.user._id}`
    );
    const { cardType, lastFour, expiryDate } = req.body;

    const paymentMethod = await PaymentMethod.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { cardType, lastFour, expiryDate },
      { new: true }
    );

    if (!paymentMethod) {
      console.log(`[PUT /payment-methods/${id}] Payment method not found`);
      return res.status(404).json({ message: "Payment method not found" });
    }

    console.log(`[PUT /payment-methods/${id}] Updated successfully`);
    res.json(paymentMethod);
  } catch (error) {
    console.error(`[PUT /payment-methods/${id}] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[DELETE /payment-methods/${id}] Attempting to delete payment method for user ${req.user._id}`
    );
    const paymentMethodToDelete = await PaymentMethod.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!paymentMethodToDelete) {
      console.log(`[DELETE /payment-methods/${id}] Payment method not found`);
      return res.status(404).json({ message: "Payment method not found" });
    }

    const wasDefault = paymentMethodToDelete.isDefault;

    await PaymentMethod.deleteOne({ _id: id, user: req.user._id });
    console.log(`[DELETE /payment-methods/${id}] Deleted successfully`);

    if (wasDefault) {
      const remainingMethods = await PaymentMethod.find({
        user: req.user._id,
      }).sort({ createdAt: 1 }); // Sort by creation date, oldest first

      if (remainingMethods.length > 0) {
        const newDefaultMethod = remainingMethods[0];
        newDefaultMethod.isDefault = true;
        await newDefaultMethod.save();
        console.log(
          `[DELETE /payment-methods/${id}] New default set to ${newDefaultMethod._id}`
        );
      }
    }

    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error(`[DELETE /payment-methods/${id}] Error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/default", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `[PATCH /payment-methods/${id}/default] Setting as default for user ${req.user._id}`
    );
    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!paymentMethod) {
      console.log(
        `[PATCH /payment-methods/${id}/default] Payment method not found`
      );
      return res.status(404).json({ message: "Payment method not found" });
    }

    await PaymentMethod.updateMany(
      { user: req.user._id, _id: { $ne: id } },
      { isDefault: false }
    );

    paymentMethod.isDefault = true;
    await paymentMethod.save();
    console.log(
      `[PATCH /payment-methods/${id}/default] Set as default successfully`
    );
    res.json(paymentMethod);
  } catch (error) {
    console.error(
      `[PATCH /payment-methods/${id}/default] Error: ${error.message}`
    );
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

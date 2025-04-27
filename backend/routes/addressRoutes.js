import express from "express";
import Address from "../models/Address.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();
router.use(verifyToken);

// Get all addresses for a user
router.get("/", async (req, res) => {
  try {
    console.log(`Fetching addresses for user ${req.user._id}`);
    const addresses = await Address.find({ userId: req.user._id });
    console.log(`Found ${addresses.length} addresses for user ${req.user._id}`);
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new address
router.post("/", async (req, res) => {
  try {
    const { name, street, city, state, zipCode, isDefault } = req.body;
    console.log(`Creating new address for user ${req.user._id}:`, {
      name,
      city,
      isDefault,
    });

    if (isDefault) {
      console.log(`Unsetting default addresses for user ${req.user._id}`);
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = new Address({
      userId: req.user._id,
      name,
      street,
      city,
      state,
      zipCode,
      isDefault,
    });

    const newAddress = await address.save();
    console.log(`Address created successfully: ${newAddress._id}`);
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(400).json({ message: error.message });
  }
});

// Update an address
router.put("/:id", async (req, res) => {
  try {
    const { name, street, city, state, zipCode, isDefault } = req.body;
    console.log(`Updating address ${req.params.id} for user ${req.user._id}`);

    if (isDefault) {
      console.log(`Unsetting default addresses for user ${req.user._id}`);
      await Address.updateMany(
        { userId: req.user._id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, street, city, state, zipCode, isDefault },
      { new: true }
    );

    if (!address) {
      console.log(
        `Address ${req.params.id} not found for user ${req.user._id}`
      );
      return res.status(404).json({ message: "Address not found" });
    }

    console.log(`Address ${req.params.id} updated successfully`);
    res.json(address);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete an address
router.delete("/:id", async (req, res) => {
  try {
    console.log(
      `Attempting to delete address ${req.params.id} for user ${req.user._id}`
    );
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!address) {
      console.log(
        `Address ${req.params.id} not found for user ${req.user._id}`
      );
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.isDefault) {
      console.log(`Cannot delete default address ${req.params.id}`);
      return res.status(400).json({ message: "Cannot delete default address" });
    }

    await Address.deleteOne({ _id: req.params.id });
    console.log(`Address ${req.params.id} deleted successfully`);
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: error.message });
  }
});

// Set default address
router.patch("/:id/default", async (req, res) => {
  try {
    console.log(
      `Setting address ${req.params.id} as default for user ${req.user._id}`
    );

    // First unset all default addresses
    console.log(`Unsetting default addresses for user ${req.user._id}`);
    await Address.updateMany({ userId: req.user._id }, { isDefault: false });

    // Then set the new default address
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      console.log(
        `Address ${req.params.id} not found for user ${req.user._id}`
      );
      return res.status(404).json({ message: "Address not found" });
    }

    console.log(`Address ${req.params.id} set as default successfully`);
    res.json(address);
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

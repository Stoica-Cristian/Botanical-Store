import express from "express";
import Address from "../models/Address.js";
import verifyToken from "../middleware/verifyToken.js";
import User from "../models/userModel.js";

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
    const addressToDelete = await Address.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!addressToDelete) {
      console.log(
        `Address ${req.params.id} not found for user ${req.user._id}`
      );
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = addressToDelete.isDefault;

    await Address.deleteOne({ _id: req.params.id, userId: req.user._id });
    console.log(`Address ${req.params.id} deleted successfully`);

    if (wasDefault) {
      const remainingAddresses = await Address.find({
        userId: req.user._id,
      }).sort({ createdAt: 1 }); // Sortează după data creării, cele mai vechi primele

      if (remainingAddresses.length > 0) {
        const newDefaultAddress = remainingAddresses[0];
        newDefaultAddress.isDefault = true;
        await newDefaultAddress.save();
        console.log(
          `New default address set to ${newDefaultAddress._id} for user ${req.user._id}`
        );
        // Actualizează și profilul utilizatorului cu noua adresă default
        const addressString = `${newDefaultAddress.street}, ${newDefaultAddress.city}, ${newDefaultAddress.state} ${newDefaultAddress.zipCode}`;
        await User.findByIdAndUpdate(req.user._id, {
          // Presupunând că modelul User are un câmp `defaultAddress` sau similar stocat ca string
          // Dacă stochează ID-ul, ar fi: defaultAddress: newDefaultAddress._id
          // Sau dacă `addresses` este un array de string-uri și vrei să actualizezi primul/principalul:
          addresses: [addressString], // Aceasta este conform rutei PATCH /:id/default
        });
        console.log(
          `User profile updated with new default address for user ${req.user._id}`
        );
      } else {
        // Nu mai sunt adrese, poate ar trebui să ștergem și din profilul utilizatorului
        await User.findByIdAndUpdate(req.user._id, {
          addresses: [],
        });
        console.log(
          `User profile addresses cleared as no addresses remain for user ${req.user._id}`
        );
      }
    }

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

    // Update user's profile with the default address
    const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    await User.findByIdAndUpdate(req.user._id, {
      addresses: [addressString],
    });

    console.log(`Address ${req.params.id} set as default successfully`);
    res.json(address);
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

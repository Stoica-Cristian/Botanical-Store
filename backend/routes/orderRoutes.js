import express from "express";
import { isAdmin } from "../middleware/authMiddleware.js";
import verifyToken from "../middleware/verifyToken.js";
import Order from "../models/orderModel.js";
import Settings from "../models/settings.js";
import Address from "../models/Address.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all orders for admin with pagination and filters
router.get("/admin", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== "All") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { _id: { $regex: search, $options: "i" } },
        { "customer.firstName": { $regex: search, $options: "i" } },
        { "customer.lastName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Get user's own orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("customer")
      .populate("items.product")
      .populate("shippingAddress");

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Get number of orders for a specific user
router.get("/count/:userId", verifyToken, async (req, res) => {
  try {
    const count = await Order.countDocuments({ customer: req.params.userId });
    res.json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error counting orders", error: error.message });
  }
});

// Create new order
router.post("/", verifyToken, async (req, res) => {
  console.log("🔍 Received request body:", req.body);
  try {
    // Get settings for tax rate
    const settings = await Settings.findOne();
    const taxRate = settings?.taxRate || 0;

    // Calculate tax amount
    const taxAmount = Number(
      ((req.body.totalAmount * taxRate) / 100).toFixed(2)
    );

    // Validate items have valid prices
    const invalidItems = req.body.items.filter(
      (item) => !item.price || typeof item.price !== "number" || item.price <= 0
    );
    console.log("🔍 Invalid items:", invalidItems);
    if (invalidItems.length > 0) {
      return res.status(400).json({
        message: "Invalid price for one or more items",
        invalidItems,
      });
    }

    // Check if user is admin
    const isAdminUser =
      req.headers["x-admin-id"] && req.headers["x-admin-id"] === req.user._id;

    // If user is not admin, ensure they can only create orders for themselves
    if (!isAdminUser && req.body.customer._id != req.user._id) {
      console.log(req.body.customer._id, req.user._id);
      return res.status(403).json({
        message: "You can only create orders for yourself",
      });
    }

    let processedShippingAddressId;
    if (
      req.body.shippingAddress &&
      req.body.shippingAddress._id === "new-address"
    ) {
      const { name, street, city, state, zipCode, isDefault } =
        req.body.shippingAddress;
      const newAddress = new Address({
        userId: req.user._id,
        name,
        street,
        city,
        state,
        zipCode,
        isDefault: isDefault || false,
      });
      const savedAddress = await newAddress.save();
      processedShippingAddressId = savedAddress._id;
      console.log(
        `🏠 New address created with ID: ${processedShippingAddressId}`
      );
    } else if (req.body.shippingAddress && req.body.shippingAddress._id) {
      processedShippingAddressId = req.body.shippingAddress._id;
    } else {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

    // Preluăm detaliile complete ale adresei pentru denormalizare
    const addressDetails = await Address.findById(
      processedShippingAddressId
    ).lean(); // .lean() pentru un obiect JS simplu
    if (!addressDetails) {
      return res
        .status(404)
        .json({ message: "Shipping address not found after processing." });
    }

    console.log("📦 Creating new order with data:", {
      customer: req.body.customer,
      items: req.body.items?.length,
      totalAmount: req.body.totalAmount,
      shippingAddressId: processedShippingAddressId,
    });

    const orderData = {
      ...req.body,
      shippingAddress: processedShippingAddressId,
      shippingAddressDetails: {
        name: addressDetails.name,
        street: addressDetails.street,
        city: addressDetails.city,
        state: addressDetails.state,
        zipCode: addressDetails.zipCode,
      },
      tax: taxAmount,
      status: "pending",
      payment: {
        ...req.body.payment,
        status: "pending",
      },
    };

    const order = new Order(orderData);

    await order.save();
    console.log(`✅ Order created successfully with ID: ${order._id}`);

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    console.log(`📤 Sending response for order ${order._id}`);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("❌ Error creating order:", error.message, error.stack);
    res
      .status(400)
      .json({ message: "Error creating order", error: error.message });
  }
});

router.patch("/bulk-status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    console.log("📦 Updating bulk status for orders:", { orderIds, status });

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      console.log("❌ Invalid orderIds provided");
      return res.status(400).json({ message: "Invalid order IDs provided" });
    }

    if (!status) {
      console.log("❌ No status provided");
      return res.status(400).json({ message: "Status is required" });
    }

    const updateResult = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        status,
        updatedAt: new Date(),
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} orders`);

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    console.log(`📤 Sending response with ${orders.length} updated orders`);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error updating orders status:", error);
    res
      .status(500)
      .json({ message: "Error updating orders status", error: error.message });
  }
});

router.get("/:orderId", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is admin or the order belongs to the user
    const isAdminUser =
      req.headers["x-admin-id"] && req.headers["x-admin-id"] === req.user._id;
    if (
      !isAdminUser &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

router.patch("/:orderId/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status,
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
});

router.put("/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Verificăm și procesăm shippingAddress
    if (
      updateData.shippingAddress &&
      typeof updateData.shippingAddress === "object"
    ) {
      if (
        updateData.shippingAddress._id &&
        mongoose.Types.ObjectId.isValid(updateData.shippingAddress._id)
      ) {
        updateData.shippingAddress = updateData.shippingAddress._id;
        // Dacă ID-ul adresei se schimbă, ar trebui să actualizăm și shippingAddressDetails
        const addressDetails = await Address.findById(
          updateData.shippingAddress
        ).lean();
        if (addressDetails) {
          updateData.shippingAddressDetails = {
            name: addressDetails.name,
            street: addressDetails.street,
            city: addressDetails.city,
            state: addressDetails.state,
            zipCode: addressDetails.zipCode,
          };
        } else {
          // Adresa nu a fost găsită, poate ar trebui să golim detaliile sau să trimitem o eroare?
          // Pentru moment, le lăsăm așa cum sunt trimise din frontend sau le golim.
          // Aceasta depinde de logica de business dorită.
          // O variantă sigură este să ștergem shippingAddressDetails dacă adresa nu e validă.
          delete updateData.shippingAddressDetails;
          // Sau setăm la null/valori goale dacă modelul o cere.
        }
      } else {
        // ID-ul adresei nu este valid sau lipsește, deci setăm la null
        updateData.shippingAddress = null;
        // De asemenea, ar trebui să gestionăm shippingAddressDetails în acest caz
        // De exemplu, le ștergem dacă referința la adresă devine null
        delete updateData.shippingAddressDetails;
        // Alternativ, dacă frontendul trimite detalii goale și vrem să le salvăm:
        // if (updateData.shippingAddressDetails && updateData.shippingAddressDetails.name === '[Adresă Ștearsă]') {
        //   // Se păstrează shippingAddressDetails așa cum vine
        // } else {
        //   delete updateData.shippingAddressDetails;
        // }
      }
    }
    // Asigură-te că nu trimiți shippingAddressDetails dacă shippingAddress este null și nu vrei să salvezi detalii "șterse"
    if (
      updateData.shippingAddress === null &&
      updateData.shippingAddressDetails &&
      updateData.shippingAddressDetails.name === "[Adresă Ștearsă]"
    ) {
      // Dacă adresa ID e null și avem detalii de fallback pentru adresă ștearsă, le păstrăm.
      // Acest caz e specific pentru situația în care adresa originală a fost ștearsă și vrem să păstrăm o marcare.
    } else if (updateData.shippingAddress === null) {
      delete updateData.shippingAddressDetails; // Altfel, ștergem detaliile dacă ID-ul e null.
    }

    // Similar, procesăm customer dacă este necesar și poate fi un obiect în loc de ID
    if (updateData.customer && typeof updateData.customer === "object") {
      if (
        updateData.customer._id &&
        mongoose.Types.ObjectId.isValid(updateData.customer._id)
      ) {
        updateData.customer = updateData.customer._id;
      } else {
        updateData.customer = null; // Sau gestionează eroarea
      }
    }

    updateData.updatedAt = new Date();

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    )
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
});

router.delete("/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    console.log("🔍 Deleting order:", req.params.orderId);
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
});

export default router;

import express from "express";
import { isAdmin } from "../middleware/authMiddleware.js";
import verifyToken from "../middleware/verifyToken.js";
import Order from "../models/Order.js";
import Settings from "../models/settings.js";

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
    const isAdmin =
      req.headers["x-admin-id"] && req.headers["x-admin-id"] === req.user._id;

    // If user is not admin, ensure they can only create orders for themselves
    if (!isAdmin && req.body.customer._id != req.user._id) {
      console.log(req.body.customer._id, req.user._id);
      return res.status(403).json({
        message: "You can only create orders for yourself",
      });
    }

    console.log("📦 Creating new order with data:", {
      customer: req.body.customer,
      items: req.body.items?.length,
      totalAmount: req.body.totalAmount,
    });

    const order = new Order({
      ...req.body,
      tax: taxAmount,
      status: "pending",
      payment: {
        ...req.body.payment,
        status: "pending",
      },
    });

    await order.save();
    console.log(`✅ Order created successfully with ID: ${order._id}`);

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    console.log(`📤 Sending response for order ${order._id}`);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    res
      .status(400)
      .json({ message: "Error creating order", error: error.message });
  }
});

router.patch("/bulk-status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { orderIds, status, notes } = req.body;

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        status,
        ...(notes && { notes }),
        updatedAt: new Date(),
      }
    );

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product")
      .populate("shippingAddress");

    res.json(orders);
  } catch (error) {
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
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        ...req.body,
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

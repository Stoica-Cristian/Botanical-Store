import express from "express";
import { isAdmin } from "../middleware/authMiddleware.js";
import verifyToken from "../middleware/verifyToken.js";
import Order from "../models/Order.js";

const router = express.Router();

// Get all orders with pagination and filters
router.get("/", verifyToken, isAdmin, async (req, res) => {
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
      .populate("items.product");

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

// Create new order
router.post("/", verifyToken, isAdmin, async (req, res) => {
  console.log("🔍 Received request body:", req.body);
  try {
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

    console.log("📦 Creating new order with data:", {
      customer: req.body.customer,
      items: req.body.items?.length,
      totalAmount: req.body.totalAmount,
    });

    const order = new Order({
      ...req.body,
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
      .populate("items.product");

    console.log(`📤 Sending response for order ${order._id}`);
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    res
      .status(400)
      .json({ message: "Error creating order", error: error.message });
  }
});

// Bulk update order status - IMPORTANT: This must come before the /:orderId routes
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
      .populate("items.product");

    res.json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating orders status", error: error.message });
  }
});

// Get order by ID
router.get("/:orderId", verifyToken, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("customer", "firstName lastName email phoneNumber")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
});

// Update order status
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
      .populate("items.product");

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

// Delete order
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

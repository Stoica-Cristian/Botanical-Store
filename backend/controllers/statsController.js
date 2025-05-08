import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

export const getAdminStats = async (req, res) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const twoMonthsAgo = new Date(lastMonth);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

    const [currentMonthSales, lastMonthSales] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "shipped"] },
            createdAt: { $gte: currentMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "shipped"] },
            createdAt: { $gte: lastMonth, $lt: currentMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const [currentMonthOrders, lastMonthOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: currentMonth } }),
      Order.countDocuments({
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      }),
    ]);

    const [currentMonthUsers, lastMonthUsers] = await Promise.all([
      User.countDocuments({
        role: "user",
        createdAt: { $gte: currentMonth },
      }),
      User.countDocuments({
        role: "user",
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      }),
    ]);

    const [currentMonthProducts, lastMonthProducts] = await Promise.all([
      Product.countDocuments({ createdAt: { $gte: currentMonth } }),
      Product.countDocuments({
        createdAt: { $gte: lastMonth, $lt: currentMonth },
      }),
    ]);

    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const salesChange = calculateChange(
      currentMonthSales[0]?.total || 0,
      lastMonthSales[0]?.total || 0
    );

    const ordersChange = calculateChange(currentMonthOrders, lastMonthOrders);
    const usersChange = calculateChange(currentMonthUsers, lastMonthUsers);
    const productsChange = calculateChange(
      currentMonthProducts,
      lastMonthProducts
    );

    const totalSales = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "shipped"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name price");

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          id: "$_id",
          name: "$product.name",
          sales: 1,
          revenue: 1,
        },
      },
    ]);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 10)),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          sales: { $sum: "$totalAmount" },
        },
      },
      {
        $project: {
          name: {
            $let: {
              vars: {
                months: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: { $arrayElemAt: ["$$months", { $subtract: ["$_id", 1] }] },
            },
          },
          sales: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categoryData = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: 1,
        },
      },
    ]);

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      changes: {
        sales: salesChange,
        orders: ordersChange,
        users: usersChange,
        products: productsChange,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          id: order.customer._id,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          email: order.customer.email,
        },
        products: order.items.map((item) => ({
          id: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.payment.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      topProducts,
      salesData,
      categoryData,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching admin statistics" });
  }
};

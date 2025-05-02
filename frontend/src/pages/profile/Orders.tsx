import {
  ShoppingBagIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types/order";
import Loader from "../../components/ui/Loader";

const Orders = () => {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-black-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "total") {
        return sortOrder === "desc"
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 my-10">
          <Loader size="lg" text="Loading orders..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 my-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-end">
                {/* Filter */}
                <select
                  className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <select
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="total">Sort by Total</option>
                  </select>
                  <button
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    <FunnelIcon
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        sortOrder === "desc" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrder(order._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order._id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            expandedOrders.includes(order._id)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {expandedOrders.includes(order._id) && (
                    <div className="border-t border-gray-100 p-6">
                      {/* Items */}
                      <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-4">
                          Order Items
                        </h3>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                            >
                              {item.product.images &&
                                item.product.images.length > 0 && (
                                  <img
                                    src={
                                      typeof item.product.images[0] === "string"
                                        ? item.product.images[0]
                                        : item.product.images[0].url
                                    }
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping & Payment */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-4">
                            Shipping Details
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-600">
                              {order.shippingAddress.street}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-4">
                            Payment Details
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-600">
                              Method: {order.payment.method}
                            </p>
                            <p className="text-gray-600">
                              Status: {order.payment.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium">
                            Order Summary
                          </span>
                          <span className="text-xl font-semibold">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            Subtotal: $
                            {(
                              order.totalAmount -
                              order.shippingCost -
                              order.tax
                            ).toFixed(2)}
                          </p>
                          <p>Shipping: ${order.shippingCost.toFixed(2)}</p>
                          <p>Tax: ${order.tax.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;

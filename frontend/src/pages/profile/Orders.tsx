import {
  ShoppingBagIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  TruckIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useState } from "react";

const Orders = () => {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Mock orders data with more details
  const orders = [
    {
      id: "#ORD001",
      date: "2024-01-15",
      total: 299.99,
      status: "Delivered",
      items: [
        {
          id: 1,
          name: "Monstera Deliciosa",
          quantity: 1,
          price: 149.99,
          image: "https://placehold.co/100x100",
        },
        {
          id: 2,
          name: "Snake Plant",
          quantity: 2,
          price: 74.99,
          image: "https://placehold.co/100x100",
        },
      ],
      shipping: {
        address: "123 Main Street, Bucharest, Sector 1",
        method: "Standard Delivery",
        tracking: "RO123456789",
      },
      payment: {
        method: "Visa ending in 4242",
        status: "Paid",
      },
      timeline: [
        { date: "2024-01-15", status: "Delivered", icon: CheckCircleIcon },
        { date: "2024-01-14", status: "Out for Delivery", icon: TruckIcon },
        { date: "2024-01-13", status: "Shipped", icon: TruckIcon },
        { date: "2024-01-12", status: "Packed", icon: InboxIcon },
      ],
    },
    {
      id: "#ORD002",
      date: "2024-01-10",
      total: 149.99,
      status: "Processing",
      items: [
        {
          id: 3,
          name: "Peace Lily",
          quantity: 1,
          price: 149.99,
          image: "https://placehold.co/100x100",
        },
      ],
      shipping: {
        address: "456 Business Avenue, Bucharest, Sector 2",
        method: "Express Delivery",
        tracking: "RO987654321",
      },
      payment: {
        method: "Mastercard ending in 8888",
        status: "Paid",
      },
    },
    {
      id: "#ORD003",
      date: "2024-01-05",
      total: 89.99,
      status: "Cancelled",
      items: [
        {
          id: 4,
          name: "Succulent Set",
          quantity: 1,
          price: 89.99,
          image: "https://placehold.co/100x100",
        },
      ],
      shipping: {
        address: "789 Park Road, Bucharest, Sector 3",
        method: "Standard Delivery",
        tracking: null,
      },
      payment: {
        method: "PayPal",
        status: "Refunded",
      },
    },
  ];

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-black-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === "total") {
        return sortOrder === "desc" ? b.total - a.total : a.total - b.total;
      }
      return 0;
    });

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
                  <option value="Delivered">Delivered</option>
                  <option value="Processing">Processing</option>
                  <option value="Cancelled">Cancelled</option>
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

          {/* Rest of the content */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 transition-transform ${
                          expandedOrders.includes(order.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrders.includes(order.id) && (
                  <div className="border-t border-gray-100 p-6">
                    {/* Order Timeline */}
                    <div className="mb-8">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Order Timeline
                      </h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                        <div className="space-y-6">
                          {order.timeline?.map((event, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
                              <div className="relative z-10">
                                <event.icon className="h-8 w-8 text-accent bg-white rounded-full p-1" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {event.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              ${item.price.toFixed(2)}
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
                            {order.shipping.address}
                          </p>
                          <p className="text-gray-600 mt-2">
                            Method: {order.shipping.method}
                          </p>
                          {order.shipping.tracking && (
                            <p className="text-gray-600 mt-2">
                              Tracking: {order.shipping.tracking}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-4">
                          Payment Details
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-600">
                            {order.payment.method}
                          </p>
                          <p className="text-gray-600 mt-2">
                            Status: {order.payment.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;

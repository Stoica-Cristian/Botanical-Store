import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { AdminOrder } from "../../types/admin";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import Loader from "../ui/Loader";

const mockOrders: AdminOrder[] = [
  {
    id: 1,
    orderNumber: "ORD-2023-001",
    customer: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    },
    products: [
      {
        id: 1,
        name: "Snake Plant",
        quantity: 2,
        price: 29.99,
      },
    ],
    totalAmount: 59.98,
    status: "delivered",
    paymentStatus: "paid",
    createdAt: "2023-10-15T08:30:00Z",
    updatedAt: "2023-10-16T14:20:00Z",
    shippingAddress: {
      street: "123 Main St",
      city: "Anytown",
      state: "ST",
      zipCode: "12345",
      country: "Country",
    },
  },
  {
    id: 2,
    orderNumber: "ORD-2023-002",
    customer: {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
    },
    products: [
      {
        id: 3,
        name: "Monstera Deliciosa",
        quantity: 1,
        price: 49.99,
      },
    ],
    totalAmount: 49.99,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2023-10-16T10:15:00Z",
    updatedAt: "2023-10-17T09:30:00Z",
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Somewhere",
      state: "ST",
      zipCode: "67890",
      country: "Country",
    },
  },
  {
    id: 3,
    orderNumber: "ORD-2023-003",
    customer: {
      id: 3,
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    products: [
      {
        id: 2,
        name: "Fiddle Leaf Fig",
        quantity: 1,
        price: 59.99,
      },
      {
        id: 4,
        name: "Potting Soil Mix",
        quantity: 1,
        price: 19.99,
      },
    ],
    totalAmount: 79.98,
    status: "processing",
    paymentStatus: "paid",
    createdAt: "2023-10-17T15:45:00Z",
    updatedAt: "2023-10-17T16:30:00Z",
    shippingAddress: {
      street: "789 Pine Rd",
      city: "Otherplace",
      state: "ST",
      zipCode: "54321",
      country: "Country",
    },
  },
  {
    id: 4,
    orderNumber: "ORD-2023-004",
    customer: {
      id: 4,
      name: "Alice Williams",
      email: "alice@example.com",
    },
    products: [
      {
        id: 5,
        name: "Ceramic Plant Pot - White",
        quantity: 3,
        price: 24.99,
      },
    ],
    totalAmount: 74.97,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: "2023-10-18T09:20:00Z",
    updatedAt: "2023-10-18T09:20:00Z",
    shippingAddress: {
      street: "101 Elm Blvd",
      city: "Newtown",
      state: "ST",
      zipCode: "11223",
      country: "Country",
    },
  },
  {
    id: 5,
    orderNumber: "ORD-2023-005",
    customer: {
      id: 5,
      name: "Michael Brown",
      email: "michael@example.com",
    },
    products: [
      {
        id: 1,
        name: "Snake Plant",
        quantity: 1,
        price: 29.99,
      },
      {
        id: 3,
        name: "Monstera Deliciosa",
        quantity: 1,
        price: 49.99,
      },
    ],
    totalAmount: 79.98,
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2023-10-14T11:10:00Z",
    updatedAt: "2023-10-15T13:25:00Z",
    shippingAddress: {
      street: "202 Cedar St",
      city: "Somecity",
      state: "ST",
      zipCode: "33445",
      country: "Country",
    },
  },
];

const OrdersManager = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<AdminOrder["status"] | "">("");
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Status options
  const statusOptions = [
    "All",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching orders data:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;

    if (sortBy === "date") {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "amount") {
      comparison = a.totalAmount - b.totalAmount;
    } else if (sortBy === "orderNumber") {
      comparison = a.orderNumber.localeCompare(b.orderNumber);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrders.length === currentItems.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentItems.map((order) => order.id));
    }
  };

  const handleBulkStatusUpdate = () => {
    if (selectedOrders.length > 0) {
      setSelectedOrder(null);
      setShowStatusUpdateModal(true);
    }
  };

  const addToast = (type: "success" | "error", message: string) => {
    const newToast: ToastData = {
      id: Date.now(),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const updateOrderStatus = (
    orderId: number | null,
    status: AdminOrder["status"]
  ) => {
    try {
      if (orderId) {
        // Update a single order
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
        // Update selected order if it's currently being viewed
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }

        // Show success notification for single order update
        const updatedOrder = orders.find((order) => order.id === orderId);
        if (updatedOrder) {
          addToast(
            "success",
            `Order #${updatedOrder.orderNumber} status updated to ${status}`
          );
        }
      } else if (selectedOrders.length > 0) {
        // Update multiple orders
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            selectedOrders.includes(order.id) ? { ...order, status } : order
          )
        );

        // Show success notification for bulk update
        addToast(
          "success",
          `${selectedOrders.length} orders updated to status: ${status}`
        );

        setSelectedOrders([]);
      }
      setShowStatusUpdateModal(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      addToast("error", "Failed to update order status. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <Loader size="lg" text="Loading orders..." />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-medium text-gray-900">Orders</h2>
        <div className="flex space-x-3">
          {selectedOrders.length > 0 && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
              onClick={handleBulkStatusUpdate}
            >
              Update Status ({selectedOrders.length})
            </button>
          )}
          <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg inline-flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Orders
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order number, customer name or email..."
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div>
          <select
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-accent focus:border-accent"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "All"
                  ? "All Statuses"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                  checked={
                    selectedOrders.length === currentItems.length &&
                    currentItems.length > 0
                  }
                  onChange={toggleSelectAllOrders}
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("orderNumber")}
              >
                <div className="flex items-center">
                  Order Number
                  {sortBy === "orderNumber" && (
                    <ChevronDownIcon
                      className={`h-4 w-4 ml-1 ${
                        sortOrder === "desc" ? "transform rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortBy === "date" && (
                    <ChevronDownIcon
                      className={`h-4 w-4 ml-1 ${
                        sortOrder === "desc" ? "transform rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("amount")}
              >
                <div className="flex items-center">
                  Total
                  {sortBy === "amount" && (
                    <ChevronDownIcon
                      className={`h-4 w-4 ml-1 ${
                        sortOrder === "desc" ? "transform rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Payment:{" "}
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-accent hover:text-accent/80"
                      onClick={() => handleViewOrder(order)}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {sortedOrders.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, sortedOrders.length)} of{" "}
                {sortedOrders.length} results
              </span>
              <select
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-accent focus:border-accent"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                {[10, 25, 50].map((value) => (
                  <option key={value} value={value}>
                    {value} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? "bg-accent text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-gray-500">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowOrderDetails(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Customer Information
                </h4>
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  {selectedOrder.customer.name}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {selectedOrder.customer.email}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Shipping Information
                </h4>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-500">
                  Payment:{" "}
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                    selectedOrder.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(product.price * product.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-right font-medium text-gray-900"
                      >
                        Total Amount:
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </button>
              <button
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  setSelectedOrder(selectedOrder);
                  setShowStatusUpdateModal(true);
                  setShowOrderDetails(false);
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Update Order Status
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedOrder ? (
                // Single order update
                <span>
                  Select new status for order{" "}
                  <span className="font-medium">
                    #{selectedOrder.orderNumber}
                  </span>
                </span>
              ) : (
                // Bulk update
                <span>
                  Select new status for{" "}
                  <span className="font-medium">
                    {selectedOrders.length} orders
                  </span>
                </span>
              )}
            </p>

            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as AdminOrder["status"] | "")
              }
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-accent focus:border-accent mb-4"
            >
              <option value="">Select Status</option>
              {statusOptions
                .filter((status) => status !== "All")
                .map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
            </select>

            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowStatusUpdateModal(false);
                  if (selectedOrder) setShowOrderDetails(true);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg"
                onClick={() => {
                  if (newStatus) {
                    updateOrderStatus(
                      selectedOrder ? selectedOrder.id : null,
                      newStatus as AdminOrder["status"]
                    );
                    setNewStatus("");
                  }
                }}
                disabled={!newStatus}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;

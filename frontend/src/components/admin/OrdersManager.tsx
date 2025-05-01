import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Order, OrderPagination } from "../../types/order";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import Loader from "../ui/Loader";
import {
  orderService,
  FormOrderItem,
  FormPaymentInfo,
} from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { productService } from "../../services/productService";
import { addressService } from "../../services/addressService";
import { settingsService } from "../../services/settingsService";
import { Product } from "../../types/product";

interface FormOrder {
  customer: string;
  items: FormOrderItem[];
  shippingAddress: string;
  payment: FormPaymentInfo;
  status: Order["status"];
  totalAmount: number;
  shippingCost: number;
  tax: number;
}

const OrdersManager = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "All">(
    "All"
  );
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order["status"] | "">("");
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [pagination, setPagination] = useState<OrderPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState<FormOrder>({
    customer: "",
    items: [
      {
        product: "",
        quantity: 1,
      },
    ],
    shippingAddress: "",
    payment: {
      method: "credit_card",
      status: "pending",
      amount: 0,
    },
    status: "pending",
    totalAmount: 0,
    shippingCost: 0,
    tax: 0,
  });
  const orderDetailsModalRef = useRef<HTMLDivElement>(null);
  const statusUpdateModalRef = useRef<HTMLDivElement>(null);
  const createOrderModalRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const [taxRate, setTaxRate] = useState(0);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const editOrderModalRef = useRef<HTMLDivElement>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [newProductQuantity, setNewProductQuantity] = useState<number>(1);

  // Add new state for address creation
  const [isCreatingNewAddress, setIsCreatingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  // Status options
  const statusOptions: (Order["status"] | "All")[] = [
    "All",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, statusFilter, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showOrderDetails &&
        orderDetailsModalRef.current &&
        !orderDetailsModalRef.current.contains(event.target as Node)
      ) {
        setShowOrderDetails(false);
      }

      if (
        showStatusUpdateModal &&
        statusUpdateModalRef.current &&
        !statusUpdateModalRef.current.contains(event.target as Node)
      ) {
        setShowStatusUpdateModal(false);
      }

      if (
        showCreateOrderModal &&
        createOrderModalRef.current &&
        !createOrderModalRef.current.contains(event.target as Node)
      ) {
        setShowCreateOrderModal(false);
      }

      if (
        showDeleteModal &&
        deleteModalRef.current &&
        !deleteModalRef.current.contains(event.target as Node)
      ) {
        setShowDeleteModal(false);
        setOrderToDelete(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showOrderDetails,
    showStatusUpdateModal,
    showCreateOrderModal,
    showDeleteModal,
  ]);

  useEffect(() => {
    const totalPayment =
      newOrder.totalAmount + newOrder.shippingCost + newOrder.tax;
    setNewOrder((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        amount: totalPayment,
      },
    }));
  }, [newOrder.totalAmount, newOrder.shippingCost, newOrder.tax]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getSettings(user?.id || "");
        setTaxRate(settings.taxRate);
      } catch (error) {
        console.error("Error fetching settings:", error);
        addToast("error", "Failed to fetch tax rate from settings");
      }
    };

    fetchSettings();
  }, [user?.id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        addToast("error", "Failed to fetch products");
      }
    };

    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders(
        currentPage,
        itemsPerPage,
        user?.id || "",
        statusFilter === "All" ? undefined : statusFilter,
        searchTerm
      );
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      addToast("error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer.firstName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (order.customer.lastName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleViewOrder = (order: Order) => {
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

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order._id));
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

  const updateOrderStatus = async (
    orderId: string | null,
    status: Order["status"]
  ) => {
    try {
      if (orderId) {
        const updatedOrder = await orderService.updateOrderStatus(
          orderId,
          {
            status,
          },
          user?.id || ""
        );
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? updatedOrder : order
          )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }

        addToast(
          "success",
          `Order #${updatedOrder._id} status updated to ${status}`
        );
      } else if (selectedOrders.length > 0) {
        const updatedOrders = await orderService.updateBulkOrderStatus(
          selectedOrders,
          { status },
          user?.id || ""
        );
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            selectedOrders.includes(order._id)
              ? updatedOrders.find((u: Order) => u._id === order._id) || order
              : order
          )
        );

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

  const getStatusColor = (status: Order["status"]) => {
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

  const handleCreateOrder = async () => {
    try {
      // Fetch product prices first
      const productsWithPrices = await Promise.all(
        newOrder.items.map(async (item) => {
          const product = await productService.getProductById(item.product);
          return {
            product: { _id: item.product },
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      let shippingAddressId = newOrder.shippingAddress;

      // If creating a new address
      if (isCreatingNewAddress) {
        // Create the new address
        const newAddressResponse = await addressService.create({
          name: `${newAddress.street}, ${newAddress.city}`, // Create a name from street and city
          street: newAddress.street,
          city: newAddress.city,
          state: newAddress.state,
          zipCode: newAddress.zipCode,
          isDefault: newAddress.isDefault,
        });

        // Use the newly created address ID
        shippingAddressId = newAddressResponse._id;
      }

      // Calculate tax based on settings
      const subtotal = productsWithPrices.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const calculatedTax = subtotal * (taxRate / 100);

      const orderData = {
        ...newOrder,
        customer: { _id: newOrder.customer },
        items: productsWithPrices,
        shippingAddress: { _id: shippingAddressId },
        tax: calculatedTax,
      };

      const response = await orderService.createOrder(
        orderData,
        user?.id || ""
      );
      setOrders((prev) => [response, ...prev]);
      setShowCreateOrderModal(false);
      addToast("success", "Order created successfully");

      // Reset the form
      setNewOrder({
        customer: "",
        items: [
          {
            product: "",
            quantity: 1,
          },
        ],
        shippingAddress: "",
        payment: {
          method: "credit_card",
          status: "pending",
          amount: 0,
        },
        status: "pending",
        totalAmount: 0,
        shippingCost: 0,
        tax: 0,
      });
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false,
      });
      setIsCreatingNewAddress(false);
    } catch (error) {
      console.error("Error creating order:", error);
      addToast("error", "Failed to create order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId, user?.id || "");
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
      addToast("success", "Order deleted successfully");
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      addToast("error", "Failed to delete order");
    }
  };

  const handleEditClick = (order: Order) => {
    console.log("Order being edited:", order); // Debug log
    console.log("Customer ID:", order.customer.id); // Debug log
    console.log("Address ID:", order.shippingAddress._id); // Debug log

    setOrderToEdit({
      ...order,
      customer: {
        ...order.customer,
        id: order.customer.id,
      },
      shippingAddress: {
        ...order.shippingAddress,
        _id: order.shippingAddress._id,
      },
    });
    setShowEditOrderModal(true);
  };

  const handleEditOrder = async () => {
    try {
      if (!orderToEdit) return;

      // Fetch product prices first
      const productsWithPrices = await Promise.all(
        orderToEdit.items.map(async (item) => {
          const product = await productService.getProductById(item.product._id);
          return {
            product: product,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      // Calculate tax based on settings
      const subtotal = productsWithPrices.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const calculatedTax = subtotal * (taxRate / 100);

      const orderData = {
        ...orderToEdit,
        items: productsWithPrices,
        tax: calculatedTax,
        totalAmount: subtotal + orderToEdit.shippingCost + calculatedTax,
      };

      const response = await orderService.updateOrder(
        orderToEdit._id,
        orderData,
        user?.id || ""
      );

      setOrders((prev) =>
        prev.map((order) => (order._id === response._id ? response : order))
      );
      setShowEditOrderModal(false);
      addToast("success", "Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      addToast("error", "Failed to update order");
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !newProductQuantity) return;

    const product = availableProducts.find((p) => p._id === selectedProduct);
    if (!product) return;

    setOrderToEdit((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            product,
            quantity: newProductQuantity,
            price: product.price,
          },
        ],
      };
    });

    setSelectedProduct("");
    setNewProductQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setOrderToEdit((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      };
    });
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
          <button
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg inline-flex items-center"
            onClick={() => setShowCreateOrderModal(true)}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Order
          </button>
          {selectedOrders.length > 0 && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
              onClick={handleBulkStatusUpdate}
            >
              Update Status ({selectedOrders.length})
            </button>
          )}
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
              setStatusFilter(e.target.value as Order["status"] | "All");
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
                    selectedOrders.length === orders.length && orders.length > 0
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleSelectOrder(order._id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
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
                      {order.payment.status.charAt(0).toUpperCase() +
                        order.payment.status.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleViewOrder(order)}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditClick(order)}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600"
                        onClick={() => {
                          setOrderToDelete(order);
                          setShowDeleteModal(true);
                        }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
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
        {pagination.totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
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
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
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
                }
              )}
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className={`p-2 rounded-md ${
                  currentPage === pagination.totalPages
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
          <div
            ref={orderDetailsModalRef}
            className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details: {selectedOrder._id}
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-500">Name:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.customer.firstName}{" "}
                      {selectedOrder.customer.lastName}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="font-medium">
                      {selectedOrder.customer.email}
                    </span>
                  </p>
                  {selectedOrder.customer.phoneNumber && (
                    <p>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder.customer.phoneNumber}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Shipping Information
                </h4>
                <div className="space-y-2">
                  {selectedOrder.shippingAddress && (
                    <>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress.street ||
                          "No street address provided"}
                      </p>
                      <p>
                        {selectedOrder.shippingAddress.city ||
                          "No city provided"}
                        ,{" "}
                        {selectedOrder.shippingAddress.state ||
                          "No state provided"}{" "}
                        {selectedOrder.shippingAddress.zipCode ||
                          "No zip code provided"}
                      </p>
                    </>
                  )}
                  {!selectedOrder.shippingAddress && (
                    <p className="text-gray-500">
                      No shipping address provided
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">
                  Payment:{" "}
                  <span className="font-medium">
                    {selectedOrder.payment.status.charAt(0).toUpperCase() +
                      selectedOrder.payment.status.slice(1)}
                  </span>
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="w-20 h-20 flex-shrink-0">
                      {item.product.images &&
                        item.product.images.length > 0 && (
                          <img
                            src={
                              typeof item.product.images[0] === "string"
                                ? item.product.images[0]
                                : item.product.images[0].url
                            }
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {item.product.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${item.product.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total: $
                        {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    $
                    {(
                      selectedOrder.totalAmount -
                      selectedOrder.shippingCost -
                      selectedOrder.tax
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    ${selectedOrder.shippingCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">
                    ${selectedOrder.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">
                    Total Amount:
                  </span>
                  <span className="font-medium text-gray-900">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={statusUpdateModalRef}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Update Order Status
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedOrder ? (
                // Single order update
                <span>
                  Select new status for order{" "}
                  <span className="font-medium">#{selectedOrder._id}</span>
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
                setNewStatus(e.target.value as Order["status"] | "")
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
                      selectedOrder ? selectedOrder._id : null,
                      newStatus
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

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={createOrderModalRef}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                Create New Order
              </h3>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={newOrder.customer}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customer: e.target.value })
                    }
                    placeholder="Enter customer ID"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setIsCreatingNewAddress(!isCreatingNewAddress)
                      }
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      {isCreatingNewAddress
                        ? "Use Existing Address"
                        : "Create New Address"}
                    </button>
                  </div>

                  {isCreatingNewAddress ? (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              street: e.target.value,
                            })
                          }
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            placeholder="Enter state"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                          value={newAddress.zipCode}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              zipCode: e.target.value,
                            })
                          }
                          placeholder="Enter ZIP code"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                          checked={newAddress.isDefault}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              isDefault: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="isDefault"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Set as default address
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      value={newOrder.shippingAddress}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingAddress: e.target.value,
                        })
                      }
                      placeholder="Enter shipping address ID"
                    />
                  )}
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Order Items</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOrder({
                        ...newOrder,
                        items: [
                          ...newOrder.items!,
                          { product: "", quantity: 1 },
                        ],
                      });
                    }}
                    className="px-3 py-1 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm"
                  >
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {newOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg relative group"
                    >
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product ID
                        </label>
                        <input
                          type="text"
                          className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                          value={item.product}
                          onChange={(e) => {
                            const newItems = [...newOrder.items!];
                            newItems[index].product = e.target.value;
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          placeholder="Enter product ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...newOrder.items!];
                            newItems[index].quantity =
                              parseInt(e.target.value) || 1;
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = newOrder.items!.filter(
                              (_, i) => i !== index
                            );
                            setNewOrder({ ...newOrder, items: newItems });
                          }}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {newOrder.items?.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No items added yet. Click "Add Item" to start.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={newOrder.status}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        status: e.target.value as Order["status"],
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={newOrder.payment?.method}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        payment: {
                          ...newOrder.payment!,
                          method: e.target.value as FormPaymentInfo["method"],
                        },
                      })
                    }
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={newOrder.payment?.status}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        payment: {
                          ...newOrder.payment!,
                          status: e.target.value as FormPaymentInfo["status"],
                        },
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      value={newOrder.totalAmount || ""}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          totalAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Cost
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      value={newOrder.shippingCost || ""}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          shippingCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ({taxRate}%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent bg-gray-100"
                      value={newOrder.totalAmount * (taxRate / 100) || ""}
                      readOnly
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Payment:</span>
                  <span className="text-xl font-semibold">
                    $
                    {(
                      newOrder.totalAmount +
                      newOrder.shippingCost +
                      newOrder.tax
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                onClick={() => setShowCreateOrderModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 border border-transparent rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                onClick={handleCreateOrder}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={deleteModalRef}
            className="bg-white p-6 rounded-lg w-full max-w-md"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Order
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete order{" "}
              <span className="font-medium">#{orderToDelete._id}</span>? This
              action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                onClick={() => {
                  setShowDeleteModal(false);
                  setOrderToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={() => handleDeleteOrder(orderToDelete._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrderModal && orderToEdit && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            ref={editOrderModalRef}
            className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Edit Order #{orderToEdit._id}
                </h3>
                <p className="text-gray-500 mt-1">
                  Created on{" "}
                  {new Date(orderToEdit.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowEditOrderModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer ID
                      </label>
                      <input
                        type="text"
                        className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                        value={orderToEdit.customer.id || ""}
                        onChange={(e) =>
                          setOrderToEdit({
                            ...orderToEdit,
                            customer: {
                              ...orderToEdit.customer,
                              id: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Shipping Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address ID
                      </label>
                      <input
                        type="text"
                        className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                        value={orderToEdit.shippingAddress._id || ""}
                        onChange={(e) =>
                          setOrderToEdit({
                            ...orderToEdit,
                            shippingAddress: {
                              ...orderToEdit.shippingAddress,
                              _id: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Order Items</h4>
                  <div className="flex items-center space-x-4">
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">Select a product</option>
                      {availableProducts.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} (${product.price})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={newProductQuantity}
                      onChange={(e) =>
                        setNewProductQuantity(parseInt(e.target.value) || 1)
                      }
                      className="w-20 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90"
                      disabled={!selectedProduct}
                    >
                      Add Product
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {orderToEdit.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <div className="flex items-center space-x-3">
                          {item.product.images &&
                            item.product.images.length > 0 && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                className="h-12 w-12 object-cover rounded-md"
                              />
                            )}
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              ID: {item.product._id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...orderToEdit.items];
                            newItems[index].quantity =
                              parseInt(e.target.value) || 1;
                            setOrderToEdit({ ...orderToEdit, items: newItems });
                          }}
                          min="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={orderToEdit.status}
                    onChange={(e) =>
                      setOrderToEdit({
                        ...orderToEdit,
                        status: e.target.value as Order["status"],
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                    value={orderToEdit.payment.status}
                    onChange={(e) =>
                      setOrderToEdit({
                        ...orderToEdit,
                        payment: {
                          ...orderToEdit.payment,
                          status: e.target.value as FormPaymentInfo["status"],
                        },
                      })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent bg-gray-100"
                      value={orderToEdit.items.reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      )}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Cost
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      value={orderToEdit.shippingCost}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          shippingCost: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax ({taxRate}%)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      className="mt-1 block p-2 w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent bg-gray-100"
                      value={orderToEdit.tax}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Payment:</span>
                  <span className="text-xl font-semibold">
                    $
                    {(
                      orderToEdit.items.reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      ) +
                      orderToEdit.shippingCost +
                      orderToEdit.tax
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                onClick={() => setShowEditOrderModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 border border-transparent rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors"
                onClick={handleEditOrder}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;

import { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UserIcon,
  CubeIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ToastData } from "../ui/ToastContainer";
import { productService } from "../../services/api";

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change: number;
  color: string;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
  topProducts: {
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }[];
}

// Mock data
const mockData: DashboardStats = {
  totalSales: 15680,
  totalOrders: 156,
  totalUsers: 432,
  totalProducts: 89,
  recentOrders: [
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
        name: "Michael Johnson",
        email: "michael@example.com",
      },
      products: [
        {
          id: 2,
          name: "Fiddle Leaf Fig",
          quantity: 1,
          price: 59.99,
        },
      ],
      totalAmount: 59.99,
      status: "processing",
      paymentStatus: "paid",
      createdAt: "2023-10-17T14:45:00Z",
      updatedAt: "2023-10-17T15:00:00Z",
      shippingAddress: {
        street: "789 Pine Rd",
        city: "Othertown",
        state: "ST",
        zipCode: "54321",
        country: "Country",
      },
    },
  ],
  topProducts: [
    {
      id: 1,
      name: "Snake Plant",
      sales: 42,
      revenue: 1259.58,
    },
    {
      id: 2,
      name: "Fiddle Leaf Fig",
      sales: 38,
      revenue: 1139.62,
    },
    {
      id: 3,
      name: "Monstera Deliciosa",
      sales: 35,
      revenue: 1749.65,
    },
  ],
};

// Mock chart data
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
  { name: "Jul", sales: 7000 },
  { name: "Aug", sales: 6500 },
  { name: "Sep", sales: 8000 },
  { name: "Oct", sales: 7500 },
];

const categoryData = [
  { name: "Indoor Plants", value: 45 },
  { name: "Outdoor Plants", value: 25 },
  { name: "Pots", value: 15 },
  { name: "Soil & Fertilizers", value: 10 },
  { name: "Accessories", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface LabelProps {
  name: string;
  percent: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isSeedingDatabase, setIsSeedingDatabase] = useState(false);

  const dashboardStats: DashboardStat[] = [
    {
      title: "Total Sales",
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: 12.5,
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBagIcon,
      change: 8.2,
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UserIcon,
      change: 15.3,
      color: "bg-purple-500",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: CubeIcon,
      change: -2.4,
      color: "bg-pink-500",
    },
  ];

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  const handleSeedDatabase = async () => {
    try {
      setIsSeedingDatabase(true);
      setError(null);

      await productService.seedDatabase();

      showToast("success", "Database seeded successfully with test products!");
    } catch (error) {
      console.error("Error seeding database:", error);
      setError("Failed to seed database. Please try again.");
      showToast("error", "Failed to seed database. Please try again.");
    } finally {
      setIsSeedingDatabase(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeedingDatabase}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            {isSeedingDatabase ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Seeding...
              </>
            ) : (
              <>
                <CubeIcon className="h-4 w-4" />
                Seed Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {dashboardStats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow p-6 flex items-start justify-between"
          >
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div
                className={`flex items-center mt-2 ${
                  stat.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.change >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-lg ${stat.color} text-white flex-shrink-0`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sales Overview
            </h3>
            <div className="text-sm text-gray-500">Last 10 months</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, "Sales"]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sales by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: LabelProps) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Percentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Products
          </h3>
          <div className="space-y-4">
            {stats.topProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units</p>
                </div>
                <p className="font-medium text-green-600">
                  ${product.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

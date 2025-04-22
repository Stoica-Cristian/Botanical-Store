import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AdminUser } from "../../types/admin";
import Loader from "../ui/Loader";
import ToastContainer, { ToastData } from "../ui/ToastContainer";

// Mock data for users
const mockUsers: AdminUser[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "customer",
    createdAt: "2023-08-15T10:15:00Z",
    lastLogin: "2023-10-25T14:30:00Z",
    orders: 5,
    status: "active",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    createdAt: "2023-05-10T09:20:00Z",
    lastLogin: "2023-10-28T09:45:00Z",
    orders: 0,
    status: "active",
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "customer",
    createdAt: "2023-09-05T11:30:00Z",
    lastLogin: "2023-10-20T16:15:00Z",
    orders: 2,
    status: "active",
  },
  {
    id: 4,
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "customer",
    createdAt: "2023-07-22T13:45:00Z",
    lastLogin: "2023-10-15T10:30:00Z",
    orders: 8,
    status: "active",
  },
  {
    id: 5,
    name: "Emily Davis",
    email: "emily@example.com",
    role: "customer",
    createdAt: "2023-08-30T15:20:00Z",
    lastLogin: "2023-10-26T11:20:00Z",
    orders: 3,
    status: "inactive",
  },
  {
    id: 6,
    name: "Michael Wilson",
    email: "michael@example.com",
    role: "customer",
    createdAt: "2023-06-18T08:15:00Z",
    lastLogin: "2023-09-15T14:10:00Z",
    orders: 1,
    status: "inactive",
  },
  {
    id: 7,
    name: "Sarah Brown",
    email: "sarah@example.com",
    role: "customer",
    createdAt: "2023-09-12T10:40:00Z",
    lastLogin: "2023-10-27T13:25:00Z",
    orders: 4,
    status: "active",
  },
  {
    id: 8,
    name: "James Miller",
    email: "james@example.com",
    role: "customer",
    createdAt: "2023-07-05T09:30:00Z",
    lastLogin: "2023-10-18T15:40:00Z",
    orders: 6,
    status: "active",
  },
];

const UsersManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof AdminUser>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Role and status options
  const roleOptions = ["All", "admin", "customer"];
  const statusOptions = ["All", "active", "inactive"];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call with setTimeout
        setTimeout(() => {
          setUsers(mockUsers);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching users data:", error);
        setError("Failed to load users. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term, role and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;

    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "email") {
      comparison = a.email.localeCompare(b.email);
    } else if (sortField === "role") {
      comparison = a.role.localeCompare(b.role);
    } else if (sortField === "orders") {
      comparison = a.orders - b.orders;
    } else if (sortField === "createdAt") {
      comparison =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "lastLogin" && a.lastLogin && b.lastLogin) {
      comparison =
        new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSortChange = (field: keyof AdminUser) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      try {
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        setShowDeleteModal(false);
        addToast("success", `User ${selectedUser.name} deleted successfully`);
      } catch (error) {
        console.error("Error deleting user:", error);
        addToast("error", "Failed to delete user. Please try again.");
      }
    }
  };

  const handleUpdateUser = (updatedUser: AdminUser) => {
    try {
      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setShowUserModal(false);
      addToast("success", `User ${updatedUser.name} updated successfully`);
    } catch (error) {
      console.error("Error updating user:", error);
      addToast("error", "Failed to update user. Please try again.");
    }
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

  // Render sort indicator for table headers
  const renderSortIndicator = (field: keyof AdminUser) => {
    if (sortField !== field) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronDownIcon className="h-4 w-4 text-accent transform rotate-180" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-accent" />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return <Loader size="lg" text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-800 font-medium text-lg">{error}</p>
        <button
          className="mt-4 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-medium text-gray-900">Users Manager</h2>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={clearSearch}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div>
          <select
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-accent focus:border-accent"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === "All"
                  ? "All Roles"
                  : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
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

      {/* Users Table */}
      <div className="overflow-x-auto bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("name")}
              >
                <div className="flex items-center">
                  <span>User</span>
                  {renderSortIndicator("name")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("role")}
              >
                <div className="flex items-center">
                  <span>Role</span>
                  {renderSortIndicator("role")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("createdAt")}
              >
                <div className="flex items-center">
                  <span>Joined</span>
                  {renderSortIndicator("createdAt")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("lastLogin")}
              >
                <div className="flex items-center">
                  <span>Last Login</span>
                  {renderSortIndicator("lastLogin")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("orders")}
              >
                <div className="flex items-center">
                  <span>Orders</span>
                  {renderSortIndicator("orders")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("status")}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {renderSortIndicator("status")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === "admin" ? (
                        <ShieldCheckIcon className="h-5 w-5 text-accent mr-1" />
                      ) : null}
                      <span className="text-sm text-gray-900">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-accent hover:text-accent/80 transition-colors"
                        onClick={() => handleEditUser(user)}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteUser(user)}
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
                  No users found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {sortedUsers.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-3">
                Showing {indexOfFirstUser + 1} to{" "}
                {Math.min(indexOfLastUser, sortedUsers.length)} of{" "}
                {sortedUsers.length} users
              </span>
              <select
                className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-accent focus:border-accent"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                {[5, 10, 25].map((value) => (
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

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowUserModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <UserForm
              user={selectedUser}
              onSave={handleUpdateUser}
              onCancel={() => setShowUserModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Delete
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDeleteModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the user{" "}
                <span className="font-semibold">{selectedUser.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface UserFormProps {
  user: AdminUser;
  onSave: (user: AdminUser) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...user });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        >
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default UsersManager;

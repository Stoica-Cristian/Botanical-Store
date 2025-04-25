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
  EyeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { User } from "../../types/user";
import Loader from "../ui/Loader";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";

interface AdminUserView extends User {
  name?: string;
  orders?: number;
  status: "active" | "inactive";
}

const UsersManager = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof AdminUserView>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { user } = useAuth();

  const roleOptions = ["All", "admin", "user"];
  const statusOptions = ["All", "active", "inactive"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getUsers(user?.id || "");

      const userData = response?.data || [];

      const transformedUsers: AdminUserView[] = userData.map(
        (user: any, index: number) => {
          const userId =
            user.id ||
            user._id ||
            user.userId ||
            user.user_id ||
            `user-${index}`;

          const transformedUser = {
            ...user,
            id: userId,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            orders: 0,
          };

          return transformedUser;
        }
      );

      setUsers(transformedUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users data:", error);
      setError("An error occurred while loading users. Please try again.");
      setLoading(false);
    }
  };

  // Filter users based on search term, role and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;

    if (sortField === "id") {
      comparison = a.id.localeCompare(b.id);
    } else if (sortField === "name" && a.name && b.name) {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "email") {
      comparison = a.email.localeCompare(b.email);
    } else if (sortField === "role") {
      comparison = a.role.localeCompare(b.role);
    } else if (
      sortField === "orders" &&
      a.orders !== undefined &&
      b.orders !== undefined
    ) {
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

  const handleSortChange = (field: keyof AdminUserView) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditUser = (user: AdminUserView) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: AdminUserView) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await userService.deleteUser(selectedUser.id, user?.id || "");
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        setShowDeleteModal(false);
        addToast(
          "success",
          `User ${
            selectedUser.name || selectedUser.email
          } has been deleted successfully`
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        addToast(
          "error",
          "An error occurred while deleting the user. Please try again."
        );
      }
    }
  };

  const handleUpdateUser = async (updatedUser: AdminUserView) => {
    try {
      await userService.updateUser(updatedUser, user?.id || "");

      setUsers(
        users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setShowUserModal(false);
      addToast(
        "success",
        `User ${
          updatedUser.name || updatedUser.email
        } has been updated successfully`
      );
    } catch (error) {
      console.error("Error updating user:", error);
      addToast(
        "error",
        "An error occurred while updating the user. Please try again."
      );
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

  // Render sort indicator pentru headere tabel
  const renderSortIndicator = (field: keyof AdminUserView) => {
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
    try {
      if (!dateString) return "Undefined";

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Format error";
    }
  };

  const handleViewProfile = (user: AdminUserView) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleCreateUser = () => {
    // Create an empty user template
    const newUser: AdminUserView = {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      name: "",
      role: "user",
      phoneNumber: "",
      status: "active",
      orders: 0,
      avatar: "",
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setSelectedUser(newUser);
    setShowCreateUserModal(true);
  };

  const handleSaveNewUser = async (userData: AdminUserView) => {
    try {
      const response = await userService.createUser(
        {
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          role: userData.role,
          phoneNumber: userData.phoneNumber || "",
          status: userData.status,
          password: "defaultPassword123", // Default password - should be changed by user
        },
        user?.id || ""
      );

      // Add the new user to the list with the returned data
      const newUser: AdminUserView = {
        ...response,
        id: response.id || response._id,
        name: `${response.firstName || ""} ${response.lastName || ""}`.trim(),
        status: "active",
        orders: 0,
        lastLogin: new Date().toISOString(),
      };

      setUsers([...users, newUser]);
      setShowCreateUserModal(false);
      addToast(
        "success",
        `User ${newUser.name || newUser.email} has been created successfully`
      );
    } catch (error) {
      console.error("Error creating user:", error);
      addToast(
        "error",
        "An error occurred while creating the user. Please try again."
      );
    }
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
          onClick={fetchUsers}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-medium text-gray-900">User Management</h2>
        <button
          onClick={handleCreateUser}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg flex items-center transition-colors"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Create User
        </button>
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
                  : role === "admin"
                  ? "Administrator"
                  : "User"}
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
                  : status === "active"
                  ? "Active"
                  : "Inactive"}
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
                onClick={() => handleSortChange("id")}
              >
                <div className="flex items-center">
                  <span>ID</span>
                  {renderSortIndicator("id")}
                </div>
              </th>
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
                onClick={() => handleSortChange("orders")}
              >
                <div className="flex items-center">
                  <span>Orders</span>
                  {renderSortIndicator("orders")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange("lastLogin")}
              >
                <div className="flex items-center">
                  <span>Last Activity</span>
                  {renderSortIndicator("lastLogin")}
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
              currentUsers.map((user, index) => (
                <tr
                  key={user.id || `user-row-${index}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-sm text-gray-500 font-mono cursor-help"
                      title={user.id || "No ID available"}
                    >
                      {user.id
                        ? user.id.length > 8
                          ? `${user.id.substring(0, 8)}...`
                          : user.id
                        : "No ID"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || user.email}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
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
                        {user.role === "admin" ? "Administrator" : "User"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === "admin" ? (
                      <span className="font-medium text-accent">N/A</span>
                    ) : (
                      <span>{user.orders || 0}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        onClick={() => handleViewProfile(user)}
                        title="View Profile"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-accent hover:text-accent/80 transition-colors"
                        onClick={() => handleEditUser(user)}
                        title="Edit User"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-600 transition-colors"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete User"
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
                    key={`page-${pageNum}`}
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

      {/* Profile View Modal */}
      {showProfileModal && selectedUser && (
        <div
          className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                User Profile
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowProfileModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name || selectedUser.email}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-gray-600" />
                  )}
                </div>
              </div>

              <div className="text-center mb-4">
                <h4 className="text-xl font-medium text-gray-900">
                  {selectedUser.name || "N/A"}
                </h4>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium flex items-center">
                    {selectedUser.role === "admin" ? (
                      <>
                        <ShieldCheckIcon className="h-4 w-4 text-accent mr-1" />
                        Administrator
                      </>
                    ) : (
                      "User"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p
                    className={`font-medium ${
                      selectedUser.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedUser.status === "active" ? "Active" : "Inactive"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {selectedUser.phoneNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p
                    className="font-medium text-xs truncate"
                    title={selectedUser.id}
                  >
                    {selectedUser.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Activity</p>
                  <p className="font-medium">
                    {selectedUser.lastLogin
                      ? formatDate(selectedUser.lastLogin)
                      : "Never"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="font-medium">
                    {selectedUser.role === "admin"
                      ? "N/A"
                      : selectedUser.orders || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div
          className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowUserModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div
          className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Deletion
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
                <span className="font-semibold">
                  {selectedUser.name || selectedUser.email}
                </span>
                ?
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

      {/* Create User Modal */}
      {showCreateUserModal && selectedUser && (
        <div
          className="fixed inset-0 bg-gray-500/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateUserModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Create New User
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreateUserModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <UserForm
              user={selectedUser}
              onSave={handleSaveNewUser}
              onCancel={() => setShowCreateUserModal(false)}
              isNewUser={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface UserFormProps {
  user: AdminUserView;
  onSave: (user: AdminUserView) => void;
  onCancel: () => void;
  isNewUser?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onCancel,
  isNewUser = false,
}) => {
  const [formData, setFormData] = useState({
    ...user,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    password: isNewUser ? "" : undefined,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "firstName" || name === "lastName") {
        newData.name = `${name === "firstName" ? value : prev.firstName} ${
          name === "lastName" ? value : prev.lastName
        }`.trim();
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
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

      {isNewUser && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
            placeholder="Leave empty for default password"
          />
          <p className="text-xs text-gray-500 mt-1">
            If left empty, a default password will be set which the user should
            change.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-accent focus:border-accent"
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
          <option value="admin">Administrator</option>
          <option value="user">User</option>
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
          {isNewUser ? "Create User" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default UsersManager;

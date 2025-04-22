import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminLayout from "../components/admin/AdminLayout";
import Dashboard from "../components/admin/Dashboard";
import ProductsManager from "../components/admin/ProductsManager";
import OrdersManager from "../components/admin/OrdersManager";
import UsersManager from "../components/admin/UsersManager";
import Settings from "../components/admin/Settings";

const Admin = () => {
  const { section = "dashboard" } = useParams();
  const { user, loading } = useAuth();

  console.log("Admin component - User role:", user?.role);

  // Check if user is logged in and has admin rights
  if (!loading && (!user || user.role !== "admin")) {
    console.log("Redirecting to login - User is not admin");
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const renderContent = () => {
    switch (section) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductsManager />;
      case "orders":
        return <OrdersManager />;
      case "users":
        return <UsersManager />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
};

export default Admin;

import { Link, useLocation } from "react-router-dom";
import {
  Squares2X2Icon,
  ShoppingBagIcon,
  UserGroupIcon,
  CubeIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const AdminSidebar = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <Squares2X2Icon className="w-6 h-6" />,
    },
    {
      path: "/admin/products",
      label: "Products",
      icon: <CubeIcon className="w-6 h-6" />,
    },
    {
      path: "/admin/orders",
      label: "Orders",
      icon: <ShoppingBagIcon className="w-6 h-6" />,
    },
    {
      path: "/admin/users",
      label: "Users",
      icon: <UserGroupIcon className="w-6 h-6" />,
    },
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <Cog6ToothIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Botanical Store</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-accent text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          to="/login"
          className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className="ml-3">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;

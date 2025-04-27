import { useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/store", label: "Store" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const activeClass =
  "text-accent border-b-2 border-accent rounded-br-none rounded-bl-none bg-accent/10 px-4 py-2 transition-all duration-300";

const menuActiveClass = "text-accent bg-accent/10 rounded-lg";

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { totalItems } = useCart();

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "User";

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="navbar bg-white shadow-2xs h-25 px-10 md:px-20 lg:px-30 xl:px-40 2xl:px-50 pt-3 flex justify-between z-50 relative">
      <div className="navbar-start flex items-center justify-start -mt-1">
        <Link to="/" className="w-24 sm:w-28 md:w-32">
          <img src={logo} alt="logo" />
        </Link>
      </div>
      {/* Navbar center */}
      <div className="navbar-center flex items-center">
        <ul className="menu menu-horizontal space-x-5 text-lg hidden xl:flex">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`font-bold hover:text-accent hover:bg-accent/5 px-4 py-2 rounded-md transition-all duration-300 ${
                  isActive(link.path) ? activeClass : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Navbar end */}
      <div className="navbar-end flex items-center justify-end shrink space-x-8 mt-2">
        <div className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <div className="dropdown dropdown-end mb-1.5 mr-7">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="mask mask-squircle w-10">
                    <img
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          fullName
                        )}&background=random&color=fff`
                      }
                      alt={fullName}
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content rounded-box w-52 backdrop-blur-md bg-white/70"
                >
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 py-3 hover:bg-accent/10"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile/orders"
                      className="flex items-center gap-2 py-3 hover:bg-accent/10"
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile/settings"
                      className="flex items-center gap-2 py-3 hover:bg-accent/10"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 py-3 text-red-600 hover:bg-red-50 w-full"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>

              <Link
                to="/wishlist"
                className="tooltip tooltip-bottom"
                data-tip="Wishlist"
              >
                <div className="indicator -space-x-2">
                  {wishlist.length > 0 && (
                    <span className="indicator-item badge badge-accent scale-60">
                      {wishlist.length}
                    </span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </div>
              </Link>
              <Link
                to="/cart"
                className="tooltip tooltip-bottom"
                data-tip="Shopping Cart"
              >
                <div className="indicator -space-x-2">
                  {totalItems > 0 && (
                    <span className="indicator-item badge badge-accent scale-60">
                      {totalItems}
                    </span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </div>
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn btn-accent text-white mb-2 ml-2">
              Login
            </Link>
          )}
        </div>

        <div className="dropdown dropdown-end xl:hidden mb-2 ml-2">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content rounded-box z-1 mt-3 w-64 p-4 shadow-lg bg-white"
          >
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`font-bold py-3 rounded-lg ${
                    isActive(link.path) ? menuActiveClass : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <div className="md:hidden">
              <div className="divider my-4"></div>
              <li>
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 py-3 rounded-lg"
                  >
                    <div className="avatar">
                      <div className="mask mask-squircle w-8 -ml-1.5">
                        <img
                          src={
                            user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              fullName
                            )}&background=random&color=fff`
                          }
                          alt={fullName}
                        />
                      </div>
                    </div>
                    <span className="font-medium">Profile</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 py-3 rounded-lg ml-2"
                  >
                    <span className="font-semibold">Login</span>
                  </Link>
                )}
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-3 py-3 rounded-lg"
                    >
                      <div className="indicator">
                        {wishlist.length > 0 && (
                          <span className="indicator-item badge badge-accent scale-75">
                            {wishlist.length}
                          </span>
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">Wishlist</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/cart"
                      className="flex items-center gap-3 py-3 rounded-lg"
                    >
                      <div className="indicator">
                        {totalItems > 0 && (
                          <span className="indicator-item badge badge-accent scale-75">
                            {totalItems}
                          </span>
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">Shopping Cart</span>
                    </Link>
                  </li>
                </>
              )}
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

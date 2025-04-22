import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Store from "./pages/Store";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import FAQ from "./pages/FAQ";
import Admin from "./pages/Admin";
import ScrollToTop from "./components/ui/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/profile/Orders";
import Wishlist from "./pages/profile/Wishlist";
import PaymentMethods from "./pages/profile/PaymentMethods";
import Addresses from "./pages/profile/Addresses";
import Settings from "./pages/profile/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/store" element={<Store />} />
        <Route path="/store/product/:id" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders" element={<Orders />} />
        <Route path="/profile/wishlist" element={<Wishlist />} />
        <Route path="/profile/payment-methods" element={<PaymentMethods />} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/profile/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/:section" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

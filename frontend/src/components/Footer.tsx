import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Effect to clear the message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ text: "", type: "" });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ text: "Thank you for subscribing!", type: "success" });
      setEmail("");
    } catch (error) {
      setMessage({
        text: "Failed to subscribe. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-50 text-gray-600">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">
              BOTANICAL STORE
            </h3>
            <p className="text-gray-500 leading-relaxed">
              Transform your space with our carefully curated collection of
              plants. Making homes beautiful and bringing nature indoors since
              2024.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-accent group-hover:text-accent/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-accent group-hover:text-accent/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors group"
              >
                <svg
                  className="w-5 h-5 text-accent group-hover:text-accent/80"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 font-semibold text-lg mb-6">
              Navigation
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/store"
                  className="hover:text-accent transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-accent transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-semibold text-lg mb-6">
              Help & Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link to="/faq" className="hover:text-accent transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/faq#shipping"
                  className="hover:text-accent transition-colors"
                >
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  to="/faq#returns"
                  className="hover:text-accent transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/faq#size-guide"
                  className="hover:text-accent transition-colors"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gray-900 font-semibold text-lg mb-6">
              Stay Connected
            </h4>
            <p className="text-gray-500 mb-4">
              Join our newsletter for exclusive offers and plant care tips.
            </p>
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent 
                          transition-all duration-300 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className={`w-full px-4 py-3 bg-accent text-white rounded-xl 
                          transition-all duration-300 font-medium
                          ${
                            isSubmitting
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:bg-accent/90"
                          }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
              {message.text && (
                <div
                  className={`text-center py-2 px-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-accent text-white"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © 2025 Botanical Store. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm hover:text-accent transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm hover:text-accent transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="text-sm hover:text-accent transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

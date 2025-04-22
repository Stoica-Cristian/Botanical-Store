import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { HomeIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-accent">404</h1>
            <div className="h-2 w-24 bg-accent mx-auto my-6"></div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              We're sorry, but the page you're looking for doesn't exist or has
              been moved.
            </p>
          </div>

          <Link
            to="/"
            className="btn btn-accent text-white gap-2 inline-flex items-center justify-center px-6"
          >
            <HomeIcon className="h-5 w-5" />
            Back to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;

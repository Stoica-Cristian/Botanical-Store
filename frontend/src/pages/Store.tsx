import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Newsletter from "../components/dashboard/NewsletterSection";
import FilterSection from "../components/store/FilterSection";
import ProductGrid from "../components/store/ProductGrid";
import StoreHeader from "../components/store/StoreHeader";
import { Product } from "../types/product";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { productService } from "../services/productService";

const Store = () => {
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        // Extract unique categories and sort them alphabetically
        const uniqueCategories = Array.from(
          new Set(products.map((product) => product.category))
        ).sort();
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching products for categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Memoize the filter function to prevent unnecessary re-renders
  const getFilteredProducts = useCallback(
    (products: Product[]) => {
      return products.filter((product) => {
        // Price filter
        const meetsPrice =
          product.price >= priceRange[0] && product.price <= priceRange[1];

        // Category filter
        const meetsCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(product.category);

        // Search filter
        const meetsSearch =
          searchQuery === "" ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Rating filter
        const meetsRating =
          !selectedRating || Math.floor(product.rating) >= selectedRating;

        return meetsPrice && meetsCategory && meetsSearch && meetsRating;
      });
    },
    [priceRange, selectedCategories, searchQuery, selectedRating]
  );

  // Handle filter reset
  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategories([]);
    setSearchQuery("");
    setSelectedRating(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <StoreHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-80 order-1 lg:order-1">
              <FilterSection
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedRating={selectedRating}
                setSelectedRating={setSelectedRating}
                onClearFilters={handleClearFilters}
                categories={categories}
                isLoading={loading}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 order-2 lg:order-2">
              <ProductGrid getFilteredProducts={getFilteredProducts} />
            </div>
          </div>
        </div>
      </main>
      <Newsletter />
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-all duration-300 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Store;

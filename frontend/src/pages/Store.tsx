import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Newsletter from "../components/dashboard/NewsletterSection";
import FilterSection from "../components/store/FilterSection";
import ProductGrid from "../components/store/ProductGrid";
import StoreHeader from "../components/store/StoreHeader";
import { Product } from "../types/product";

const Store = () => {
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Function to apply all filters
  const getFilteredProducts = (products: Product[]) => {
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
  };

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
    </div>
  );
};

export default Store;

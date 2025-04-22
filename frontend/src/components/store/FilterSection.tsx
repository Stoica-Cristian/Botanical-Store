import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  StarIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface FilterSectionProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRating: number | null;
  setSelectedRating: (rating: number | null) => void;
  onClearFilters: () => void;
}

const FilterSection = ({
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  searchQuery,
  setSearchQuery,
  selectedRating,
  setSelectedRating,
  onClearFilters,
}: FilterSectionProps) => {
  const categories = [
    "Indoor Plants",
    "Outdoor Plants",
    "Succulents",
    "Flowering Plants",
    "Herbs",
    "Fruit Trees",
    "Plant Care",
    "Pots & Planters",
    "Garden Tools",
    "Seeds & Bulbs",
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category]
    );
  };

  return (
    <div className="w-80 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-4 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <XMarkIcon className="h-4 w-4" />
          Clear all
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 bg-gray-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Categories</h3>
          <span className="text-xs text-gray-500">
            {selectedCategories.length} selected
          </span>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center group cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-accent peer-checked:bg-accent transition duration-200 flex items-center justify-center">
                  {selectedCategories.includes(category) && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition duration-200">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range</h3>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-24 pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 bg-gray-50"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              min={priceRange[0]}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-24 pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent transition duration-200 bg-gray-50"
            />
          </div>
        </div>
        <div className="mt-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center group cursor-pointer"
            >
              <div className="relative">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-accent peer-checked:bg-accent transition duration-200 flex items-center justify-center">
                  {selectedRating === rating && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="ml-3 flex items-center">
                <div className="flex">
                  {[...Array(rating)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition duration-200">
                  & up
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;

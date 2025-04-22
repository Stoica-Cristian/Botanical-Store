import { ChevronRightIcon } from "@heroicons/react/20/solid";
import store_header from "../../assets/store_header.jpg";

const StoreHeader = () => {
  return (
    <div
      className="relative h-[250px] sm:h-[300px] md:h-[400px] flex items-center justify-center"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      {/* Background Image */}
      <div className="absolute w-[95%] sm:w-[90%] md:w-[80%] max-w-6xl h-full left-1/2 -translate-x-1/2">
        <img
          src={store_header}
          alt="Store Header"
          className="w-full h-full object-contain object-center rounded-lg"
        />
      </div>

      {/* Content */}
      <div className="relative text-center z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
          Shop
        </h1>
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base text-gray-600">
          <span>Home</span>
          <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-accent">Shop</span>
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;

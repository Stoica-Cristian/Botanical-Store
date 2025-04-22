import flower from "../../assets/dashboard/flower.png";
import { Link } from "react-router-dom";

const DashboardIntroBlockSection = () => {
  return (
    <div className="flex relative h-4/5 justify-center items-center">
      <div className="flex flex-col gap-10 justify-center h-full w-full sm:w-2/3 px-20 sm:px-10 md:px-10 lg:px-0">
        <div className="border-l-10 border-accent px-3">
          <h5 className="text-lg sm:text-xl md:text-2xl font-semibold">
            WELCOME TO BOTANICAL
          </h5>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Plants Gonna Make<br></br>People Happy.
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl">
          We believe that plants have the power to transform spaces and uplift
          spirits. Our carefully curated collection of botanical wonders brings
          nature's beauty to your doorstep. Discover the perfect green companion
          for your home today.
        </p>
        <Link to="/store">
          <button
            className="btn btn-accent w-40 sm:w-45 h-11 sm:h-13 mt-4 flex gap-3 items-center justify-center text-white rounded-full shadow-lg hover:shadow-xl transition duration-300 ease-in-out"
            aria-label="Shop Now"
          >
            <div className="text-base sm:text-lg">Shop Now</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={4}
              stroke="currentColor"
              className="w-3 h-3 sm:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </Link>
      </div>
      <div className="absolute left-110 w-2/3 hidden xl:block">
        <img src={flower} alt="Decorative flower" className="overflow-hidden" />
      </div>
    </div>
  );
};

export default DashboardIntroBlockSection;

import { useState, useEffect } from "react";
import reviewService from "../../services/reviewService";
import { Review } from "../../types/product";

const DashboardTestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const recentReviews = await reviewService.getRecentReviews();
        setReviews(recentReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === reviews.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((current) =>
      current === 0 ? reviews.length - 1 : current - 1
    );
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading customer reviews...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our customers' experiences and see why we're their
            preferred choice
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Carousel with Navigation Arrows */}
          <div className="relative w-full max-w-4xl">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 lg:-translate-x-16
                         w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg z-10 hover:bg-gray-50
                         transition-all duration-300 hover:scale-110 group"
              aria-label="Previous testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-6 sm:h-6 mx-auto text-gray-600 group-hover:text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Carousel Content */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="w-full flex-shrink-0 px-2 sm:px-4"
                  >
                    <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
                      <div className="flex items-center mb-6">
                        {review.user.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center">
                            <span className="text-accent text-xl font-bold">
                              {review.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <h4 className="font-bold text-base sm:text-lg">
                            {review.user.name}
                          </h4>
                          <p className="text-gray-600 text-sm sm:text-base">
                            Verified Buyer
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 text-sm sm:text-base">
                        {review.comment}
                      </p>
                      <div className="flex text-accent">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 lg:translate-x-16
                         w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg z-10 hover:bg-gray-50
                         transition-all duration-300 hover:scale-110 group"
              aria-label="Next testimonial"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 sm:w-6 sm:h-6 mx-auto text-gray-600 group-hover:text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            {/* Dots Navigation */}
            <div className="flex justify-center mt-8 gap-3">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 
                    ${
                      activeIndex === index
                        ? "bg-accent w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardTestimonialsSection;

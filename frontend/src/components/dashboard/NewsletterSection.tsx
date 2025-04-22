import bg from "../../assets/dashboard/nl_bg.jpg";
import { useState, useEffect } from "react";

const DashboardNewsletterSection = () => {
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
    <section
      className="relative py-32"
      style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      ></div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold mb-4 leading-tight">
              Join Our Newsletter
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals. Be the first to know about our newest
              collections.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="sm:flex-1 h-[60px] px-8 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent
                        transition-all duration-300 text-lg shadow-sm hover:shadow-md bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className={`h-[60px] btn btn-accent text-white px-12 rounded-xl 
                             transition-all duration-300 text-lg font-semibold shadow-lg
                             ${
                               isSubmitting
                                 ? "opacity-70 cursor-not-allowed"
                                 : "hover:bg-accent/90 hover:shadow-xl hover:translate-y-[-2px]"
                             }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </button>
            </div>

            {message.text && (
              <div
                className={`text-center py-2 px-4 rounded-lg max-w-2xl mx-auto ${
                  message.type === "success"
                    ? "bg-accent text-white"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}
          </form>

          <div
            className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-3 
                        bg-white/80 backdrop-blur-sm py-4 px-6 rounded-full mx-auto w-fit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-accent"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.714Z"
              />
            </svg>
            <p>We respect your privacy. Unsubscribe at any time.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm
                          hover:bg-white/80 transition-all duration-300 group"
            >
              <div
                className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 
                            transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-accent"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg">Weekly Updates</span>
              <p className="text-gray-600 text-center">
                Get the latest news every week
              </p>
            </div>

            <div
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/30 backdrop-blur-sm hover:bg-white/80 
                          transition-all duration-300 group"
            >
              <div
                className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 
                            transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-accent"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 12 0a2.625 2.625 0 0 0 0 4.875Z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg">Exclusive Offers</span>
              <p className="text-gray-600 text-center">
                Special deals just for subscribers
              </p>
            </div>

            <div
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/30 backdrop-blur-sm hover:bg-white/80 
                          transition-all duration-300 group"
            >
              <div
                className="p-4 bg-accent/10 rounded-full group-hover:bg-accent/20 
                            transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-accent"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg">Premium Content</span>
              <p className="text-gray-600 text-center">
                Access to exclusive content
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardNewsletterSection;

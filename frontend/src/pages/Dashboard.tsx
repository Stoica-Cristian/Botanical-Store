import bg from "../assets/dashboard/bg.jpg";
import DashboardIntroBlockSection from "../components/dashboard/IntroBlockSection";
import DashboardChooseUsSection from "../components/dashboard/ChooseUsSection";
import DashboardFacilitiesSection from "../components/dashboard/FacilitiesSection";
import DashboardNewArrivalSection from "../components/dashboard/NewArrivalSection";
import DashboardTestimonialsSection from "../components/dashboard/TestimonialsSection";
import DashboardNewsletterSection from "../components/dashboard/NewsletterSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  return (
    <div>
      <div
        className="bg-cover bg-center w-full h-screen"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <Navbar />
        <DashboardIntroBlockSection />
      </div>
      <DashboardChooseUsSection />
      <DashboardFacilitiesSection />
      <DashboardNewArrivalSection />
      <DashboardTestimonialsSection />
      <DashboardNewsletterSection />
      <Footer />

      {/* Buton Scroll to Top */}
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

export default Dashboard;

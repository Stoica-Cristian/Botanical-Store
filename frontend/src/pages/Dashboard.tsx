import bg from "../assets/dashboard/bg.jpg";
import DashboardIntroBlockSection from "../components/dashboard/IntroBlockSection";
import DashboardChooseUsSection from "../components/dashboard/ChooseUsSection";
import DashboardFacilitiesSection from "../components/dashboard/FacilitiesSection";
import DashboardNewArrivalSection from "../components/dashboard/NewArrivalSection";
import DashboardTestimonialsSection from "../components/dashboard/TestimonialsSection";
import DashboardNewsletterSection from "../components/dashboard/NewsletterSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
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
    </div>
  );
};

export default Dashboard;

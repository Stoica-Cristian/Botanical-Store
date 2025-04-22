import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  HeartIcon,
  GlobeAltIcon,
  BeakerIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-32 bg-gradient-to-br from-accent/20 via-accent/10 to-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/src/assets/dashboard/flower.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/30"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center transform transition-all duration-700 hover:scale-105">
              <h1 className="text-5xl font-bold mb-6 text-accent drop-shadow-md">
                Our Story
              </h1>
              <p className="text-xl text-gray-600">
                Bringing nature's beauty into your home, one plant at a time.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-8 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <ShoppingBagIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-gray-900">10k+</div>
                <div className="text-gray-600">Plants Sold</div>
              </div>
              <div className="text-center p-8 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <UserGroupIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-gray-900">5k+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center p-8 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center p-8 rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <TruckIcon className="h-8 w-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-gray-900">24h</div>
                <div className="text-gray-600">Delivery Time</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto fade-in transition-opacity duration-500">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-12 text-center">
                At Botanical Store, we believe that plants have the power to
                transform spaces and uplift spirits. Our mission is to make the
                joy of plant ownership accessible to everyone, from seasoned
                plant parents to those just beginning their green journey.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="p-4 bg-accent/10 rounded-full w-fit mb-6">
                    <BeakerIcon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Quality Plants</h3>
                  <p className="text-gray-600">
                    We source only the healthiest and most vibrant plants from
                    trusted growers.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="p-4 bg-accent/10 rounded-full w-fit mb-6">
                    <SparklesIcon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Expert Care</h3>
                  <p className="text-gray-600">
                    Our team of plant experts is here to help you succeed in
                    your plant journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto fade-in transition-opacity duration-500">
              <h2 className="text-3xl font-bold mb-12 text-center">
                Meet Our Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-accent/10">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    Sarah Green
                  </h3>
                  <p className="text-accent text-center mb-4">Plant Expert</p>
                  <p className="text-gray-600 text-center text-sm">
                    Passionate about helping others discover the joy of plant
                    care.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-accent/10">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    Michael Bloom
                  </h3>
                  <p className="text-accent text-center mb-4">Horticulturist</p>
                  <p className="text-gray-600 text-center text-sm">
                    Expert in plant care and sustainable gardening practices.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-accent/10">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                      alt="Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    Emma Rose
                  </h3>
                  <p className="text-accent text-center mb-4">Customer Care</p>
                  <p className="text-gray-600 text-center text-sm">
                    Dedicated to providing exceptional service to our customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto fade-in transition-opacity duration-500">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="p-4 bg-accent/10 rounded-full w-fit mb-6">
                    <HeartIcon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Passion</h3>
                  <p className="text-gray-600">
                    We're passionate about plants and sharing that passion with
                    our community.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="p-4 bg-accent/10 rounded-full w-fit mb-6">
                    <GlobeAltIcon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Sustainability</h3>
                  <p className="text-gray-600">
                    We're committed to sustainable practices in everything we
                    do.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                  <div className="p-4 bg-accent/10 rounded-full w-fit mb-6">
                    <SparklesIcon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                  <p className="text-gray-600">
                    We're always looking for new ways to enhance your plant
                    experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

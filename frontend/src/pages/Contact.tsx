import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-accent/20 via-accent/10 to-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/src/assets/dashboard/flower.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/30"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 text-accent drop-shadow-md">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600">
                Have questions or need assistance? We're here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <MapPinIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Our Location
                </h3>
                <p className="text-gray-600 text-center">
                  123 Plant Street, Bucharest
                  <br />
                  Romania
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <PhoneIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Phone Number
                </h3>
                <p className="text-gray-600 text-center">
                  +40 123 456 789
                  <br />
                  Mon-Fri: 9am to 5pm
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-accent/10">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  Email Address
                </h3>
                <p className="text-gray-600 text-center">
                  info@botanicalstore.com
                  <br />
                  support@botanicalstore.com
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-2 text-center">
                Get In Touch
              </h2>
              <p className="text-gray-600 text-center mb-12">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-accent/10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isSubmitted ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold text-center mb-2">
                          Message Sent!
                        </h3>
                        <p className="text-gray-600 text-center">
                          Thank you for contacting us. We'll get back to you
                          soon.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Your Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Your Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Subject
                          </label>
                          <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            placeholder="Plant care question"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Message
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
                            placeholder="Your message here..."
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 px-4 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
                        >
                          Send Message
                        </button>
                      </>
                    )}
                  </form>
                </div>

                {/* Map */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-accent/10 h-[450px] overflow-hidden">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d91158.11092911719!2d26.030923!3d44.439663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b1f93abf3cad4f%3A0xac0632e37c9ca628!2sBucharest%2C%20Romania!5e0!3m2!1sen!2sus!4v1626956528395!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      title="Botanical Store Location"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Hours */}
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-accent/10">
              <h3 className="text-xl font-semibold text-center mb-6">
                Store Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                  <h4 className="font-medium mb-2">Weekdays</h4>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 7:00 PM
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2">Weekends</h4>
                  <p className="text-gray-600">Saturday: 10:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
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

export default Contact;

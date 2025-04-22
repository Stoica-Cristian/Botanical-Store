import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TruckIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

interface FAQItem {
  id: number;
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

const FAQ = () => {
  const [openItemId, setOpenItemId] = useState<number | null>(null);
  const location = useLocation();

  const handleToggle = (id: number) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - 40;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 300);
      }
    }
  }, [location]);

  const faqItems: FAQItem[] = [
    // Plant Care
    {
      id: 1,
      question: "How often should I water my plants?",
      answer: (
        <>
          <p>Watering frequency depends on several factors:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              The type of plant (succulents need less water than tropical
              plants)
            </li>
            <li>The season (plants typically need less water in winter)</li>
            <li>The pot size and material</li>
            <li>Indoor conditions like humidity and temperature</li>
          </ul>
          <p className="mt-2">
            As a general rule, check the soil moisture with your finger. If the
            top 1-2 inches feel dry, it's usually time to water. It's better to
            underwater than overwater, as overwatering is the most common cause
            of plant death.
          </p>
        </>
      ),
      category: "Plant Care",
    },
    {
      id: 2,
      question: "How much light do indoor plants need?",
      answer:
        "Different plants have different light requirements. Plants labeled as 'low light' can survive in areas with minimal natural light, though they might grow slowly. Medium-light plants need bright, indirect light, while high-light plants require several hours of direct sunlight daily. Check the care instructions for your specific plant, and observe how it responds to its current light conditions.",
      category: "Plant Care",
    },
    {
      id: 3,
      question: "Should I fertilize my indoor plants?",
      answer:
        "Yes, indoor plants benefit from fertilization since potting soil's nutrients deplete over time. Use a balanced liquid fertilizer during the growing season (spring and summer) according to package instructions. Reduce or stop fertilizing in fall and winter when plant growth naturally slows. Over-fertilizing can damage plants, so it's better to under-fertilize than over-fertilize.",
      category: "Plant Care",
    },
    {
      id: 4,
      question: "How do I know if my plant is healthy?",
      answer:
        "A healthy plant typically has vibrant foliage, sturdy stems, and new growth. Signs of problems include yellowing leaves, brown spots, wilting despite adequate water, stunted growth, or visible pests. Regular inspection of your plants can help catch issues early. Remember that some leaf drop is normal, especially when seasons change or after a plant is moved to a new location.",
      category: "Plant Care",
    },
    // Shipping Information
    {
      id: 5,
      question: "How do you ship live plants?",
      answer:
        "We carefully package plants to ensure they arrive in excellent condition. Each plant is secured in its pot with breathable material and placed in protective packaging to prevent damage. During extreme weather conditions, we may delay shipments or use heat packs/insulation to protect plants from temperature damage.",
      category: "Shipping",
    },
    {
      id: 6,
      question: "What are your shipping rates?",
      answer: (
        <>
          <p>
            Our shipping rates are calculated based on your location and order
            size:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Standard Shipping (5-7 business days): From $5.99</li>
            <li>Express Shipping (2-3 business days): From $12.99</li>
            <li>FREE shipping on orders over $75 (standard shipping only)</li>
          </ul>
          <p className="mt-2">
            International shipping is available to select countries with rates
            calculated at checkout.
          </p>
        </>
      ),
      category: "Shipping",
    },
    {
      id: 7,
      question: "How long will it take to receive my order?",
      answer:
        "Orders are typically processed within 1-2 business days. Once shipped, standard delivery takes 5-7 business days, while express shipping takes 2-3 business days. You'll receive a tracking number via email once your order ships. Please note that severe weather conditions might cause delays for the safety of your plants.",
      category: "Shipping",
    },
    // Returns & Exchanges
    {
      id: 8,
      question: "What is your return policy?",
      answer: (
        <>
          <p>We want you to be completely satisfied with your purchase:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              If plants arrive damaged, please contact us within 48 hours with
              photos
            </li>
            <li>
              Non-plant items can be returned within 30 days in new, unused
              condition
            </li>
            <li>Custom or made-to-order items are non-returnable</li>
          </ul>
          <p className="mt-2">
            Refunds will be issued to the original payment method within 5-7
            business days after we receive and inspect the returned items.
          </p>
        </>
      ),
      category: "Returns",
    },
    {
      id: 9,
      question: "My plant arrived damaged. What should I do?",
      answer:
        "We're sorry to hear that! Please contact our customer service within 48 hours of delivery with photos of the damaged plant and packaging. We'll promptly arrange a replacement or refund. Please don't discard the plant or packaging until we've resolved the issue.",
      category: "Returns",
    },
    {
      id: 10,
      question: "Can I exchange my plant for a different variety?",
      answer:
        "While we don't offer direct exchanges for plants due to their perishable nature, we can arrange a return and refund so you can place a new order for your preferred variety. Please contact customer service within 7 days of receiving your order to initiate this process.",
      category: "Returns",
    },
    // Size Guide
    {
      id: 11,
      question: "What do pot sizes mean?",
      answer: (
        <>
          <p>
            Our pot sizes refer to the diameter of the pot at its widest point:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Small: 4-6 inches in diameter, ideal for small plants or starting
              new ones
            </li>
            <li>
              Medium: 8-10 inches in diameter, perfect for most houseplants
            </li>
            <li>
              Large: 12+ inches in diameter, suitable for statement plants or
              fast-growing species
            </li>
          </ul>
          <p className="mt-2">
            The overall plant height listed includes both the pot and the plant
            measured from the base of the pot to the top of the plant.
          </p>
        </>
      ),
      category: "Size Guide",
    },
    {
      id: 12,
      question: "How big will my plant grow?",
      answer:
        "Growth rates vary by species, care, and environmental conditions. Our product descriptions include the mature size each plant can potentially reach under ideal conditions. Remember that indoor plants typically grow more slowly than their outdoor counterparts. Regular repotting (every 1-2 years) into slightly larger containers will support healthy growth.",
      category: "Size Guide",
    },
    // General Questions
    {
      id: 13,
      question: "Are your plants safe for pets?",
      answer:
        "Many plants can be toxic to pets if ingested. We clearly label pet-friendly plants in our product descriptions. If you have pets, we recommend researching plant toxicity or shopping our 'Pet-Friendly Plants' collection. If you suspect your pet has ingested a toxic plant, contact your veterinarian immediately.",
      category: "General",
    },
    {
      id: 14,
      question: "Do you offer gift options?",
      answer:
        "Yes! You can add a personalized gift message at checkout. We also offer gift wrapping for an additional fee. Our plants make thoughtful, lasting gifts for any occasion. For corporate gifting or large orders, please contact our customer service team for special arrangements.",
      category: "General",
    },
    {
      id: 15,
      question: "How do I repot my plant?",
      answer: (
        <>
          <p>
            Repotting is best done in spring or summer when plants are actively
            growing:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>
              Choose a new pot 1-2 inches larger in diameter than the current
              one
            </li>
            <li>
              Water your plant 1-2 days before repotting to make removal easier
            </li>
            <li>
              Fill the new pot with fresh potting mix specific to your plant
              type
            </li>
            <li>
              Gently remove the plant from its current pot and loosen the root
              ball slightly
            </li>
            <li>
              Place in the new pot and fill with soil, leaving about an inch of
              space at the top
            </li>
            <li>
              Water thoroughly and place in a location with indirect light for a
              few days
            </li>
          </ol>
        </>
      ),
      category: "Plant Care",
    },
  ];

  // Group FAQ items by category
  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-accent/20 via-accent/10 to-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/src/assets/dashboard/flower.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/30"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-accent drop-shadow-md">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-gray-600">
                Find answers to common questions about our plants, care tips,
                shipping, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  id={category.toLowerCase().replace(/\s+/g, "-")}
                  className="mb-10"
                >
                  <div className="flex items-center gap-3 mb-6">
                    {category === "Plant Care" && (
                      <QuestionMarkCircleIcon className="h-7 w-7 text-accent" />
                    )}
                    {category === "Shipping" && (
                      <TruckIcon className="h-7 w-7 text-accent" />
                    )}
                    {category === "Returns" && (
                      <ArrowPathIcon className="h-7 w-7 text-accent" />
                    )}
                    {category === "Size Guide" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-7 w-7 text-accent"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                        />
                      </svg>
                    )}
                    {category === "General" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-7 w-7 text-accent"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                        />
                      </svg>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {faqItems
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                        >
                          <button
                            onClick={() => handleToggle(item.id)}
                            className="flex justify-between items-center w-full p-4 text-left focus:outline-none"
                          >
                            <span className="font-medium text-gray-900">
                              {item.question}
                            </span>
                            {openItemId === item.id ? (
                              <ChevronUpIcon className="h-5 w-5 text-accent" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </button>

                          {openItemId === item.id && (
                            <div className="px-4 pb-4 text-gray-600">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-6">
                Our team is here to help! Feel free to reach out if you couldn't
                find the answer you were looking for.
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;

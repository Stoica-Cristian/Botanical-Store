import { useState } from "react";
import separator from "../../assets/dashboard/separator.png";
import flower1 from "../../assets/dashboard/na_flower1.jpg";
import flower2 from "../../assets/dashboard/na_flower2.jpg";
import flower3 from "../../assets/dashboard/na_flower3.jpg";
import flower4 from "../../assets/dashboard/na_flower4.jpg";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ToastContainer, { ToastData } from "../ui/ToastContainer";

const products = [
  {
    id: 1,
    name: "Sit voluptatem",
    price: 68,
    image: flower1,
    alt: "Flower 1",
  },
  {
    id: 2,
    name: "Elegant Rose",
    price: 45,
    image: flower2,
    alt: "Flower 2",
  },
  {
    id: 3,
    name: "Garden Lily",
    price: 55,
    image: flower3,
    alt: "Flower 3",
  },
  {
    id: 4,
    name: "Wild Orchid",
    price: 72,
    image: flower4,
    alt: "Flower 4",
  },
];

const DashboardNewArrivalSection = () => {
  const { addToCart } = useCart();
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      alt: product.alt,
    });

    showToast("success", `${product.name} has been added to cart!`);
  };

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  return (
    <section className="py-16">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="mx-auto max-w-screen-xl px-4">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">New Arrival</h2>
          <img src={separator} alt="Separator" className="mx-auto mb-8" />
          <p className="mx-auto max-w-md text-gray-500">
            Discover the latest plants and accessories for your garden.
            Carefully selected, these products are perfect for transforming your
            green space.
          </p>
        </header>

        <ul className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="group mx-auto w-full max-w-sm">
              <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <Link
                  to={`/store/product/${product.id}`}
                  className="block overflow-hidden aspect-square"
                >
                  <img
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    src={product.image}
                    alt={product.alt}
                  />
                </Link>
                <div className="p-4 sm:p-6">
                  <Link to={`/store/product/${product.id}`}>
                    <h5 className="text-xl font-semibold text-gray-900 mb-4">
                      {product.name}
                    </h5>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <button
                      className="text-white bg-accent hover:bg-accent/90 focus:ring-4 focus:ring-accent/30 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 text-center transition-colors duration-300"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DashboardNewArrivalSection;

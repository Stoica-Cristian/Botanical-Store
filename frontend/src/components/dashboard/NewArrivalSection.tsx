import { useState, useEffect } from "react";
import separator from "../../assets/dashboard/separator.png";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ToastContainer, { ToastData } from "../ui/ToastContainer";
import { productService } from "../../services/productService";
import { Product } from "../../types/product";

const DashboardNewArrivalSection = () => {
  const { addToCart } = useCart();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts();
        const recentProducts = allProducts
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 4);
        setProducts(recentProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        showToast("error", "Failed to load new arrivals");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
      alt: product.name,
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

  if (loading) {
    return (
      <section className="py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">New Arrival</h2>
          <img src={separator} alt="Separator" className="mx-auto mb-8" />
          <p className="mx-auto max-w-md text-gray-500">
            Loading new arrivals...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">New Arrival</h2>
          <img src={separator} alt="Separator" className="mx-auto mb-8" />
          <p className="mx-auto max-w-md text-gray-500">
            Discover the latest plants and accessories for your garden.
            Carefully selected, these products are perfect for transforming your
            green space.
          </p>
        </header>

        <ul className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product._id} className="group mx-auto w-full max-w-xs">
              <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <Link
                  to={`/store/product/${product._id}`}
                  className="block overflow-hidden aspect-square"
                >
                  <img
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    src={product.images[0].url}
                    alt={product.name}
                  />
                </Link>
                <div className="p-3">
                  <Link to={`/store/product/${product._id}`}>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h5>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <button
                      className="text-white bg-accent hover:bg-accent/90 focus:ring-4 focus:ring-accent/30 font-medium rounded-lg text-xs px-3 py-1.5 text-center transition-colors duration-300"
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

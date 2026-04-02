import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, CATEGORIES, type Product } from "../api/ProductApi";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/Button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getProducts({ limit: 4, sortBy: "createdAt", sortOrder: "desc" });
        if (response.success && response.data) {
          setFeaturedProducts(response.data.products);
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display font-bold text-5xl md:text-7xl uppercase tracking-tight">
            Grid<span className="text-primary">lock</span>
          </h1>
          <p className="font-mono text-lg md:text-xl mt-4 text-gray-300 max-w-2xl mx-auto">
            Discover amazing digital products from creators worldwide.
            Templates, e-books, software, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/products">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                Browse Products
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="white" size="lg">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border-2 border-black bg-white shadow-brutal">
              <Zap size={40} className="mx-auto text-primary" />
              <h3 className="font-display font-bold text-xl uppercase mt-4">Instant Download</h3>
              <p className="font-mono text-sm text-gray-600 mt-2">
                Get your products immediately after purchase
              </p>
            </div>
            <div className="text-center p-6 border-2 border-black bg-white shadow-brutal">
              <Shield size={40} className="mx-auto text-primary" />
              <h3 className="font-display font-bold text-xl uppercase mt-4">Secure Payments</h3>
              <p className="font-mono text-sm text-gray-600 mt-2">
                Safe and secure checkout process
              </p>
            </div>
            <div className="text-center p-6 border-2 border-black bg-white shadow-brutal">
              <Truck size={40} className="mx-auto text-primary" />
              <h3 className="font-display font-bold text-xl uppercase mt-4">Easy Delivery</h3>
              <p className="font-mono text-sm text-gray-600 mt-2">
                Digital delivery straight to your account
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-display font-bold text-3xl uppercase tracking-tight">
                Featured Products
              </h2>
              <p className="font-mono text-sm text-gray-500 mt-1">
                Check out our latest additions
              </p>
            </div>
            <Link to="/products">
              <Button variant="white" className="flex items-center gap-2">
                View All
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-2 border-black bg-gray-100 animate-pulse h-80"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-black">
              <p className="font-mono text-gray-500">No products available yet</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-center mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 10).map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                className="border-2 border-black bg-white p-4 text-center hover:bg-black hover:text-white transition-colors group"
              >
                <span className="font-mono text-sm uppercase font-bold group-hover:text-primary">
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl uppercase tracking-tight">
            Start Selling Today
          </h2>
          <p className="font-mono text-lg text-gray-300 mt-4">
            Join thousands of creators selling digital products on Gridlock.
            Set up your store in minutes and start earning.
          </p>
          <Link to="/signup">
            <Button variant="primary" size="lg" className="mt-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, CATEGORIES, type Product } from "../api/ProductApi";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/Button";
import { ArrowRight } from "lucide-react";

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
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Diagonal accent block */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-6 translate-x-32 origin-top-right hidden md:block" />

        {/* Geometric blocks */}
        <div className="absolute top-12 right-12 w-24 h-24 border-[3px] border-primary/20 rotate-12 hidden lg:block" />
        <div className="absolute bottom-24 right-24 w-40 h-40 border-[3px] border-primary/10 -rotate-6 hidden lg:block" />
        <div className="absolute top-1/3 right-[15%] w-16 h-16 bg-primary/10 hidden lg:block" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36 lg:pb-40">
          <div className="max-w-5xl">
            {/* Tag */}
            <div className="inline-block border-[3px] border-primary text-primary font-mono text-xs sm:text-sm uppercase tracking-[0.25em] px-4 py-2 mb-8">
              Digital Marketplace for Creators
            </div>

            {/* Headline — massive neobrutalism type */}
            <h1 className="font-display font-bold text-[clamp(3.5rem,10vw,9rem)] uppercase leading-[0.82] tracking-tighter">
              Sell<span className="text-primary">.</span><br />
              Create<span className="text-primary">.</span><br />
              Earn<span className="text-primary">.</span>
            </h1>

            {/* Description */}
            <p className="font-mono text-sm sm:text-base md:text-lg mt-8 text-gray-400 max-w-lg leading-relaxed">
              The marketplace built for independent creators.
              Sell templates, e-books, software, digital art &amp; more.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link to="/products">
                <Button variant="primary" size="xl" className="flex items-center gap-2">
                  Browse Products
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="white" size="xl">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative border-y-[3px] border-white/10 overflow-hidden">
          <div className="flex animate-marquee">
            {[...Array(2)].map((_, set) => (
              <div key={set} className="flex items-center whitespace-nowrap py-4 gap-8">
                {["TEMPLATES", "E-BOOKS", "SOFTWARE", "DIGITAL ART", "3D MODELS", "VIDEOS", "MUSIC", "GRAPHICS"].map(
                  (item) => (
                    <span key={`${set}-${item}`} className="flex items-center gap-8">
                      <span className="font-display font-bold text-lg md:text-xl uppercase tracking-wider text-white/30">
                        {item}
                      </span>
                      <span className="w-2 h-2 bg-primary" />
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-2 bg-primary" />
      </section>

      {/* Featured Products */}
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
                <div key={i} className="border-2 border-black bg-gray-100 animate-pulse h-80" />
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

      {/* Browse by Category */}
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

      {/* CTA Section */}
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

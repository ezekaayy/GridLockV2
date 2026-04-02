import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, getRelatedProducts, type Product } from "../api/ProductApi";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ArrowLeft, ShoppingCart, Check, Package, User, Calendar } from "lucide-react";

export const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [error, setError] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const isInCart = cart?.items?.some(item => item.product?._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await getProductById(id);
        if (response.success && response.data) {
          setProduct(response.data);
          fetchRelatedProducts(id);
        } else {
          setError(response.message || "Product not found");
        }
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || error.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRelatedProducts = async (productId: string) => {
      setIsLoadingRelated(true);
      try {
        const response = await getRelatedProducts(productId, 4);
        if (response.success && response.data) {
          setRelatedProducts(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (product?.owner._id === user?._id) {
      setError("You cannot buy your own product");
      return;
    }

    setIsAddingToCart(true);
    setAddedToCart(false);

    try {
      await addToCart(product!._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border-4 border-red-500 p-6">
            <p className="font-display font-bold text-xl text-red-600">Error!</p>
            <p className="font-mono text-sm mt-2">{error}</p>
            <Button variant="black" className="mt-4" onClick={() => navigate("/products")}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl">📦</span>
          <p className="font-display font-bold text-2xl mt-4">Product Not Found</p>
          <Button variant="black" className="mt-4" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === product.owner._id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-mono text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-3 mb-6">
          <p className="font-mono text-xs text-red-600 font-bold">! {error}</p>
        </div>
      )}

      {addedToCart && (
        <div className="bg-green-50 border-2 border-green-500 p-3 mb-6 flex items-center gap-2">
          <Check size={16} className="text-green-600" />
          <p className="font-mono text-xs text-green-600 font-bold">Added to cart!</p>
          <Link to="/cart" className="ml-auto font-mono text-xs underline text-green-700">
            View Cart
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-2 border-black bg-white shadow-brutal">
          {product.coverImage && product.coverImage.trim() !== "" && !imageError ? (
            <img
              src={product.coverImage}
              alt={product.name}
              className="w-full h-96 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
              <Package size={80} className="text-gray-300" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="inline-block px-3 py-1 bg-primary text-black text-xs font-mono uppercase border-2 border-black mb-2">
              {product.category?.charAt(0).toUpperCase() + product.category?.slice(1).replace("-", " ") || "Other"}
            </span>
            <h1 className="font-display font-bold text-3xl uppercase tracking-tight">
              {product.name}
            </h1>
          </div>

          <p className="font-mono text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-4xl">${product.price.toFixed(2)}</span>
          </div>

          <div className="border-2 border-black p-4 bg-gray-50 space-y-3">
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-500" />
              <div>
                <p className="font-mono text-xs text-gray-500">Creator</p>
                <Link
                  to={`/creators/${product.owner._id}`}
                  className="font-mono text-sm font-bold hover:text-primary"
                >
                  {product.owner.name || product.owner.username}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-500" />
              <div>
                <p className="font-mono text-xs text-gray-500">Published</p>
                <p className="font-mono text-sm font-bold">
                  {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>

          {!isOwner ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-mono text-xs uppercase">Quantity:</label>
                <div className="flex items-center border-2 border-black">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-gray-100 font-mono font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x-2 border-black font-mono font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100 font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                variant="black"
                fullWidth
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {isAddingToCart ? "Adding..." : isInCart ? "Add More" : "Add to Cart"}
              </Button>
            </div>
          ) : (
            <div className="border-2 border-primary bg-primary/10 p-4">
              <p className="font-mono text-sm text-center">
                This is your product
              </p>
              <Link to={`/dashboard/edit-product/${product._id}`}>
                <Button variant="white" fullWidth className="mt-2">
                  Edit Product
                </Button>
              </Link>
            </div>
          )}

          {product.files && product.files.length > 0 && (
            <div className="border-2 border-black p-4">
              <p className="font-mono text-xs uppercase font-bold mb-2">
                Included Files ({product.files.length})
              </p>
              <div className="space-y-2">
                {product.files.map((_file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs font-mono text-gray-600">
                    <Package size={14} />
                    <span>File {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLoadingRelated && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-2xl uppercase mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;

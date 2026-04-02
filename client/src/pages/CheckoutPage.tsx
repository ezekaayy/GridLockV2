import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, checkout } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await checkout();
      setOrderComplete(true);
    } catch (error) {
      const err = error as Error;
      alert(err.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="border-2 border-black bg-white shadow-brutal p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="font-display font-bold text-3xl uppercase">Order Complete!</h1>
          <p className="font-mono text-sm text-gray-500 mt-4">
            Thank you for your purchase, {user?.name}!
          </p>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Your order has been processed successfully.
          </p>
          <div className="mt-8 space-y-3">
            <Link to="/profile">
              <Button variant="black" fullWidth>
                View My Purchases
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="white" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="border-4 border-black bg-white shadow-brutal p-8 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h1 className="font-display font-bold text-2xl">Your Cart is Empty</h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Add some products before checking out
          </p>
          <Link to="/products">
            <Button variant="black" className="mt-6">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-mono text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="font-display font-bold text-3xl uppercase tracking-tight mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-4 border-black bg-white shadow-brutal p-6">
          <h2 className="font-display font-bold text-lg uppercase border-b-2 border-black pb-4 mb-4">
            Order Summary
          </h2>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {cart.items.map((item) => {
              const product = item.product;
              return (
                <div key={item._id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                    {product?.coverImage ? (
                      <img
                        src={`${product.coverImage}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold truncate">{product?.name}</p>
                    <p className="font-mono text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold">
                    ${((product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t-2 border-black mt-4 pt-4 space-y-2">
            <div className="flex justify-between font-mono text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span>Platform Fee</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-display font-bold text-xl pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-4 border-black bg-white shadow-brutal p-6">
            <h2 className="font-display font-bold text-lg uppercase border-b-2 border-black pb-4 mb-4">
              Customer Info
            </h2>
            <div className="space-y-3">
              <div>
                <p className="font-mono text-xs text-gray-500">Name</p>
                <p className="font-mono text-sm font-bold">{user?.name}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-gray-500">Email</p>
                <p className="font-mono text-sm font-bold">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="border-4 border-black bg-gray-50 p-6">
            <p className="font-mono text-xs text-gray-500 mb-4">
              By clicking "Place Order", you agree to our terms and conditions.
              Your purchase will be processed immediately.
            </p>
            <Button
              variant="black"
              fullWidth
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

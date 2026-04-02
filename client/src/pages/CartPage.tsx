import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react";

export const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, removeFromCart, updateCartItem, clearCart, checkout, cartItemsCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItem(productId);
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await checkout();
      navigate("/profile", { state: { orderSuccess: true } });
    } catch (error) {
      const err = error as Error;
      alert(err.message || "Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight mb-8">Your Cart</h1>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="font-display font-bold text-2xl">Your Cart is Empty</p>
            <p className="font-mono text-sm text-gray-500 mt-2">
              Start shopping to add items to your cart
            </p>
            <Link to="/products">
              <Button variant="black" className="mt-6">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight">
          Your Cart ({cartItemsCount} {cartItemsCount === 1 ? "item" : "items"})
        </h1>
        <Button variant="white" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            const isUpdating = updatingItem === product?._id;

            return (
              <div
                key={item._id}
                className="border-4 border-black bg-white shadow-brutal p-4 flex gap-4"
              >
                <Link
                  to={`/products/${product?._id}`}
                  className="w-24 h-24 bg-gray-100 border-2 border-black flex items-center justify-center shrink-0"
                >
                  {product?.coverImage ? (
                    <img
                      src={`${product.coverImage}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={32} className="text-gray-400" />
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product?._id}`}
                    className="font-mono text-sm font-bold hover:text-primary line-clamp-1"
                  >
                    {product?.name || "Unknown Product"}
                  </Link>
                  <p className="font-mono text-xs text-gray-500 mt-1">
                    by {product?.owner?.name || "Unknown"}
                  </p>
                  <p className="font-display font-bold text-lg mt-2">
                    ${product?.price?.toFixed(2) || "0.00"}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border-2 border-black">
                      <button
                        onClick={() => handleUpdateQuantity(product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1 border-x-2 border-black font-mono text-sm font-bold min-w-[40px] text-center">
                        {isUpdating ? "..." : item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(product?._id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="px-2 py-1 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(product?._id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1 font-mono text-xs"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-xs text-gray-500">Subtotal</p>
                  <p className="font-display font-bold text-lg">
                    ${((product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="border-4 border-black bg-white shadow-brutal p-6 sticky top-4">
            <h2 className="font-display font-bold text-lg uppercase border-b-2 border-black pb-4 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-mono text-sm">
                <span>Subtotal ({cartItemsCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span>Platform Fee</span>
                <span>$0.00</span>
              </div>
              <div className="border-t-2 border-black pt-3 flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="black"
              fullWidth
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                "Processing..."
              ) : (
                <>
                  Checkout
                  <ArrowRight size={18} />
                </>
              )}
            </Button>

            <Link to="/products">
              <Button variant="white" fullWidth className="mt-3">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

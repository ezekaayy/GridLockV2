import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeFromCartApi,
  clearCart as clearCartApi,
  checkout as checkoutApi,
  type Cart,
  type Order
} from "../api/cartApi";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  cartItemsCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<Order>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCart();
      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await addToCartApi(productId, quantity);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      const err = error as ApiError;
      throw new Error(err.response?.data?.message || err.message || "Failed to add to cart");
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      const response = await updateCartItemApi(productId, quantity);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      const err = error as ApiError;
      throw new Error(err.response?.data?.message || err.message || "Failed to update cart");
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const response = await removeFromCartApi(productId);
      if (response.success && response.data) {
        setCart(response.data);
      }
    } catch (error) {
      const err = error as ApiError;
      throw new Error(err.response?.data?.message || err.message || "Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    try {
      await clearCartApi();
      setCart(null);
    } catch (error) {
      const err = error as ApiError;
      throw new Error(err.response?.data?.message || err.message || "Failed to clear cart");
    }
  };

  const checkout = async (): Promise<Order> => {
    try {
      const response = await checkoutApi();
      if (response.success && response.data) {
        setCart(null);
        return response.data;
      }
      throw new Error(response.message || "Checkout failed");
    } catch (error) {
      const err = error as ApiError;
      throw new Error(err.response?.data?.message || err.message || "Checkout failed");
    }
  };

  const value: CartContextType = {
    cart,
    isLoading,
    cartItemsCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;

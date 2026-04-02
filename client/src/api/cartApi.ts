import apiClient from "./client";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  coverImage: string;
  description: string;
  files?: string[];
  category?: string;
  owner: {
    _id: string;
    name: string;
    username: string;
  };
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  _id: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    coverImage: string;
    files?: string[];
    category?: string;
    owner?: {
      _id: string;
      name: string;
      username: string;
    };
  };
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  buyer: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  createdAt: string;
}

export interface PurchasedItem {
  product: CartProduct;
  orderId: string;
  orderDate: string;
  price: number;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export const getCart = async (): Promise<ApiResponse<Cart>> => {
  const response = await apiClient.get<ApiResponse<Cart>>("/cart/");
  return response.data;
};

export const addToCart = async (
  productId: string,
  quantity: number = 1
): Promise<ApiResponse<Cart>> => {
  const response = await apiClient.post<ApiResponse<Cart>>("/cart/add", {
    productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> => {
  const response = await apiClient.patch<ApiResponse<Cart>>(
    `/cart/update/${productId}`,
    { quantity }
  );
  return response.data;
};

export const removeFromCart = async (
  productId: string
): Promise<ApiResponse<Cart>> => {
  const response = await apiClient.delete<ApiResponse<Cart>>(
    `/cart/remove/${productId}`
  );
  return response.data;
};

export const clearCart = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>("/cart/clear");
  return response.data;
};

export const checkout = async (): Promise<ApiResponse<Order>> => {
  const response = await apiClient.post<ApiResponse<Order>>("/cart/checkout");
  return response.data;
};

export const getMyOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await apiClient.get<ApiResponse<Order[]>>("/cart/orders");
  return response.data;
};

export const getPurchasedProducts = async (): Promise<ApiResponse<PurchasedItem[]>> => {
  const response = await apiClient.get<ApiResponse<PurchasedItem[]>>("/cart/purchased");
  return response.data;
};

export const getDownloadUrl = (productId: string, fileIndex: number = 0): string => {
  return `/api/cart/download/${productId}/${fileIndex}`;
};

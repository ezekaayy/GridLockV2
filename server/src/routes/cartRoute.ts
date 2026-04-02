import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout,
  getMyOrders,
  downloadProduct,
  getPurchasedProducts
} from "../controllers/cartController";
import { verifyToken } from "../utils/middlewares";

const CartRouter: Router = Router();

CartRouter.get("/", verifyToken, getCart);
CartRouter.post("/add", verifyToken, addToCart);
CartRouter.patch("/update/:productId", verifyToken, updateCartItem);
CartRouter.delete("/remove/:productId", verifyToken, removeFromCart);
CartRouter.delete("/clear", verifyToken, clearCart);
CartRouter.post("/checkout", verifyToken, checkout);
CartRouter.get("/orders", verifyToken, getMyOrders);
CartRouter.get("/purchased", verifyToken, getPurchasedProducts);
CartRouter.get("/download/:productId", verifyToken, downloadProduct);
CartRouter.get("/download/:productId/:fileIndex", verifyToken, downloadProduct);

export default CartRouter;

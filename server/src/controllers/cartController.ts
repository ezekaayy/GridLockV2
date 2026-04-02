import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Product } from "../models/Products";
import { Order } from "../models/Order";
import { Notification } from "../models/Notification";
import { SendError, sendSuccess } from "../utils/responseHelper";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

export const getCart = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const cart = await Cart.findOne({ user: req.id })
      .populate({
        path: "items.product",
        select: "name price coverImage description owner",
        populate: {
          path: "owner",
          select: "name username"
        }
      });

    if (!cart) {
      return sendSuccess(res, { items: [], total: 0 }, "Cart is empty");
    }

    const total = cart.items.reduce((sum, item) => {
      const product = item.product as any;
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    return sendSuccess(res, { ...cart.toObject(), total }, "Cart found");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return SendError(res, "Product ID is required", "MISSING_PRODUCT_ID", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return SendError(res, "Product not found", "PRODUCT_NOT_FOUND", 404);
    }

    if (product.owner.toString() === req.id) {
      return SendError(res, "Cannot add your own product to cart", "OWN_PRODUCT", 400);
    }

    let cart = await Cart.findOne({ user: req.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.id,
        items: [{ product: productId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price coverImage description"
    });

    return sendSuccess(res, updatedCart, "Product added to cart", 200);
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return SendError(res, "Valid quantity is required", "INVALID_QUANTITY", 400);
    }

    const cart = await Cart.findOne({ user: req.id });
    if (!cart) {
      return SendError(res, "Cart not found", "CART_NOT_FOUND", 404);
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return SendError(res, "Item not found in cart", "ITEM_NOT_FOUND", 404);
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price coverImage description"
    });

    return sendSuccess(res, updatedCart, "Cart updated", 200);
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.id });
    if (!cart) {
      return SendError(res, "Cart not found", "CART_NOT_FOUND", 404);
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price coverImage description"
    });

    return sendSuccess(res, updatedCart, "Item removed from cart", 200);
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    await Cart.findOneAndDelete({ user: req.id });

    return sendSuccess(res, null, "Cart cleared", 200);
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const checkout = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const cart = await Cart.findOne({ user: req.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return SendError(res, "Cart is empty", "CART_EMPTY", 400);
    }

    const orderItems = cart.items.map((item) => ({
      product: (item.product as any)._id,
      price: (item.product as any).price,
      quantity: item.quantity
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      buyer: req.id,
      items: orderItems,
      totalAmount,
      status: "completed"
    });

    const creatorIds = new Set<string>();
    cart.items.forEach((item) => {
      const product = item.product as any;
      if (product?.owner) {
        creatorIds.add(product.owner.toString());
      }
    });

    for (const creatorId of creatorIds) {
      await Notification.create({
        recipient: creatorId,
        type: "new_order",
        title: "New Order Received!",
        message: `You have a new order. Total: $${totalAmount.toFixed(2)}`,
        data: { orderId: order._id, amount: totalAmount }
      });
    }

    await Cart.findByIdAndDelete(cart._id);

    return sendSuccess(res, order, "Order placed successfully", 201);
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const orders = await Order.find({ buyer: req.id })
      .populate({
        path: "items.product",
        select: "name price coverImage files"
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, orders, "Orders found");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const downloadProduct = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const { productId, fileIndex } = req.params;
    const productIdStr = Array.isArray(productId) ? productId[0] : productId;
    
    if (!productIdStr) {
      return SendError(res, "Product ID is required", "MISSING_PRODUCT_ID", 400);
    }

    const fileIdx = parseInt(Array.isArray(fileIndex) ? fileIndex[0] || "0" : fileIndex || "0", 10);

    const order = await Order.findOne({
      buyer: new mongoose.Types.ObjectId(req.id),
      "items.product": new mongoose.Types.ObjectId(productIdStr),
      status: "completed"
    });

    if (!order) {
      return SendError(res, "You have not purchased this product", "NOT_PURCHASED", 403);
    }

    const product = await Product.findById(productIdStr);
    if (!product) {
      return SendError(res, "Product not found", "PRODUCT_NOT_FOUND", 404);
    }

    if (!product.files || product.files.length === 0) {
      return SendError(res, "No files available for download", "NO_FILES", 404);
    }

    if (fileIdx < 0 || fileIdx >= product.files.length) {
      return SendError(res, "Invalid file index", "INVALID_FILE_INDEX", 400);
    }

    const fileUrl = product.files[fileIdx];
    if (!fileUrl) {
      return SendError(res, "File not found", "FILE_NOT_FOUND", 404);
    }
    
    // File URL is like /uploads/files/filename.zip
    // Use process.cwd() to get the server directory root
    const filePath = path.join(process.cwd(), fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl);

    console.log("Download request - fileUrl:", fileUrl);
    console.log("Download request - filePath:", filePath);
    console.log("File exists:", fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      return SendError(res, `File not found`, "FILE_NOT_FOUND", 404);
    }

    return res.download(filePath);
  } catch (error) {
    console.error("Download error:", error);
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const getPurchasedProducts = async (req: Request, res: Response) => {
  try {
    if (!req.id) {
      return SendError(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    const orders = await Order.find({ buyer: req.id, status: "completed" })
      .populate({
        path: "items.product",
        select: "name price coverImage files category owner",
        populate: {
          path: "owner",
          select: "name username"
        }
      })
      .sort({ createdAt: -1 });

    const purchasedItems = orders.flatMap(order => 
      order.items.map(item => ({
        product: item.product,
        orderId: order._id,
        orderDate: order.createdAt,
        price: item.price,
        quantity: item.quantity
      }))
    );

    return sendSuccess(res, purchasedItems, "Purchased products found");
  } catch (error) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

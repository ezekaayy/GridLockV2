import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
  getProductById,
  updateProduct,
  getRelatedProductsController,
} from "../controllers/productController";
import { verifyToken } from "../utils/middlewares";
import { uploadProductFiles } from "../utils/upload";

const ProductRouter: Router = Router();

ProductRouter.get("/get-products", getProducts);
ProductRouter.get("/related/:id", getRelatedProductsController);
ProductRouter.get("/get-product/:id", getProductById);
ProductRouter.get("/get-my-product", verifyToken, getMyProducts);
ProductRouter.post("/add-product", uploadProductFiles.fields([{name: "coverImage", maxCount: 1}, {name: "files", maxCount: 5}]) , verifyToken, addProduct);
ProductRouter.patch("/update-product/:id", uploadProductFiles.fields([{name: "coverImage", maxCount: 1}, {name: "files", maxCount: 5}]), verifyToken, updateProduct);
ProductRouter.post("/delete-product/:id", verifyToken, deleteProduct);

export default ProductRouter;

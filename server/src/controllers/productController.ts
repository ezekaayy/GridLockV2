import { Request, Response } from "express";
import { Product } from "../models/Products";
import { ROLES } from "../utils/roles";

import { ApiResponse, ErrorResponse } from "../types/response";
import { getErrorMessage } from "../utils/errors";
import { SendError, sendSuccess } from "../utils/responseHelper";
import { CATEGORIES, type Category } from "../models/Products";
import { getRelatedProducts } from "../utils/recommendation";

interface ProductQuery {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "12",
      search = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query as ProductQuery;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category && CATEGORIES.includes(category as Category)) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("owner", "name email username")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }, "Products found");
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate("owner", "name email username _id");
    
    if (!product) {
      return SendError(res, "Product not found", "PRODUCT_NOT_FOUND", 404);
    }

    return sendSuccess(res, product, "Product found");
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const filter = req.id ? { owner: req.id } : {};
    const products = await Product.find(filter).populate(
      "owner",
      "name email username",
    );

    return sendSuccess(res, products, "products found!", 200);
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500)
  }
};

export const addProduct = async (req: Request, res: Response) => {
  if (!req.role || !req.id) {
    return SendError(
      res,
      "No access grantes: role not found",
      "NO_ACCESS_GRANTED",
      404,
    );
  }

  if (![ROLES.creator, ROLES.admin].includes(req.role as string)) {
    return SendError(
      res,
      "No access grantes: you are not creator or admin",
      "NO_ACCESS_GRANTED",
      404,
    );
  }

  if (!req.body) {
    return SendError(
      res,
      "Request body is missing or not parsed. Please send product data in the request body.",
      "MISSING_BODY",
      404,
    );
  }
  const { name, description, price, category } = req.body;
  
  let coverImage = "";
  let files: string[] = [];
  
  if (req.files) {
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log("Uploaded files:", uploadedFiles);
    if (uploadedFiles.coverImage && uploadedFiles.coverImage[0]) {
      coverImage = `/uploads/covers/${uploadedFiles.coverImage[0].filename}`;
      console.log("Cover image path saved:", coverImage);
    }
    if (uploadedFiles.files && uploadedFiles.files.length > 0) {
      files = uploadedFiles.files.map((f) => `/uploads/files/${f.filename}`);
      console.log("Product files paths saved:", files);
    }
  } else {
    console.log("No files in request");
  }

  try {
    const product = await Product.create({
      name,
      owner: req.id,
      description,
      price: Number(price) || 0,
      coverImage,
      files,
      category: category && CATEGORIES.includes(category) ? category : "other"
    });
    console.log("Product created:", JSON.stringify(product, null, 2));
    return sendSuccess(res, product, "Product added", 201);
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  if (![ROLES.admin, ROLES.creator].includes(req.role as string)) {
    return SendError(
      res,
      "no Acces granted: you are not creator or admin",
      "NO_ACCESS_GRANTED",
      401,
    );
  }

  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return SendError(res, "No Product found!", "PRODUCT_EMPTY", 404);
  }

  if (product.owner.toString() !== req.id) {
    return SendError(res, "No access granted!", "NO_ACCESS_GRANTED", 401);
  }

  const { name, description, price, category, existingCoverImage, existingFiles } = req.body;
  
  let coverImage = existingCoverImage !== undefined ? existingCoverImage : product.coverImage;
  let files = existingFiles ? JSON.parse(existingFiles) : product.files;
  
  if (req.files) {
    const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (uploadedFiles.coverImage && uploadedFiles.coverImage[0]) {
      coverImage = `/uploads/covers/${uploadedFiles.coverImage[0].filename}`;
    }
    if (uploadedFiles.files && uploadedFiles.files.length > 0) {
      files = [...files, ...uploadedFiles.files.map((f) => `/uploads/files/${f.filename}`)];
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: Number(price) || 0 }),
        ...(category && CATEGORIES.includes(category) && { category }),
        coverImage,
        files,
        editedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedProduct) {
      return SendError(res, "No Product found!", "PRODUCT_EMPTY", 404);
    }

    return sendSuccess(res, updatedProduct, "Product Updated", 200);
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  if (![ROLES.admin, ROLES.creator].includes(req.role as string)) {
    return SendError(
      res, "No access granted: you are not creator or admin",
      "NO_ACCESS_GRANTED",
      401,
    );
  }
  const { id } = req.params;
  if (!id) {
    return SendError(res, "Missing ID parameter", "MISSING_ID", 400);
  }

  const product = await Product.findById(id);
  if (!product) {
    return SendError(res, "No product found", "PRODUCT_EMPTY", 404);
  }

  // ownership check
  if (product?.owner.toString() !== req.id) {
    return SendError(res, "No access granted", "NO_ACCESS_GRANTED", 401)
  };

  try {
    const product = await Product.findByIdAndDelete(id);
    return sendSuccess(res, null, "Product Deleted Successfully", 200);
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

export const getRelatedProductsController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const limit = parseInt(req.query.limit as string) || 4;

    if (!id) {
      return SendError(res, "Product ID is required", "MISSING_ID", 400);
    }

    const relatedProducts = await getRelatedProducts(id, limit);

    return sendSuccess(res, relatedProducts, "Related products found");
  } catch (error: unknown) {
    return SendError(res, error, "INTERNAL_SERVER_ERROR", 500);
  }
};

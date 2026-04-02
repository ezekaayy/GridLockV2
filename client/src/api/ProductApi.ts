import apiClient from "./client";

export const CATEGORIES = [
  "digital-art",
  "e-books",
  "templates",
  "music",
  "videos",
  "software",
  "graphics",
  "3d-models",
  "photography",
  "other"
] as const;

export type Category = typeof CATEGORIES[number];

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  coverImage: string;
  files: string[];
  category: Category;
  owner: {
    _id: string;
    name: string;
    email: string;
    username: string;
  };
  publishedDAte?: string;
  createdAt: string;
  editedAt?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  category?: Category;
  publishDate?: string;
  coverImage?: File;
  files?: File[];
}

export interface updateProductData {
  name?: string;
  description?: string;
  category?: Category;
  price?: number;
  coverImage?: File;
  files?: File[];
  existingCoverImage?: string;
  existingFiles?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const getProducts = async (
  filters?: ProductFilters
): Promise<ApiResponse<ProductsResponse>> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString ? `/product/get-products?${queryString}` : "/product/get-products";
  
  const response = await apiClient.get<ApiResponse<ProductsResponse>>(url);
  return response.data;
};

export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  const response = await apiClient.get<ApiResponse<Product>>(
    `/product/get-product/${id}`
  );
  return response.data;
};

export const getMyProduct = async (): Promise<ApiResponse<Product[]>> => {
  const response = await apiClient.get<ApiResponse<Product[]>>(
    "/product/get-my-product",
  );
  return response.data;
};

export const createProduct = async (
  data: CreateProductData,
): Promise<ApiResponse<Product>> => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.description) {
    formData.append("description", data.description);
  }
  formData.append("price", data.price.toString());
  if (data.category) {
    formData.append("category", data.category);
  }

  if (data.coverImage) {
    formData.append("coverImage", data.coverImage);
  }
  if (data.files) {
    data.files.forEach(file => {
      formData.append("files", file);
    })
  }

  const response = await apiClient.post<ApiResponse<Product>>(
    "/product/add-product",
    formData,{
      headers: {
        "Content-Type" : "multipart/form-data"
      }
    }
  );
  return response.data;
};

export const updateProduct = async (
  id: string,
  data: updateProductData,
): Promise<ApiResponse<Product>> => {
  const formData = new FormData();
  
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.price !== undefined) formData.append("price", data.price.toString());
  if (data.category) formData.append("category", data.category);
  if (data.coverImage) formData.append("coverImage", data.coverImage);
  if (data.files) {
    data.files.forEach(file => {
      formData.append("files", file);
    });
  }
  if (data.existingCoverImage !== undefined) {
    formData.append("existingCoverImage", data.existingCoverImage);
  }
  if (data.existingFiles) {
    formData.append("existingFiles", JSON.stringify(data.existingFiles));
  }

  const response = await apiClient.patch<ApiResponse<Product>>(
    `product/update-product/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
};

export const deleteProduct = async (
  id: string,
): Promise<ApiResponse<Product>> => {
  const response = await apiClient<ApiResponse<Product>>(
    `product/delete-product/${id}`,
  );
  return response.data;
};

export const getRelatedProducts = async (
  id: string,
  limit: number = 4
): Promise<ApiResponse<Product[]>> => {
  const response = await apiClient.get<ApiResponse<Product[]>>(
    `/product/related/${id}?limit=${limit}`
  );
  return response.data;
};

export default {
  getProducts,
  getProductById,
  getMyProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
};

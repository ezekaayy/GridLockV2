import { useEffect, useState, useCallback } from "react";
import { getProducts, CATEGORIES, type Product, type Pagination, type ProductFilters } from "../api/ProductApi";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/Button";
import { Input, Select } from "../components/Input";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getProducts(filters);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to load products");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        error.response?.data?.message || error.message || "Failed to load products"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts({
      page: 1,
      limit: 12,
      sortBy,
      sortOrder
    });
  }, [fetchProducts, sortBy, sortOrder]);

  const handleSearch = () => {
    fetchProducts({
      page: 1,
      limit: 12,
      search,
      category: selectedCategory || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchProducts({
      page: 1,
      limit: 12,
      search,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder
    });
  };

  const handlePageChange = (page: number) => {
    fetchProducts({
      page,
      limit: 12,
      search,
      category: selectedCategory || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("createdAt");
    setSortOrder("desc");
    fetchProducts({ page: 1, limit: 12, sortBy: "createdAt", sortOrder: "desc" });
  };

  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice;

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border-4 border-red-500 p-6">
            <p className="font-display font-bold text-xl text-red-600">Error!</p>
            <p className="font-mono text-sm mt-2">{error}</p>
            <Button variant="black" className="mt-4" onClick={() => fetchProducts()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Products</h1>
        <p className="font-mono text-sm text-gray-500 mt-2">
          Discover amazing products from our creators
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full border-2 border-black p-2 pl-10 bg-white font-mono text-sm focus:outline-none focus:shadow-brutal-sm transition-all"
              />
            </div>
            <Button variant="black" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <Button
            variant={showFilters ? "primary" : "white"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="border-2 border-black p-4 bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                  </option>
                ))}
              </Select>
              <Input
                label="Min Price"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                label="Max Price"
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <Select
                label="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </Select>
            </div>
            <div className="flex justify-between items-center">
              <Select
                label="Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
              {hasActiveFilters && (
                <Button variant="white" onClick={clearFilters} className="flex items-center gap-2">
                  <X size={16} />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(selectedCategory === cat ? "" : cat)}
              className={`px-3 py-1 border-2 border-black font-mono text-xs uppercase transition-all ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="text-center">
            <span className="text-6xl">📦</span>
            <p className="font-display font-bold text-2xl mt-4">No Products Found</p>
            <p className="font-mono text-sm text-gray-500 mt-2">
              {hasActiveFilters ? "Try adjusting your filters" : "Check back later for amazing products!"}
            </p>
            {hasActiveFilters && (
              <Button variant="black" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <Button
                variant="white"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 border-2 border-black font-mono text-sm transition-all ${
                        pageNum === pagination.currentPage
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="white"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <ChevronRight size={16} />
              </Button>
              
              <span className="font-mono text-xs text-gray-500 ml-4">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} products)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;

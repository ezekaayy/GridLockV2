import { Link } from "react-router-dom";
import type { Product } from "../api/ProductApi";
import { Package } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}
export const ProductCard = ({ product }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const coverImageUrl = product.coverImage && product.coverImage.trim() !== ""
    ? product.coverImage
    : null;
  const showImage = coverImageUrl && !imageError;

  return (
    <div className="border-2 border-black bg-white shadow-brutal hover:shadow-brutal-hover transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1">
      <Link to={`/products/${product._id}`} className="block">
        <div className="h-32 bg-gray-100 border-b-2 border-black flex items-center justify-center overflow-hidden">
          {showImage ? (
            <img
              src={coverImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Package size={32} className="text-gray-300" />
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display font-bold text-sm uppercase truncate hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="font-mono text-xs text-gray-600 mt-1 line-clamp-1">
          {product.description || "No description available"}
        </p>
        <div className="flex justify-between items-center mt-2">
          <p className="font-mono text-xs text-gray-500">
            by <span className="font-bold">{product.owner?.name || "Unknown"}</span>
          </p>
          <p className="font-display font-bold text-sm">${product.price?.toFixed(2) || "0.00"}</p>
        </div>
        {product.category && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs font-mono">
            {product.category.replace("-", " ")}
          </span>
        )}
      </div>
    </div>
  );
};

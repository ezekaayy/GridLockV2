import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct, CATEGORIES, type Category, type Product } from "../api/ProductApi";
import { Input, TextArea, Select } from "../components/Input";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Upload, X, FileIcon } from "lucide-react";

export const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "other" as Category,
  });
  const [existingCoverImage, setExistingCoverImage] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const response = await getProductById(id);
        if (response.success && response.data) {
          const product: Product = response.data;
          
          if (user && product.owner._id !== user._id) {
            setSubmitError("You don't have permission to edit this product");
            setIsLoading(false);
            return;
          }
          
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category || "other",
          });
          setExistingCoverImage(product.coverImage);
          setExistingFiles(product.files || []);
        } else {
          setSubmitError(response.message || "Product not found");
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        setSubmitError(err.response?.data?.message || err.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProduct();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [id, user, authLoading]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setExistingCoverImage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProductFiles((prev) => [...prev, ...files]);
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setProductFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      await updateProduct(id!, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        coverImage: coverImage || undefined,
        files: productFiles.length > 0 ? productFiles : undefined,
        existingCoverImage,
        existingFiles,
      });
      navigate(`/products/${id}`);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(
        err.response?.data?.message || err.message || "Failed to update product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl">Please Login</h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            You need to login to edit products
          </p>
        </div>
      </div>
    );
  }

  if (user?.role !== "creator" && user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl">Access Denied</h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Only creators can edit products
          </p>
        </div>
      </div>
    );
  }

  if (submitError && !formData.name) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl">Error</h1>
          <p className="font-mono text-sm text-gray-500 mt-2">{submitError}</p>
          <Button variant="black" className="mt-4" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-3xl uppercase tracking-tight mb-8">
        Edit Product
      </h1>
      {submitError && (
        <div className="bg-red-50 border-2 border-red-500 p-3 mb-6">
          <p className="font-mono text-xs text-red-600 font-bold">
            ! {submitError}
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-mono text-xs font-bold m-2 uppercase">
            Cover Image
          </label>
          <div
            onClick={() => coverInputRef.current?.click()}
            className="border-2 border-black border-dashed p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {coverPreview ? (
              <div className="relative">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage(null);
                    setCoverPreview("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : existingCoverImage ? (
              <div className="relative">
                <img
                  src={existingCoverImage}
                  alt="Current cover"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExistingCoverImage("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Upload size={40} />
                <p className="font-mono text-sm mt-2">
                  Click to upload cover image
                </p>
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        <Input
          label="Product Name"
          placeholder="My Awesome Product"
          value={formData.name}
          onChange={handleChange("name")}
          error={errors.name || ""}
          fullwidth
        />

        <TextArea
          label="Description"
          placeholder="Describe your product..."
          value={formData.description}
          onChange={handleChange("description")}
          error={errors.description || ""}
          fullwidth
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            placeholder="29.99"
            value={formData.price}
            onChange={handleChange("price")}
            error={errors.price || ""}
            fullwidth
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={handleChange("category")}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block font-mono text-xs font-bold m-2 uppercase">
            Product Files
          </label>
          
          {existingFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="font-mono text-xs text-gray-500 uppercase">Existing Files:</p>
              {existingFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-2 border-black p-2 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <FileIcon size={16} />
                    <span className="font-mono text-xs truncate">
                      {file.split("/").pop()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-black p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center h-24 text-gray-400">
              <Upload size={30} />
              <p className="font-mono text-sm mt-2">Click to upload new files</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesChange}
            className="hidden"
          />
          {productFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="font-mono text-xs text-gray-500 uppercase">New Files:</p>
              {productFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-2 border-primary p-2 bg-primary/10"
                >
                  <div className="flex items-center gap-2">
                    <FileIcon size={16} />
                    <span className="font-mono text-xs truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="white"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Updating Product..." : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;

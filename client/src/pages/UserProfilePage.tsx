import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders, getPurchasedProducts, type Order, type PurchasedItem } from "../api/cartApi";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Package, Download, ShoppingBag, Eye, FileIcon } from "lucide-react";

export const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, purchasedRes] = await Promise.all([
        getMyOrders().catch(() => ({ success: false, data: [] })),
        getPurchasedProducts().catch(() => ({ success: false, data: [] }))
      ]);

      if (ordersRes.success && ordersRes.data) {
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      }

      if (purchasedRes.success && purchasedRes.data) {
        setPurchasedProducts(Array.isArray(purchasedRes.data) ? purchasedRes.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (productId: string, fileIndex: number) => {
    try {
      const response = await fetch(`/api/cart/download/${productId}/${fileIndex}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Download failed");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product-file-${fileIndex}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight">My Profile</h1>
        <p className="font-mono text-sm text-gray-500 mt-1">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border-4 border-black bg-white shadow-brutal p-6">
          <h2 className="font-display font-bold text-lg uppercase border-b-2 border-black pb-4 mb-4">
            Account Info
          </h2>
          <div className="space-y-3">
            <div>
              <p className="font-mono text-xs text-gray-500">Name</p>
              <p className="font-mono text-sm font-bold">{user.name}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-gray-500">Email</p>
              <p className="font-mono text-sm font-bold">{user.email}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-gray-500">Username</p>
              <p className="font-mono text-sm font-bold">{user.username}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-gray-500">Role</p>
              <p className="font-mono text-sm font-bold uppercase">{user.role}</p>
            </div>
          </div>
          {(user.role === "creator" || user.role === "admin") && (
            <Link to="/dashboard" className="mt-4 block">
              <Button variant="primary" fullWidth>
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="border-4 border-black bg-white shadow-brutal">
            <div className="border-b-2 border-black p-4 flex justify-between items-center">
              <h2 className="font-display font-bold text-lg uppercase">
                Purchased Products ({purchasedProducts.length})
              </h2>
              <Link to="/products">
                <Button variant="white" size="sm">
                  Browse More
                </Button>
              </Link>
            </div>

            {purchasedProducts.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-mono text-sm text-gray-500">No purchases yet</p>
                <Link to="/products">
                  <Button variant="primary" className="mt-4">
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y-2 divide-black">
                {purchasedProducts.map((item, index) => (
                  <div key={`${item.orderId}-${index}`} className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 border-2 border-black flex items-center justify-center overflow-hidden shrink-0">
                        {item.product?.coverImage && item.product.coverImage.trim() !== "" ? (
                          <img
                            src={`${item.product.coverImage}`}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={32} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product?._id}`}
                          className="font-mono text-sm font-bold hover:text-primary"
                        >
                          {item.product?.name || "Product"}
                        </Link>
                        <div className="flex gap-4 mt-1">
                          <p className="font-mono text-xs text-gray-500">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                          <p className="font-mono text-xs text-gray-500">
                            {new Date(item.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        {item.product?.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs font-mono">
                            {item.product.category}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={`/products/${item.product?._id}`}>
                          <Button variant="white" size="sm" className="flex items-center gap-1">
                            <Eye size={14} />
                            View
                          </Button>
                        </Link>
                        {item.product?.files && item.product.files.length > 0 && (
                          <Button
                            variant="black"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleDownload(item.product._id, 0)}
                          >
                            <Download size={14} />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                    {item.product?.files && item.product.files.length > 1 && (
                      <div className="mt-3 pl-24">
                        <p className="font-mono text-xs text-gray-500 mb-2">All Files ({item.product.files.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {item.product.files.map((_, fileIdx) => (
                            <button
                              key={fileIdx}
                              onClick={() => handleDownload(item.product._id, fileIdx)}
                              className="flex items-center gap-1 px-2 py-1 border border-black text-xs font-mono hover:bg-gray-100"
                            >
                              <FileIcon size={12} />
                              File {fileIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-4 border-black bg-white shadow-brutal">
        <div className="border-b-2 border-black p-4">
          <h2 className="font-display font-bold text-lg uppercase">Order History ({orders.length})</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-mono text-sm text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black">
            {orders.map((order) => (
              <div key={order._id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-xs font-bold">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-mono uppercase border-2 border-black ${order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                      }`}>
                      {order.status}
                    </span>
                    <p className="font-display font-bold mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200">
                      <Package size={16} className="text-gray-400" />
                      <span className="font-mono text-xs truncate flex-1">{item.product?.name || "Product"}</span>
                      <span className="font-mono text-xs text-gray-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;

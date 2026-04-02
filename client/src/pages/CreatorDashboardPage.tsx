import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProduct, deleteProduct, type Product } from "../api/ProductApi";
import { getNotifications, markAsRead, markAllAsRead, type Notification } from "../api/notificationApi";
import { getMyOrders, type Order } from "../api/cartApi";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Package,
  Bell,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Trash2,
  Check,
  Eye
} from "lucide-react";

export const CreatorDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "notifications">("overview");
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, notificationsRes, ordersRes] = await Promise.all([
        getMyProduct().catch(() => ({ success: false, data: [] })),
        getNotifications(1, 10).catch(() => ({ success: false, data: { notifications: [], unreadCount: 0 } })),
        getMyOrders().catch(() => ({ success: false, data: [] }))
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      }

      if (notificationsRes.success && notificationsRes.data) {
        setNotifications(notificationsRes.data.notifications || []);
        setUnreadCount(notificationsRes.data.unreadCount || 0);
      }

      if (ordersRes.success && ordersRes.data) {
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (user.role === "creator" || user.role === "admin") {
        fetchData();
      }
    }
  }, [user, authLoading, navigate]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(err.response?.data?.message || err.message || "Failed to delete product");
    }
    setMenuOpenId(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  if (authLoading) {
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

  if (user.role !== "creator" && user.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl">Access Denied</h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Only creators can access this dashboard
          </p>
          <Button variant="black" className="mt-4" onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin mx-auto"></div>
          <p className="font-mono text-sm mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);
  const totalProducts = products.length;

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl uppercase tracking-tight">Dashboard</h1>
          <p className="font-mono text-sm text-gray-500 mt-1">Welcome back, {user.name}</p>
        </div>
        <Link to="/dashboard/add-products">
          <Button variant="black" className="flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-black pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm uppercase transition-all relative ${activeTab === tab.id
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-5 h-5 flex items-center justify-center border-2 border-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-black p-6 bg-white shadow-brutal">
              <div className="flex items-center gap-3">
                <Package className="text-primary" size={24} />
                <div>
                  <p className="font-mono text-xs text-gray-500 uppercase">Total Products</p>
                  <p className="font-display font-bold text-3xl">{totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-6 bg-white shadow-brutal">
              <div className="flex items-center gap-3">
                <DollarSign className="text-primary" size={24} />
                <div>
                  <p className="font-mono text-xs text-gray-500 uppercase">Potential Revenue</p>
                  <p className="font-display font-bold text-3xl">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-black p-6 bg-white shadow-brutal">
              <div className="flex items-center gap-3">
                <Bell className="text-primary" size={24} />
                <div>
                  <p className="font-mono text-xs text-gray-500 uppercase">Notifications</p>
                  <p className="font-display font-bold text-3xl">{unreadCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border-2 border-black bg-white shadow-brutal">
              <div className="border-b-2 border-black p-4 flex justify-between items-center">
                <h2 className="font-display font-bold text-lg uppercase">Recent Products</h2>
                <button
                  onClick={() => setActiveTab("products")}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="p-4 space-y-3">
                {products.slice(0, 3).map((product) => (
                  <div key={product._id} className="flex items-center gap-3 p-2 hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center overflow-hidden">
                      {product.coverImage && product.coverImage.trim() !== "" ? (
                        <img
                          src={product.coverImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-bold truncate">{product.name}</p>
                      <p className="font-mono text-xs text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="font-mono text-sm text-gray-500 text-center py-4">No products yet</p>
                )}
              </div>
            </div>

            <div className="border-2 border-black bg-white shadow-brutal">
              <div className="border-b-2 border-black p-4 flex justify-between items-center">
                <h2 className="font-display font-bold text-lg uppercase">Recent Notifications</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 border-2 border-black ${notification.read ? "bg-gray-50" : "bg-primary/10"}`}
                  >
                    <p className="font-mono text-xs font-bold">{notification.title}</p>
                    <p className="font-mono text-xs text-gray-500 mt-1">{notification.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="font-mono text-sm text-gray-500 text-center py-4">No notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="border-2 border-black bg-white shadow-brutal">
          <div className="border-b-2 border-black p-4">
            <h2 className="font-display font-bold text-lg uppercase">My Products ({products.length})</h2>
          </div>
          <div className="divide-y-2 divide-black">
            {products.map((product) => (
              <div key={product._id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="w-16 h-16 bg-gray-100 border-2 border-black flex items-center justify-center overflow-hidden">
                  {product.coverImage && product.coverImage.trim() !== "" ? (
                    <img
                      src={product.coverImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate">{product.name}</p>
                  <p className="font-mono text-xs text-gray-500">${product.price.toFixed(2)}</p>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-xs font-mono mt-1">
                    {product.category || "other"}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === product._id ? null : product._id)}
                    className="p-2 hover:bg-gray-100 border-2 border-black"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === product._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black shadow-brutal z-10 w-40">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 font-mono text-xs"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 w-full font-mono text-xs border-t border-gray-200"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="p-8 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-mono text-sm text-gray-500">No products yet</p>
                <Link to="/dashboard/add-products">
                  <Button variant="primary" size="md" className="mt-4">
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="border-4 border-black bg-white shadow-brutal">
          <div className="border-b-2 border-black p-4">
            <h2 className="font-display font-bold text-lg uppercase">Orders ({orders.length})</h2>
          </div>
          <div className="divide-y-2 divide-black">
            {orders.map((order) => (
              <div key={order._id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-mono text-xs text-gray-500">Order #{order._id.slice(-8)}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-mono uppercase border-2 border-black ${order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                    }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50">
                      <div className="w-10 h-10 bg-gray-200 border border-black flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-xs font-bold">{item.product?.name || "Product"}</p>
                        <p className="font-mono text-xs text-gray-500">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <p className="font-display font-bold">Total: ${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-mono text-sm text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="border-4 border-black bg-white shadow-brutal">
          <div className="border-b-2 border-black p-4 flex justify-between items-center">
            <h2 className="font-display font-bold text-lg uppercase">Notifications</h2>
            {unreadCount > 0 && (
              <Button variant="white" size="sm" onClick={handleMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 flex items-start gap-3 ${notification.read ? "bg-white" : "bg-primary/5"}`}
              >
                <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${notification.read ? "bg-gray-100" : "bg-primary"
                  }`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm font-bold">{notification.title}</p>
                  <p className="font-mono text-xs text-gray-500 mt-1">{notification.message}</p>
                  <p className="font-mono text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="p-1 hover:bg-gray-100"
                    title="Mark as read"
                  >
                    <Check size={16} className="text-green-600" />
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="font-mono text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboardPage;

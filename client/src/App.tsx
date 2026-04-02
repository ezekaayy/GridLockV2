import { Route, Routes, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import ProductsPage from "./pages/ProductPages";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CreatorDashboardPage from "./pages/CreatorDashboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-primary animate-spin"></div>
      </div>
    );
  }

  const isCreator = user?.role === "creator" || user?.role === "admin";

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            isCreator
              ? <Navigate to="/dashboard" replace />
              : <HomePage />
          }
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            isCreator
              ? <CreatorDashboardPage />
              : <Navigate to="/products" replace />
          }
        />
        <Route
          path="/dashboard/add-products"
          element={
            isCreator
              ? <AddProductPage />
              : <Navigate to="/products" replace />
          }
        />
        <Route
          path="/dashboard/edit-product/:id"
          element={
            isCreator
              ? <EditProductPage />
              : <Navigate to="/products" replace />
          }
        />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;

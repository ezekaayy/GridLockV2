import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { Button, cn } from "../Button";
import { Menu, X, ShoppingCart, Bell, User } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemsCount } = useCart();
  
  const navLinks = [
    { name: "Products", href: "/products" },
    ...(user?.role === "creator" || user?.role === "admin"
      ? [{ name: "Dashboard", href: "/dashboard" }]
      : []),
  ];
  
  return (
    <nav className="z-50 border-2 border-black block sticky top-0 bg-white">
      <div className="max-w-7xl max-auto p-2 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <span className="font-extrabold font-mono text-2xl uppercase tracking-tight">
              Gridlock
            </span>
          </Link>

          <div className="hidden sm:flex justify-center w-full gap-4 font-mono">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-bold uppercase hover:underline decoration-4 decoration-primary transaction-colors underline-offset-4",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated && (
              <>
                <Link to="/cart" className="relative">
                  <ShoppingCart size={20} className="hover:text-primary transition-colors" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-black text-xs w-5 h-5 flex items-center justify-center border border-black font-mono font-bold">
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </span>
                  )}
                </Link>
                {(user?.role === "creator" || user?.role === "admin") && (
                  <Link to="/dashboard" className="relative">
                    <Bell size={20} className="hover:text-primary transition-colors" />
                  </Link>
                )}
                <Link to="/profile" className="relative">
                  <User size={20} className="hover:text-primary transition-colors" />
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile">
                  <span className="font-mono text-sm font-bold">{user?.name}</span>
                </Link>
                <Button
                  variant="white"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="white" size="sm">
                    Login
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Signup
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="md:hidden p-1 border-2 border-black transition-all duration-300 ease-in-out"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-col gap-3 border-t-2 border-black p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="font-mono text-sm font-bold uppercase p-2 hover:bg-gray-100 transition-all duration-300"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-mono text-sm font-bold uppercase p-2 hover:bg-gray-100"
                >
                  <ShoppingCart size={18} />
                  Cart ({cartItemsCount})
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-mono text-sm font-bold uppercase p-2 hover:bg-gray-100"
                >
                  <User size={18} />
                  Profile
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 mt-2">
                <span className="font-mono text-sm p-2">Logged in as {user?.name}</span>
                <Button
                  variant="black"
                  size="sm"
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col mt-2 gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="white" size="sm" fullWidth>
                    Login
                  </Button>
                </Link>

                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" fullWidth>
                    Signup
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

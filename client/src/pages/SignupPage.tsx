import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import type { SignupData } from "../api/authApi";
import { Input, Select } from "../components/Input";
import { Button } from "../components/Button";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<SignupData>({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "visitor",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupData, string>>
  >({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // redirect if already logged in
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const validateField = (field: keyof SignupData, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        break;
      case "phone":
        if (!value.trim()) return "Phone is required";
        break;
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        break;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {};

    (Object.keys(formData) as (keyof SignupData)[]).forEach((field) => {
      const error = validateField(field, formData[field] as string);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur =
    (field: keyof SignupData) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      const error = validateField(field, e.target.value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    };

  const handleChange =
    (field: keyof SignupData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // claer error when user types
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      setSubmitError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);

    try {
      const user = await signup(formData);
      // Redirect based on role
      if (user.role === "creator") {
        navigate("/dashboard");
      } else {
        navigate("/products");
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(
        err.response?.data?.message || err.message || "signup failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 w-full">
      <div className="w-full max-w-md">
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="font-display uppercase font-bold text-4xl tracking-tight">
            Create Account
          </h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Join Gridlock and start creating
          </p>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* show error */}
          {submitError && (
            <div className="bg-red-50 border-2 border-red-500 p-3 mb-4 rounded-md">
              <p className="font-mono text-xs text-red-600 font-bold">
                ! {submitError}
              </p>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Gyanendra Khatiwada"
            value={formData.name}
            onChange={handleChange("name")}
            onBlur={handleBlur("name")}
            error={errors.name || ""}
            fullwidth
          />

          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            error={errors.email || ""}
            fullwidth
          />

          <Input
            label="Phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChange={handleChange("phone")}
            onBlur={handleBlur("phone")}
            error={errors.phone || ""}
            fullwidth
          />
          <Input
            label="Username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange("username")}
            onBlur={handleBlur("username")}
            error={errors.username || ""}
            fullwidth
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            error={errors.password || ""}
            fullwidth
          />
          <Select
            label="I want to..."
            value={formData.role}
            onChange={handleChange("role")}
            error={errors.role || ""}
            fullwidth
          >
            <option value="visitor">Buy Products (Consumer)</option>
            <option value="creator">Sell Products (Creator)</option>
          </Select>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting || isLoading}
            className="mt-6"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        {/* Login Link */}
        <p className="text-center font-mono text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

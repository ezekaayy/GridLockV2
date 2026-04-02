import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import type { LoginData } from "../api/authApi";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const LoginPage = () => {
  const navigate = useNavigate();
  // const {login, isLoading, isAuthenticated} = useAuth();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [submitErrors, setSubmitErrors] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //redirect id login
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        break;
      case "password":
        if (!value) return "Password is required";
        break;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailError = validateField("email", formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validateField("password", formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur =
    (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
      const error = validateField(field, e.target.value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    };
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      setSubmitErrors("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErrors("");
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const loginData: LoginData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const user = await login(loginData);
      if (user.role === "creator" || user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/")
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      setSubmitErrors(
        err.response?.data?.message || err.message || "Login Failed",
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
            Welcome Back
          </h1>
          <p className="font-mono text-sm text-gray-500 mt-2">
            Login to your Gridlock account
          </p>
        </div>
        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitErrors && (
            <div className="bg-red-50 border-2 border-red-500 p-3 rounded-md">
              <p className="font-mono text-xs text-red-600 font-bold">
                ! {submitErrors}
              </p>
            </div>
          )}
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
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange("password")}
            onBlur={handleBlur("password")}
            error={errors.password || ""}
            fullwidth
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting || isLoading}
            className="mt-6"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="text-center font-mono text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

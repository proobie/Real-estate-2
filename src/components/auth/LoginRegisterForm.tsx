import React, { useState, useEffect } from "react";
import LotliteLogo from '../../assets/lotlite-logo.png';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  User,
  Phone,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginRegisterForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError(); // Clear previous errors

    if (isLogin) {
      await login({ email, password });
    } else {
      const registerResponse = await register({ name, email, phone, password });

      if (!error && registerResponse) {
        try {
          await fetch("https://acknowledgement-tau.vercel.app/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              phone,
              message: "New user registered successfully!",
            }),
          });
          console.log("Function called successfully");
        } catch (err) {
          console.error("Function call failed:", err);
        }
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    clearError();
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "employee") navigate("/employee");
      else if (user.role === "client") navigate("/");
      else navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3D3D3] to-[#f3f3f3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Back Button */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-[#0B0B45] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back to Website</span>
          </button>
        </div>

        {/* Logo & Headings */}
        <div className="text-center">
          <div className="flex justify-center">
            <img src={LotliteLogo} alt="Lotlite Logo" className="h-16" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#0B0B45]">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? "Sign in to your real estate dashboard"
              : "Welcome! Please fill in the details to create your account."}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Name (Registration Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#0B0B45] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#D3D3D3]" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#D3D3D3] rounded-md"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0B0B45] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#D3D3D3]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#D3D3D3] rounded-md"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone (Registration Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#0B0B45] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-[#D3D3D3]" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) setPhone(value);
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-[#D3D3D3] rounded-md"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                  />
                </div>
                {phone && phone.length !== 10 && (
                  <p className="mt-1 text-xs text-red-500">
                    Phone number must be exactly 10 digits
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0B0B45] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#D3D3D3]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-[#D3D3D3] rounded-md"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#999]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#999]" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#D4AF37]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    </svg>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : isLogin ? "Sign In" : "Create Account"}
              </button>
            </div>

            {/* Toggle Login/Register */}
            <div className="text-center">
              <button type="button" onClick={toggleMode} className="text-sm text-[#0B0B45] hover:text-[#D4AF37]">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import toast from "react-hot-toast";
import { Zap, Package, RefreshCw, TrendingUp, Shield, CheckCircle, Eye, EyeOff } from "lucide-react";



export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useStore();
  const [email, setEmail] = useState("admin@syncstock.io");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, router]);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        toast.success("Welcome back! Redirecting…");
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[58%] xl:w-[60%] flex-col relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800">
        {/* Sleek Dark Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 xl:p-16">
          {/* Central Minimalist Graphic & Text */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Big Logo / Visual */}
            <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-indigo-300 rounded-3xl rotate-6 opacity-20 blur-xl animate-pulse"></div>
              <div className="relative w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl">
                <Zap className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              SyncStock
            </h2>
            <p className="text-white/70 text-lg max-w-sm mx-auto font-medium">
              Inventory in perfect harmony.
            </p>
          </div>
          

        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SyncStock</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to your SyncStock account to continue.</p>
          </div>


          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                placeholder="you@company.com"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-purple-600 hover:text-purple-700 font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-11 px-3.5 pr-11 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
              <span className="text-sm text-gray-600">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              {"Don't have an account? "}
              <button type="button" className="text-purple-600 font-medium hover:text-purple-700">
                Create account
              </button>
            </p>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400">
            By signing in, you agree to our{" "}
            <span className="text-purple-500 cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-purple-500 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

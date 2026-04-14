import React, { useState } from "react";
import n3fitbookLogo from '../../../assets/n3fitbook-192.webp';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding } from "react-icons/fa";
import { HiShieldCheck, HiUserGroup } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';

function AdminAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("admin"); // "admin" | "staff"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gymCode, setGymCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = { email: email.trim(), password };
      if (activeTab === "staff") {
        if (!gymCode.trim()) {
          toast.error("Club Code is required for staff login");
          setLoading(false);
          return;
        }
        payload.gymCode = gymCode.replace(/\s+/g, '').trim();
      }

      const user = await login(payload.email, payload.password, payload.gymCode);
      toast.success("Welcome back!");

      setTimeout(() => {
        switch (user?.role) {
          case "superadmin":
            navigate("/superadmin", { replace: true });
            break;
          case "staff":
            navigate("/active", { replace: true });
            break;
          default:
            navigate("/dashboard", { replace: true });
        }
      }, 400);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Invalid credentials"
          : "Login failed. Please try again.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      <Toaster position="top-right" containerStyle={{ top: 'calc(env(safe-area-inset-top) + 24px)' }} />

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-800 to-zinc-700">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-zinc-900 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-zinc-900 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-zinc-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={n3fitbookLogo} alt="N3FitBook" style={{ height: '40px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
            <span className="text-white/90 font-semibold text-lg">N3FitBook · Fitness Management</span>
          </div>

          {/* Hero Content */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
            >
              Manage Your Fit Club,
              <br />
              <span className="bg-gradient-to-r from-zinc-200 to-white bg-clip-text text-transparent">
                Effortlessly.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/60 text-lg leading-relaxed max-w-md"
            >
              Members, payments, invoices, and staff — all in one powerful dashboard built for fit club owners.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-8 mt-10"
            >
              {[
                { num: "500+", label: "Active Fit Clubs" },
                { num: "50K+", label: "Members Managed" },
                { num: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-white">{stat.num}</p>
                  <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-white/30 text-sm">
            Powered by N3FitBook &middot; Fitness Management Platform
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={n3fitbookLogo} alt="N3FitBook" style={{ height: '36px', width: 'auto', objectFit: 'contain', borderRadius: '7px' }} />
            <span className="text-gray-900 dark:text-white font-semibold text-lg">N3FitBook · Fitness Management</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          {/* ─── Role Tab Selector ─── */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{
              background: 'var(--tab-bg, #f3f4f6)',
              border: '1px solid #e5e7eb',
            }}
          >
            {[
              { key: "admin", label: "Admin & Owner", icon: <HiShieldCheck size={18} /> },
              { key: "staff", label: "Staff", icon: <HiUserGroup size={18} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setGymCode("");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeTab === tab.key ? 'white' : 'transparent',
                  color: activeTab === tab.key ? '#18181b' : '#9ca3af',
                  boxShadow: activeTab === tab.key ? '0 1px 3px rgba(244,63,94,0.12)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ─── Gym Code (Staff only) ─── */}
            <AnimatePresence mode="wait">
              {activeTab === "staff" && (
                <motion.div
                  key="gymcode"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Club Code
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      value={gymCode}
                      onChange={(e) => setGymCode(e.target.value.toUpperCase())}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 transition-all text-sm uppercase tracking-wider"
                      placeholder="e.g. GS-1"
                      required
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">
                    Ask your manager for this code if you don't have it.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 transition-all text-sm"
                  placeholder={activeTab === "staff" ? "staff@fitclub.com" : "admin@fitclub.com"}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/20 transition-all text-sm"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/25 hover:shadow-zinc-900/30"
            >
              {loading ? (
                <>
                  <ButtonSpinner />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Powered by <span className="font-semibold text-gray-500 dark:text-gray-400">Fit</span> &middot; Fitness Management Platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminAuth;

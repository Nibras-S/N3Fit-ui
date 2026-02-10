import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaUserPlus,
  FaUsers,
  FaSignOutAlt,
  FaUserCheck,
  FaUserTimes,
  FaCog,
  FaChartPie,
  FaSun,
  FaMoon,
  FaUserShield,
  FaBuilding,
  FaCrown,
} from "react-icons/fa";

/**
 * Main app layout with role-aware sidebar and mobile navigation.
 */
export function AppLayout({
  children,
  gender = "Male",
  onSwitchGender,
  showGenderSwitch = true,
  showBackToList = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based navigation
  const navItems = [
    { path: "/superadmin", label: "Platform Overview", icon: FaBuilding, roles: ["superadmin"] },
    { path: "/superadmin/plans", label: "SaaS Plans", icon: FaCrown, roles: ["superadmin"] },
    { path: "/dashboard", label: "Dashboard", icon: FaChartPie, roles: ["gymadmin"] },
    { path: "/active", label: "Active Members", icon: FaUserCheck, roles: ["gymadmin", "staff"] },
    { path: "/inactive", label: "Expired Members", icon: FaUserTimes, roles: ["gymadmin", "staff"] },
    { path: "/register", label: "New Member", icon: FaUserPlus, roles: ["gymadmin", "staff"] },
    { path: "/manageUsers", label: "All Members", icon: FaUsers, roles: ["gymadmin", "staff"] },
    { path: "/staff", label: "Staff", icon: FaUserShield, roles: ["gymadmin"] },
    { path: "/gym-profile", label: "Gym Profile", icon: FaBuilding, roles: ["gymadmin"] },
    { path: "/settings", label: "Settings", icon: FaCog, roles: ["gymadmin"] },
  ].filter((item) => !item.roles || item.roles.includes(user?.role));

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const userName = user?.name || "User";
  const userRole = user?.role === "gymadmin" ? "Gym Admin" : user?.role === "staff" ? "Staff" : user?.role === "superadmin" ? "Super Admin" : "Admin";
  const gymName = user?.gym?.name || "N3 Gym";
  const gymLogo = user?.gym?.logo;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shrink-0 transition-colors duration-200">
        <div className="p-5 flex flex-col h-full">
          {/* Logo / Gym Name */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
              {gymLogo ? (
                <img src={`${backendUrl}${gymLogo}`} alt="Gym" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">N3</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">{gymName}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Menu</p>
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm ${isActive(path)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <Icon className="text-base shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              {theme === 'light' ? <FaMoon className="text-base shrink-0" /> : <FaSun className="text-base shrink-0 text-yellow-400" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          {/* Profile & Logout */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
            <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 mt-3">Powered by N3 Gym</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N3</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{gymName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
            >
              {theme === 'light' ? <FaMoon /> : <FaSun className="text-yellow-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-xl border-l dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map(({ path, label, icon: Icon }) => (
                      <button
                        key={path}
                        onClick={() => {
                          navigate(path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm ${isActive(path)
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                          }`}
                      >
                        <Icon /> {label}
                      </button>
                    ))}
                  </nav>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-6 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 p-4 md:p-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 4).map(({ path, label, icon: Icon }) => (
            <BottomNavButton
              key={path}
              active={isActive(path)}
              onClick={() => navigate(path)}
              label={label.split(" ")[0]}
              icon={<Icon className="text-lg" />}
            />
          ))}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16 shrink-0" aria-hidden="true" />
    </div>
  );
}

function BottomNavButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 px-2 rounded-lg transition-colors ${active
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-medium"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50"
        }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default AppLayout;

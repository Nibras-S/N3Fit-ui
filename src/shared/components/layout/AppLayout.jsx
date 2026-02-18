import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useNotifications } from "../../../features/notifications/context/NotificationContext";
import {
  FaUserPlus,
  FaUsers,
  FaSignOutAlt,
  FaUserCheck,
  FaUserTimes,
  FaCog,
  FaUserCog,
  FaChartPie,
  FaUserShield,
  FaBuilding,
  FaCrown,
  FaBullhorn,
  FaWallet,
  FaChevronDown,
  FaBell,
  FaExclamationTriangle,
  FaCheckDouble,
  FaCircle,
  FaMoon,
  FaSun
} from "react-icons/fa";
import ConfirmModal from "../feedback/ConfirmModal";

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, hasFeature, api } = useAuth();
  const {
    notifications,
    unreadCount,
    activeWarning,
    markAsRead,
    markAllAsRead,
    setActiveWarning
  } = useNotifications();

  const isActive = (path) => location.pathname === path;

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    if (activeWarning) {
      setShowWarningModal(true);
    } else {
      setShowWarningModal(false);
    }
  }, [activeWarning]);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger"
  });

  /**
   * Safe navigation that checks for unsaved registration data.
   */
  const safeNavigate = (path) => {
    if (window.isRegistrationDirty) {
      setConfirmState({
        isOpen: true,
        title: "Unsaved Changes",
        message: "You have unsaved information. Are you sure you want to leave?",
        onConfirm: () => {
          window.isRegistrationDirty = false;
          navigate(path);
        },
        type: "danger"
      });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    if (window.isRegistrationDirty) {
      setConfirmState({
        isOpen: true,
        title: "Confirm Logout",
        message: "You have unsaved changes. Are you sure you want to logout?",
        onConfirm: () => {
          window.isRegistrationDirty = false;
          logout();
          navigate("/login");
        },
        type: "danger"
      });
    } else {
      logout();
      navigate("/login");
    }
  };

  // Role-based navigation with feature gating
  const navItems = [
    { path: "/superadmin", label: "Platform Overview", icon: FaBuilding, roles: ["superadmin"] },
    { path: "/superadmin/plans", label: "SaaS Plans", icon: FaCrown, roles: ["superadmin"] },
    {
      label: "Members",
      icon: FaUsers,
      roles: ["gymadmin", "staff"],
      defaultPath: "/active",
      subItems: [
        { path: "/active", label: "Active Members", icon: FaUserCheck },
        { path: "/inactive", label: "Expired Members", icon: FaUserTimes },
        { path: "/manageUsers", label: "All Members", icon: FaUsers },
      ]
    },
    { path: "/register", label: "New Member", icon: FaUserPlus, roles: ["gymadmin", "staff"] },
    {
      label: "Analysis",
      icon: FaChartPie,
      roles: ["gymadmin"],
      defaultPath: "/dashboard",
      subItems: [
        { path: "/dashboard", label: "Dashboard", icon: FaChartPie },
        { path: "/expenses", label: "Expenses", icon: FaWallet, feature: "expenses" },
      ]
    },

    {
      path: "/notifications",
      label: "Notifications",
      icon: FaBell,
      roles: ["gymadmin", "staff"],
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null
    },
    { path: "/announcement", label: "Announcement", icon: FaBullhorn, roles: ["gymadmin", "superadmin"], feature: "announcements" },
    { path: "/superadmin/settings", label: "Settings", icon: FaCog, roles: ["superadmin"] },
    { path: "/settings", label: "Settings", icon: FaCog, roles: ["gymadmin", "staff"] },
  ]
    .filter((item) => !item.roles || item.roles.includes(user?.role))
    .filter((item) => !item.feature || hasFeature(item.feature))
    .map((item) => {
      // Also filter sub-items by feature
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => !sub.feature || hasFeature(sub.feature)),
        };
      }
      return item;
    });

  const [expandedItems, setExpandedItems] = useState(() => {
    // Expand groups if a subItem is active
    const expanded = {};
    navItems.forEach(item => {
      if (item.subItems?.some(sub => isActive(sub.path))) {
        expanded[item.label] = true;
      }
    });
    return expanded;
  });

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const userName = user?.name || "User";
  const userRole = user?.role === "gymadmin" ? "Gym Admin" : user?.role === "staff" ? "Staff" : user?.role === "superadmin" ? "Super Admin" : "Admin";
  const gymName = user?.gym?.name || "N3 FIT";
  const gymLogo = user?.gym?.logo;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shrink-0 transition-colors duration-200">
        <div className="p-5 flex flex-col h-full">
          {/* Logo / Gym Name */}
          <div className="flex items-center gap-3 mb-8 px-2">
            {gymLogo ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                <img src={getImageUrl(gymLogo)} alt="Gym Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-white font-bold text-sm">N3</span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">{gymName}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
            </div>
          </div>

          {/* Spacer to push content down if needed */}
          <div className="mb-6 px-2"></div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Menu</p>
            {navItems.map((item) => {
              const { path, label, icon: Icon, subItems, badge } = item;
              const isItemActive = path ? isActive(path) : subItems?.some(sub => isActive(sub.path));
              const isExpanded = expandedItems[label];

              if (subItems) {
                return (
                  <div key={label} className="space-y-1">
                    <button
                      onClick={() => {
                        toggleExpand(label);
                        if (item.defaultPath) safeNavigate(item.defaultPath);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all text-sm ${isItemActive
                        ? "text-blue-600 dark:text-blue-400 font-bold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="text-base shrink-0" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-700 space-y-1 mt-1">
                            {subItems.map((sub) => (
                              <button
                                key={sub.path}
                                onClick={() => safeNavigate(sub.path)}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-xs ${isActive(sub.path)
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                  }`}
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <button
                  key={path}
                  onClick={() => safeNavigate(path)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-sm ${isActive(path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <Icon className="text-base shrink-0" />
                  <span className="font-medium flex-1">{label}</span>
                  {badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Profile Section with Modal */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto relative">
            <AnimatePresence>
              {profileModalOpen && (
                <>
                  {/* Backdrop for closing modal when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileModalOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 mb-4 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-20"
                  >
                    <div className="p-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">User Profile</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg overflow-hidden">
                          {user?.profileImage ? (
                            <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          safeNavigate(user?.role === 'superadmin' ? '/superadmin/settings' : '/settings');
                          setProfileModalOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <FaUserCog className="text-blue-500" />
                        Manage Account
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button
              onClick={() => setProfileModalOpen(!profileModalOpen)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-200 group ${profileModalOpen
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {user?.profileImage ? (
                  <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight mb-0.5">{userName}</p>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium uppercase tracking-wider leading-none">{gymName}</p>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${profileModalOpen ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </button>
            <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600 mt-4 opacity-50">Powered by N3 FIT</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {gymLogo ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={getImageUrl(gymLogo)} alt="Gym Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold text-sm">N3</span>
              </div>
            )}
            <span className="font-bold text-gray-900 dark:text-white text-sm">{gymName}</span>
          </div>
          <div className="flex items-center gap-2">
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
                    {navItems.map((item) => {
                      const { path, label, icon: Icon, subItems } = item;
                      const isItemActive = path ? isActive(path) : subItems?.some(sub => isActive(sub.path));
                      const isExpanded = expandedItems[label];

                      if (subItems) {
                        return (
                          <div key={label} className="space-y-1">
                            <button
                              onClick={() => {
                                toggleExpand(label);
                                if (item.defaultPath) {
                                  safeNavigate(item.defaultPath);
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all text-sm ${isItemActive
                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="text-base" />
                                <span>{label}</span>
                              </div>
                              <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="ml-6 space-y-1 border-l-2 border-gray-100 dark:border-slate-700 pl-4 mt-1">
                                {subItems.map((sub) => (
                                  <button
                                    key={sub.path}
                                    onClick={() => {
                                      safeNavigate(sub.path);
                                      setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-xs ${isActive(sub.path)
                                      ? "text-blue-600 dark:text-blue-400 font-bold"
                                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                                      }`}
                                  >
                                    {sub.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={path}
                          onClick={() => {
                            safeNavigate(path);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm ${isActive(path)
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                            }`}
                        >
                          <Icon /> {label}
                        </button>
                      );
                    })}
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

        {/* Global Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          confirmText="Done"
          cancelText="Cancel"
        />

        {/* Global Warning Modal */}
        <AnimatePresence>
          {showWarningModal && activeWarning && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30"
              >
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
                    <FaExclamationTriangle size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Urgent Message</h2>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-6 px-4 py-1 bg-red-50 dark:bg-red-900/30 rounded-full inline-block">Attention Required</p>

                  <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-slate-700 shadow-inner">
                    <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed font-medium">
                      {activeWarning.message}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      markAsRead(activeWarning._id);
                      setShowWarningModal(false);
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-red-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <FaCheckDouble />
                    Acknowledge & Close
                  </button>
                  <p className="mt-4 text-[10px] text-gray-400 font-medium">This message was sent by the Super Administrator</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 safe-area-pb">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 4).map(({ path, label, icon: Icon }) => (
            <BottomNavButton
              key={path}
              active={isActive(path)}
              onClick={() => safeNavigate(path)}
              label={label.split(" ")[0]}
              icon={<Icon className="text-lg" />}
            />
          ))}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16 shrink-0" aria-hidden="true" />
    </div >
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

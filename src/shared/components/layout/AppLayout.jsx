import React, { useState, useEffect } from "react";
import n3Logo from '../../../assets/n3Logo.png';
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useFormState } from "../../context/FormStateContext";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useNotifications } from "../../../features/notifications/context/NotificationContext";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { getRouteTitle } from "../../lib/routeTitles";
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
  FaSun,
  FaDownload,
  FaChartLine,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import ConfirmModal from "../feedback/ConfirmModal";
import InstallPWA from "../pwa/InstallPWA";

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

  // Network indicator + page-title source for the mobile header.
  const { status: networkStatus } = useOnlineStatus();
  const currentPageTitle = getRouteTitle(location.pathname);

  // Sidebar collapsed state — persisted across sessions in localStorage.
  // Click the logo (or the small chevron) to toggle. In collapsed mode the
  // sidebar shrinks to icon-only at lg:w-20.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('n3_sidebar_collapsed') === '1';
    } catch (_) {
      return false;
    }
  });

  // Scroll-driven auto-collapse: as soon as the user scrolls past a small
  // threshold we shrink the sidebar to icon-only mode so wide tables (like
  // the members list) get the full horizontal real estate. The state is
  // separate from the persisted user preference so manually expanding while
  // scrolled still works — the next scroll re-collapses.
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setAutoCollapsed(window.scrollY > 80);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Effective collapsed state used by every render path below.
  const isCollapsed = sidebarCollapsed || autoCollapsed;

  const toggleSidebar = () => {
    // If we're currently collapsed for ANY reason (manual or scroll-driven),
    // a click means "expand now". Clear both flags so the user gets the full
    // sidebar back even mid-scroll.
    if (isCollapsed) {
      setSidebarCollapsed(false);
      setAutoCollapsed(false);
      try { localStorage.setItem('n3_sidebar_collapsed', '0'); } catch (_) { }
      return;
    }
    setSidebarCollapsed(true);
    try { localStorage.setItem('n3_sidebar_collapsed', '1'); } catch (_) { }
  };

  const { theme, toggleTheme } = useTheme();
  const { isDirty, setDirty } = useFormState();
  const { user, logout, hasFeature, api } = useAuth();
  const {
    notifications,
    unreadCount,
    activeWarning,
    markAsRead,
    markAllAsRead,
    setActiveWarning
  } = useNotifications();

  const isActive = (path) => {
    const [pathPart] = path.split('?');
    // For /members — highlight on any /members sub-path regardless of tab param
    if (pathPart === '/members') return location.pathname === '/members' || location.pathname.startsWith('/members');
    return location.pathname === pathPart;
  };

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
    if (isDirty) {
      setConfirmState({
        isOpen: true,
        title: "Unsaved Changes",
        message: "You have unsaved information. Are you sure you want to leave?",
        onConfirm: () => {
          setDirty(false);
          navigate(path);
        },
        type: "danger"
      });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    if (isDirty) {
      setConfirmState({
        isOpen: true,
        title: "Confirm Logout",
        message: "You have unsaved changes. Are you sure you want to logout?",
        onConfirm: () => {
          setDirty(false);
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
    { path: "/dashboard", label: "Dashboard", icon: FaChartPie, roles: ["gymadmin"] },
    { path: "/superadmin", label: "Platform Overview", icon: FaBuilding, roles: ["superadmin"] },
    { path: "/superadmin/plans", label: "SaaS Plans", icon: FaCrown, roles: ["superadmin"] },
    {
      label: "Members",
      icon: FaUsers,
      path: "/members?tab=active",
      roles: ["gymadmin", "staff"],
    },
    { path: "/register", label: "New Member", icon: FaUserPlus, roles: ["gymadmin", "staff"] },
    { path: "/expenses", label: "Expenses", icon: FaWallet, feature: "expenses", roles: ["gymadmin"] },
    { path: "/reports", label: "Reports", icon: FaChartLine, roles: ["gymadmin", "staff", "superadmin"] },
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
  const userRole = user?.role === "gymadmin" ? "Admin" : user?.role === "staff" ? "Staff" : user?.role === "superadmin" ? "Super Admin" : "Admin";
  const gymName = user?.gym?.name || "Fit";
  const gymCode = user?.gym?.gymCode;
  const gymLogo = user?.gym?.logo;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Dedicated bottom nav items (role-aware)
  const bottomNavItems = user?.role === 'superadmin'
    ? [
      { path: "/superadmin", label: "Dashboard", icon: FaBuilding },
      { path: "/superadmin/plans", label: "Plans", icon: FaCrown },
      { path: "/superadmin/settings", label: "Settings", icon: FaCog },
    ]
    : [
      { path: "/dashboard", label: "Dashboard", icon: FaChartPie },
      { path: "/members", label: "Members", icon: FaUsers },
      { path: "/register", label: "New", icon: FaUserPlus },
      { path: "/notifications", label: "Alerts", icon: FaBell, badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null },
      { path: "/settings", label: "Settings", icon: FaCog },
    ];

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shrink-0 transition-all duration-200 ${
          isCollapsed ? "lg:w-20" : "lg:w-60"
        }`}
      >
        <div className={`flex flex-col h-full ${isCollapsed ? "p-3" : "p-5"}`}>
          {/* Logo / Gym Name — clickable to collapse / expand */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`group relative flex items-center mb-8 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
              isCollapsed ? "justify-center px-1 py-2" : "gap-3 px-2 py-2"
            }`}
          >
            {gymLogo ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                <img src={getImageUrl(gymLogo)} alt="Gym Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white">
                <img src={n3Logo} alt="Fit" className="w-full h-full object-contain" />
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left">
                <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">{gymName}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
              </div>
            )}
            {!isCollapsed && (
              <FaAngleDoubleLeft className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-sm shrink-0" />
            )}
          </button>

          {/* Floating expand button when collapsed (like the reference image) */}
          {isCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="absolute top-7 -right-3 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FaAngleDoubleRight className="text-[10px]" />
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            {!isCollapsed && (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Menu</p>
            )}
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
                      title={isCollapsed ? label : undefined}
                      className={`w-full text-left ${isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3 justify-between"} flex items-center transition-colors text-sm font-medium rounded-md ${isItemActive
                        ? "bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-slate-800/50"
                        }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                        <Icon className={`text-xl shrink-0 ${isItemActive ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`} />
                        {!isCollapsed && <span>{label}</span>}
                      </div>
                      {!isCollapsed && (
                        <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {!isCollapsed && (
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
                                  className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-colors text-sm font-medium rounded-md ${isActive(sub.path)
                                    ? "bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-400 active:bg-gray-50 dark:active:bg-slate-800/50"
                                    }`}
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={path}
                  onClick={() => safeNavigate(path)}
                  title={isCollapsed ? label : undefined}
                  className={`relative w-full text-left ${isCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3 gap-3"} flex items-center transition-colors text-sm font-medium rounded-md ${isActive(path)
                    ? "bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 active:bg-gray-50 dark:active:bg-slate-800/50"
                    }`}
                >
                  <Icon className={`text-xl shrink-0 ${isActive(path) ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`} />
                  {!isCollapsed && <span className="flex-1">{label}</span>}
                  {!isCollapsed && badge && (
                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold px-2 py-0.5 rounded-full ml-auto">
                      {badge}
                    </span>
                  )}
                  {isCollapsed && badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        {theme === 'dark' ? <FaSun className="text-amber-500" /> : <FaMoon className="text-slate-600" />}
                        <span>Appearance: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button
              onClick={() => setProfileModalOpen(!profileModalOpen)}
              title={isCollapsed ? userName : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-2 py-2 rounded-xl transition-all duration-200 group ${profileModalOpen
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
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight mb-0.5">{userName}</p>
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium uppercase tracking-wider leading-none">{gymName}</p>
                    </div>
                    {gymCode && (
                      <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">{gymCode}</span>
                    )}
                  </div>
                  <div className={`transition-transform duration-200 ${profileModalOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                </>
              )}
            </button>
            {!isCollapsed && (
              <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600 mt-4 opacity-50">Powered by Fit</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main content
          `min-w-0` is critical: as a flex item with `flex-1`, <main> would
          otherwise default to `min-width: auto` and grow to its content's
          intrinsic width — which means a wide table would push the page
          horizontally instead of letting the table's own `overflow-x-auto`
          wrapper scroll. Setting min-w-0 lets <main> shrink to its track,
          so any descendant overflow scroller actually clips and scrolls. */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen lg:min-h-0 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Mobile top bar — three-zone layout:
              LEFT:   notification bell + unread badge
              CENTER: current page title + live network status indicator
              RIGHT:  hamburger menu (opens drawer)
            The status dot pulses green when healthy, amber when weak,
            red when offline. */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          {/* Left: notifications */}
          <button
            onClick={() => safeNavigate('/notifications')}
            className="relative p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
            aria-label="Notifications"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Center: page title + status pulse */}
          <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2">
            <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
              {currentPageTitle}
            </h1>
            <NetworkDot status={networkStatus} />
          </div>

          {/* Right: hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
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

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    >
                      {theme === 'dark' ? <FaSun className="text-amber-500" /> : <FaMoon className="text-slate-500" />}
                      <span>Appearance: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                  </div>
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
          className="flex-1 p-4 md:p-6 pb-28 lg:pb-6"
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

      {/* PWA Install Floating Modal — bottom-right, global */}
      <InstallPWA />

      {/* Mobile Bottom Navigation — five tabs with an elevated center FAB.
          The SVG behind the bar paints a curved notch around the center
          button so it looks like the FAB sits in a scoop, not on a wall.
          The notch is decorative-only (pointer-events:none), so taps still
          land on the buttons. */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 safe-area-pb">
        {/* Curved background with cutout for the center button */}
        <div className="relative">
          <svg
            className="absolute inset-x-0 bottom-0 w-full h-[72px] text-white dark:text-slate-800 drop-shadow-[0_-4px_8px_rgba(15,23,42,0.06)] pointer-events-none"
            viewBox="0 0 400 72"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,8 L168,8 C176,8 180,12 184,18 C190,30 196,38 200,38 C204,38 210,30 216,18 C220,12 224,8 232,8 L400,8 L400,72 L0,72 Z"
              fill="currentColor"
              stroke="rgb(229 231 235)"
              strokeWidth="1"
              className="dark:[stroke:rgb(51_65_85)]"
            />
          </svg>
          <div className="relative flex items-end justify-around px-2 pt-2 pb-1.5 h-[72px]">
            {bottomNavItems.map(({ path, label, icon: Icon, badge }) => (
              <BottomNavButton
                key={path}
                active={isActive(path)}
                onClick={() => safeNavigate(path)}
                label={label}
                icon={<Icon className={path === "/register" ? "text-xl text-white" : "text-lg"} />}
                badge={badge}
                isPrimary={path === "/register"}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav — matches the 72px nav height */}
      <div className="lg:hidden h-[72px] shrink-0" aria-hidden="true" />
    </div >
  );
}

function BottomNavButton({ active, onClick, label, icon, badge, isPrimary }) {
  if (isPrimary) {
    // Center "+" button — sits inside the SVG notch carved by the parent.
    // The negative top offset lifts it above the bar; the no-label
    // variant matches the reference design (image 3).
    return (
      <div className="relative -top-7 flex flex-col items-center justify-center z-30 flex-1">
        <button
          onClick={onClick}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/40 hover:from-blue-600 hover:to-blue-800 transition-all border-4 border-white dark:border-slate-800 active:scale-95"
          aria-label={label}
        >
          {icon}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1.5 px-1 rounded-lg transition-colors relative flex-1 ${active
        ? "text-blue-600 dark:text-blue-400 font-semibold"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] leading-none">{label}</span>
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
      )}
    </button>
  );
}

/**
 * NetworkDot — small pulsing status indicator next to the mobile page title.
 *
 * Three states, three colours:
 *   online  — green dot, gentle pulse
 *   weak    — amber dot, faster pulse (you should know about it)
 *   offline — red dot, no pulse (because there's nothing to wait for)
 *
 * The double-layer trick (a static dot + a ping-animated halo) is the
 * standard tailwind pattern for "this thing is alive". `aria-label` on the
 * wrapper announces the state to screen readers.
 */
function NetworkDot({ status }) {
  const config = {
    online:  { color: 'bg-green-500',  ring: 'bg-green-400',  pulse: true,  label: 'Online' },
    weak:    { color: 'bg-amber-500',  ring: 'bg-amber-400',  pulse: true,  label: 'Weak connection' },
    offline: { color: 'bg-red-500',    ring: 'bg-red-400',    pulse: false, label: 'Offline' },
  }[status] || { color: 'bg-gray-400', ring: 'bg-gray-300', pulse: false, label: 'Unknown' };

  return (
    <span
      className="relative flex w-2 h-2 shrink-0"
      role="status"
      aria-label={config.label}
      title={config.label}
    >
      {config.pulse && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.ring}`} />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
    </span>
  );
}

export default AppLayout;

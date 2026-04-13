// Hot reload trigger
import React, { useState, useEffect } from "react";
// Optimized 192x192 WebP — 3.7 KB vs the 1.4 MB original PNG. The full-res
// asset is kept in public/ for manifest splash use only.
import n3Logo from '../../../assets/n3Logo-192.webp';
import { useLocation, useNavigate } from "react-router-dom";
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
  FaCog,
  FaUserCog,
  FaChartPie,
  FaBuilding,
  FaCrown,
  FaBullhorn,
  FaWallet,
  FaChevronDown,
  FaBell,
  FaExclamationTriangle,
  FaCheckDouble,
  FaMoon,
  FaSun,
  FaChartLine,
  FaAngleDoubleLeft,
  FaArrowLeft,
  FaBars,
  FaExchangeAlt,
  FaInbox,
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
  title,
  description,
  icon: PageIcon,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [gymSwitcherOpen, setGymSwitcherOpen] = useState(false);

  // Network indicator + page-title source for the mobile header.
  const { status: networkStatus } = useOnlineStatus();
  const currentPageTitle = title || getRouteTitle(location.pathname);

  // Sidebar collapsed state — persisted across sessions in localStorage.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('n3_sidebar_collapsed') === '1';
    } catch (_) {
      return false;
    }
  });

  const isCollapsed = sidebarCollapsed;

  const toggleSidebar = () => {
    if (isCollapsed) {
      setSidebarCollapsed(false);
      try { localStorage.setItem('n3_sidebar_collapsed', '0'); } catch (_) { }
      return;
    }
    setSidebarCollapsed(true);
    try { localStorage.setItem('n3_sidebar_collapsed', '1'); } catch (_) { }
  };

  const { theme, toggleTheme } = useTheme();
  const { isDirty, setDirty } = useFormState();
  const { user, logout, hasFeature, switchGym, api } = useAuth();
  const {
    unreadCount,
    activeWarning,
    markAsRead,
    socket,
  } = useNotifications();

  // Enquiry count badge — superadmin only
  const [enquiryCount, setEnquiryCount] = useState(0);
  useEffect(() => {
    if (user?.role !== 'superadmin') return;
    api.get('/enquiries/count')
      .then(res => setEnquiryCount(res.data?.newCount ?? 0))
      .catch(() => {});
  }, [user, api]);

  // Real-time increment on new enquiry socket event
  useEffect(() => {
    if (user?.role !== 'superadmin') return;
    const sock = socket?.current;
    if (!sock) return;
    const handler = () => setEnquiryCount(c => c + 1);
    sock.on('enquiry:new', handler);
    return () => sock.off('enquiry:new', handler);
  }, [user, socket]);

  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    if (activeWarning) {
      setShowWarningModal(true);
    } else {
      setShowWarningModal(false);
    }
  }, [activeWarning]);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger"
  });

  // Clear enquiry badge when visiting the enquiries page
  useEffect(() => {
    if (location.pathname === '/superadmin/enquiries') {
      setEnquiryCount(0);
    }
  }, [location.pathname]);

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

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: FaChartPie, roles: ["gymadmin", "staff"], permission: "dashboard" },
    { path: "/superadmin", label: "Platform Overview", icon: FaBuilding, roles: ["superadmin"] },
    { path: "/superadmin/plans", label: "SaaS Plans", icon: FaCrown, roles: ["superadmin"] },
    {
      path: "/superadmin/enquiries", label: "Enquiries", icon: FaInbox, roles: ["superadmin"],
      badge: enquiryCount > 0 ? (enquiryCount > 9 ? "9+" : enquiryCount) : null,
    },
    {
      label: "Members",
      icon: FaUsers,
      path: "/members?tab=active",
      roles: ["gymadmin", "staff"],
    },
    { path: "/register", label: "New Member", icon: FaUserPlus, roles: ["gymadmin", "staff"] },
    { path: "/expenses", label: "Expenses", icon: FaWallet, feature: "expenses", roles: ["gymadmin", "staff"], permission: "expenses" },
    { path: "/transactions", label: "Transactions", icon: FaExchangeAlt, roles: ["gymadmin", "staff"], permission: "payments" },
    { path: "/reports", label: "Reports", icon: FaChartLine, roles: ["gymadmin", "staff", "superadmin"], permission: "reports" },
    {
      path: "/notifications",
      label: "Notifications",
      icon: FaBell,
      roles: ["gymadmin", "staff"],
      permission: "notifications",
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null
    },
    { path: "/announcement", label: "Announcement", icon: FaBullhorn, roles: ["gymadmin", "superadmin"], feature: "announcements" },
    { path: "/superadmin/settings", label: "Settings", icon: FaCog, roles: ["superadmin"] },
    { path: "/settings", label: "Settings", icon: FaCog, roles: ["gymadmin", "staff"] },
  ]
    .filter((item) => !item.roles || item.roles.includes(user?.role))
    .filter((item) => {
      // Permission-gated items: staff must have the permission to see it
      if (item.permission && user?.role === 'staff') {
        return user?.permissions?.includes(item.permission);
      }
      return true;
    })
    .filter((item) => !item.feature || hasFeature(item.feature))
    .map((item) => {
      if (item.subItems) {
        return {
          ...item,
          subItems: item.subItems.filter(sub => !sub.feature || hasFeature(sub.feature)),
        };
      }
      return item;
    });

  // Highlight the nav item that most specifically matches the current URL.
  // Exact match wins; otherwise the longest nav path that is a parent segment
  // of the current pathname wins — so /reports stays active on /reports/income,
  // while /superadmin/plans beats /superadmin when pathname is /superadmin/plans.
  const isActive = (path) => {
    const pathname = location.pathname;
    const pathPart = (path || '').split('?')[0];
    if (!pathPart) return false;
    if (pathname !== pathPart && !pathname.startsWith(pathPart + '/')) return false;
    for (const item of navItems) {
      const other = (item.path || '').split('?')[0];
      if (!other || other === pathPart) continue;
      if (other.length > pathPart.length && (pathname === other || pathname.startsWith(other + '/'))) {
        return false;
      }
    }
    return true;
  };

  const [expandedItems, setExpandedItems] = useState(() => {
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
  const gymLogo = user?.gym?.logo;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const bottomNavItems = (user?.role === 'superadmin'
    ? [
      { path: "/superadmin", label: "Dashboard", icon: FaBuilding },
      { path: "/superadmin/plans", label: "Plans", icon: FaCrown },
      { path: "/superadmin/enquiries", label: "Enquiries", icon: FaInbox, badge: enquiryCount > 0 ? (enquiryCount > 9 ? "9+" : enquiryCount) : null },
      { path: "/superadmin/settings", label: "Settings", icon: FaCog },
    ]
    : [
      { path: "/dashboard", label: "Dashboard", icon: FaChartPie, permission: "dashboard" },
      { path: "/members", label: "Members", icon: FaUsers },
      { path: "/register", label: "New", icon: FaUserPlus },
      { path: "/notifications", label: "Alerts", icon: FaBell, permission: "notifications", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null },
      { path: "/settings", label: "Settings", icon: FaCog },
    ]
  ).filter((item) => {
    if (item.permission && user?.role === 'staff') {
      return user?.permissions?.includes(item.permission);
    }
    return true;
  });

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] font-sans flex flex-col lg:flex-row transition-colors duration-200">

      {/* ─── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:sticky lg:top-0 bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-transparent shrink-0 relative transition-all duration-300 ${isCollapsed ? "lg:w-[72px]" : "lg:w-[240px]"
          }`}
      >
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 ${isCollapsed ? "px-3 py-5" : "px-4 py-5"}`}>

          {/* Logo / Gym Name */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`group flex items-center mb-8 rounded-xl transition-all duration-200 ${isCollapsed
              ? "justify-center p-2 hover:bg-gray-100 dark:hover:bg-white/8"
              : "gap-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-white/8"
              }`}
          >
            {gymLogo ? (
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-gray-200 dark:ring-white/10">
                <img src={getImageUrl(gymLogo)} alt="Gym Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl shrink-0 bg-zinc-900 flex items-center justify-center ring-2 ring-zinc-900/15 shadow-lg shadow-zinc-900/20">
                <img src={n3Logo} alt="Fit" className="w-7 h-7 object-contain" />
              </div>
            )}
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">{gymName}</h1>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">{userRole}</p>
                </div>
                <FaAngleDoubleLeft className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 text-xs shrink-0 transition-colors" />
              </>
            )}
          </button>



          {/* Gym Switcher (multi-gym admins only) */}
          {!isCollapsed && user?.allGyms?.length > 1 && (
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setGymSwitcherOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition-all text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FaBuilding className="text-gray-400 dark:text-zinc-500 shrink-0 text-xs" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{gymName}</span>
                </div>
                <FaExchangeAlt className={`text-gray-400 dark:text-zinc-500 text-xs shrink-0 transition-transform ${gymSwitcherOpen ? 'rotate-90' : ''}`} />
              </button>
              {gymSwitcherOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden origin-top animate-dropdown-in"
                >
                    {user.allGyms.map((gym) => {
                      const isActive = (gym._id?.toString()) === ((user.activeGymId || user.gymId)?.toString());
                      return (
                        <button
                          key={gym._id}
                          type="button"
                          onClick={async () => {
                            setGymSwitcherOpen(false);
                            if (!isActive) {
                              try { await switchGym(gym._id?.toString()); window.location.href = '/dashboard'; }
                              catch (_) { }
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${isActive ? 'bg-gray-50 dark:bg-zinc-800/60' : ''}`}
                        >
                          <div className="w-6 h-6 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                            {gym.logo ? <img src={gym.logo} alt="" className="w-full h-full object-cover" /> : <FaBuilding className="text-gray-400 text-[8px]" />}
                          </div>
                          <span className={`text-xs font-medium truncate flex-1 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{gym.name}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
            {!isCollapsed && (
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">Menu</p>
            )}
            {navItems.map((item) => {
              const { path, label, icon: Icon, subItems, badge } = item;
              const isItemActive = path ? isActive(path) : subItems?.some(sub => isActive(sub.path));
              const isExpanded = expandedItems[label];

              if (subItems) {
                return (
                  <div key={label} className="space-y-0.5">
                    <button
                      onClick={() => {
                        toggleExpand(label);
                        if (item.defaultPath) safeNavigate(item.defaultPath);
                      }}
                      title={isCollapsed ? label : undefined}
                      className={`w-full text-left flex items-center transition-all duration-150 text-sm font-medium rounded-xl ${isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5 justify-between"
                        } ${isItemActive
                          ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800/50 dark:text-white"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                        <Icon className={`text-[18px] shrink-0 ${isItemActive ? "text-zinc-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`} />
                        {!isCollapsed && <span className={`${isItemActive ? "text-zinc-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>{label}</span>}
                      </div>
                      {!isCollapsed && (
                        <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${isItemActive ? 'text-white/60' : 'text-gray-600'}`} />
                      )}
                    </button>
                    {!isCollapsed && (
                      // grid-rows-[0fr]/[1fr] trick: animates the implicit
                      // grid track height so the inner div smoothly expands
                      // from 0 to its natural height. Replaces framer-motion's
                      // height: auto animation, which has no CSS equivalent.
                      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <div className="ml-4 pl-4 border-l border-gray-200 dark:border-white/10 space-y-0.5 mt-0.5">
                            {subItems.map((sub) => (
                              <button
                                key={sub.path}
                                onClick={() => safeNavigate(sub.path)}
                                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-all duration-150 text-sm font-medium rounded-xl ${isActive(sub.path)
                                  ? "bg-zinc-100/80 text-zinc-900 dark:bg-zinc-800/40 dark:text-white"
                                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white"
                                  }`}
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={path}
                  onClick={() => safeNavigate(path)}
                  title={isCollapsed ? label : undefined}
                  className={`relative w-full text-left flex items-center transition-all duration-150 text-sm font-medium rounded-xl ${isCollapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5 gap-3"
                    } ${isActive(path)
                      ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800/50 dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <Icon className={`text-[18px] shrink-0 ${isActive(path) ? "text-zinc-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`} />
                  {!isCollapsed && <span className={`flex-1 ${isActive(path) ? "text-zinc-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}>{label}</span>}
                  {/* Badge — collapsed: red dot overlay; expanded: pill */}
                  {badge && !isCollapsed && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-auto ${isActive(path) ? "bg-zinc-900/10 text-zinc-900 dark:bg-zinc-300/20 dark:text-white" : "bg-zinc-900/10 text-zinc-500 dark:text-zinc-400"}`}>
                      {badge}
                    </span>
                  )}
                  {badge && isCollapsed && (
                    <span className="absolute top-1.5 right-1.5 bg-zinc-900 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-white/8 mt-4 flex justify-center items-center">
            {isCollapsed ? (
              <img src={n3Logo} alt="N3 Fit" className="w-6 h-6 opacity-60 grayscale" />
            ) : (
              <div className="flex items-center gap-2">
                <img src={n3Logo} alt="N3 Fit" className="w-5 h-5 opacity-60 grayscale" />
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 opacity-60">Powered by N3 Fit</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      {/* `min-w-0` is critical: prevents flex item from growing beyond its
          track, which allows nested overflow-x-auto tables to actually scroll. */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen lg:min-h-0 bg-gray-50 dark:bg-[#0d0d0d] transition-colors duration-200">

        {/* Desktop Header — sticky, shown only on lg+ */}
        <header className="hidden lg:flex items-center justify-between px-6 py-3.5 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800/60 sticky top-0 z-20 shrink-0">
          {/* Left: page title */}
          <div className="flex items-center gap-3">
            {PageIcon && (
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                <PageIcon size={20} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                {currentPageTitle}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {description || gymName}
              </p>
            </div>
          </div>

          {/* Right: online status + notification + profile */}
          <div className="flex items-center gap-2">
            {/* Online / offline indicator */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-700/50">
              <NetworkDot status={networkStatus} />
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 capitalize">{networkStatus}</span>
            </div>

            {/* Notification bell */}
            <button
              onClick={() => safeNavigate('/notifications')}
              aria-label="Notifications"
              className="relative p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-150"
            >
              <FaBell className="text-[17px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-zinc-900 text-[9px] font-bold text-white flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Desktop profile avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileModalOpen(!profileModalOpen)}
                className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all duration-150 group ${profileModalOpen
                  ? "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  : "bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700/50 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
              >
                <div className="relative w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                  {user?.profileImage ? (
                    <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : userInitial}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{userName}</span>
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${profileModalOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile dropdown — opens below the button */}
              {profileModalOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileModalOpen(false)} />
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-40 origin-top-right animate-popup-in"
                  >
                      {/* User info header */}
                      <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/40">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                            {user?.profileImage ? (
                              <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                            ) : userInitial}
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-zinc-800" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <button
                          onClick={() => {
                            safeNavigate('/account');
                            setProfileModalOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <FaUserCog className="text-zinc-500 text-base shrink-0" />
                          Manage Account
                        </button>
                        <button
                          onClick={() => { toggleTheme(); setProfileModalOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {theme === 'dark' ? <FaSun className="text-amber-400 text-base shrink-0" /> : <FaMoon className="text-slate-500 text-base shrink-0" />}
                          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <FaSignOutAlt className="text-base shrink-0" />
                          Logout
                        </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 pb-3 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800/60 shadow-sm safe-area-pt">
          {/* Left: hamburger or back */}
          <button
            onClick={() => showBackToList ? safeNavigate('/members') : setMobileMenuOpen(true)}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            aria-label="Menu"
          >
            {showBackToList ? <FaArrowLeft size={16} /> : <span className="flex items-center"><FaBars size={16} /></span>}
          </button>

          {/* Center: page title + status pulse */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {currentPageTitle}
              </h1>
              <NetworkDot status={networkStatus} />
            </div>
          </div>

          {/* Right: notifications */}
          <button
            onClick={() => safeNavigate('/notifications')}
            className="relative w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-zinc-900 text-[8px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-zinc-800">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-900 shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r dark:border-zinc-800 flex flex-col animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      {gymLogo ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-gray-200 dark:ring-white/10 shrink-0">
                          <img src={getImageUrl(gymLogo)} alt="Gym Logo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center ring-2 ring-zinc-900/15 shadow-lg shadow-zinc-900/20 shrink-0">
                          <img src={n3Logo} alt="N3" className="w-6 h-6 object-contain" />
                        </div>
                      )}
                      <span className="font-bold text-gray-900 dark:text-white truncate" style={{ fontSize: "16px" }}>{gymName}</span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 focus:outline-none"
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
                              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all text-sm ${isItemActive
                                ? "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-white font-bold"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="text-base" />
                                <span>{label}</span>
                              </div>
                              <FaChevronDown className={`text-[10px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="ml-6 space-y-1 border-l-2 border-gray-100 dark:border-zinc-800 pl-4 mt-1">
                                {subItems.map((sub) => (
                                  <button
                                    key={sub.path}
                                    onClick={() => {
                                      safeNavigate(sub.path);
                                      setMobileMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-xs ${isActive(sub.path)
                                      ? "text-zinc-900 dark:text-white font-bold"
                                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
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
                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 text-sm ${isActive(path)
                            ? "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-white font-bold"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                            }`}
                        >
                          <Icon />
                          <span className="flex-1">{label}</span>
                          {item.badge && (
                            <span className="bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-white dark:text-zinc-900">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-6 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <FaSignOutAlt /> Logout
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      {theme === 'dark' ? <FaSun className="text-amber-500" /> : <FaMoon className="text-slate-500" />}
                      <span>Appearance: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>
        )}

        <div
          key={location.pathname}
          className="flex-1 p-4 md:p-6 pb-28 lg:pb-6 animate-page-in"
        >
          {children}
        </div>

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
        {showWarningModal && activeWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-modal-in">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-700 dark:text-zinc-300 animate-bounce">
                  <FaExclamationTriangle size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Urgent Message</h2>
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-6 px-4 py-1 bg-zinc-50 dark:bg-zinc-700/50 rounded-full inline-block">Attention Required</p>

                <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-zinc-800 shadow-inner">
                  <p className="text-gray-700 dark:text-gray-200 text-base leading-relaxed font-medium">
                    {activeWarning.message}
                  </p>
                </div>

                <button
                  onClick={() => {
                    markAsRead(activeWarning._id);
                    setShowWarningModal(false);
                  }}
                  className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-zinc-900/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <FaCheckDouble />
                  Acknowledge & Close
                </button>
                <p className="mt-4 text-[10px] text-gray-400 font-medium">This message was sent by the Super Administrator</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PWA Install Floating Modal */}
      <InstallPWA />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-area-pb">
        <div className="relative flex items-center justify-around px-2 pt-2 pb-1.5 h-[68px]">
          {bottomNavItems.map(({ path, label, icon: Icon, badge }) => (
            <BottomNavButton
              key={path}
              active={isActive(path)}
              onClick={() => safeNavigate(path)}
              label={label}
              icon={<Icon className={path === "/register" ? "text-[22px] text-white" : "text-[20px]"} />}
              badge={badge}
              isPrimary={path === "/register"}
            />
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-[72px] shrink-0" aria-hidden="true" />
    </div>
  );
}

function BottomNavButton({ active, onClick, label, icon, badge, isPrimary }) {
  if (isPrimary) {
    return (
      <div className="relative -top-[1.2rem] flex flex-col items-center justify-center z-30 flex-1">
        <button
          onClick={onClick}
          className="flex items-center justify-center w-[50px] h-[50px] rounded-full bg-zinc-900 shadow-[0_4px_14px_rgba(37,99,235,0.39)] hover:bg-zinc-800 transition-all active:scale-95 text-white"
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
      className={`flex flex-col items-center justify-center gap-1 min-w-[48px] py-1.5 px-1 rounded-lg transition-colors relative flex-1 ${active
        ? "text-zinc-900 dark:text-white font-medium"
        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        }`}
    >
      <div className="relative">
        {icon}
        {badge && (
          <span className="absolute -top-1.5 -right-2.5 bg-zinc-900 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] leading-none">{label}</span>
    </button>
  );
}

/**
 * NetworkDot — pulsing status indicator.
 */
function NetworkDot({ status }) {
  const cfg = {
    online: { color: 'bg-green-500', ring: 'bg-green-400', pulse: true, label: 'Online' },
    weak: { color: 'bg-amber-500', ring: 'bg-amber-400', pulse: true, label: 'Weak connection' },
    offline: { color: 'bg-zinc-900', ring: 'bg-zinc-500', pulse: false, label: 'Offline' },
  }[status] || { color: 'bg-gray-400', ring: 'bg-gray-300', pulse: false, label: 'Unknown' };

  return (
    <span
      className="relative flex w-2 h-2 shrink-0"
      role="status"
      aria-label={cfg.label}
      title={cfg.label}
    >
      {cfg.pulse && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.ring}`} />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.color}`} />
    </span>
  );
}

export default AppLayout;

import React, { useEffect, useState } from "react";
import api from '../../../shared/services/api';
import { FaPhone, FaClock, FaUser, FaWhatsapp, FaCheck, FaSync, FaSearch, FaUserSlash, FaSlidersH, FaTimes } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import AppLayout from '../../../shared/components/layout/AppLayout';

// Skeleton Components
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <div className="skeleton skeleton-text lg w-28"></div>
        <div className="skeleton skeleton-text sm w-24 mt-2"></div>
      </div>
      <div className="skeleton skeleton-btn w-12 h-6"></div>
    </div>
    <div className="flex justify-between mb-3">
      <div className="skeleton skeleton-btn w-16 h-6"></div>
      <div className="skeleton skeleton-text w-16"></div>
    </div>
    <div className="skeleton skeleton-btn w-full h-9"></div>
  </div>
);

// Empty State Component
const EmptyState = ({ searchTerm }) => (
  <div className="empty-state">
    <div className="empty-state-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
      {searchTerm ? <FaUserSlash /> : <FaCheck />}
    </div>
    <h3 className="empty-state-title">
      {searchTerm ? 'No results found' : 'All clear!'}
    </h3>
    <p className="empty-state-description">
      {searchTerm
        ? `No members match "${searchTerm}".`
        : 'No members expiring soon. Great job keeping everyone active!'}
    </p>
  </div>
);

const InactiveSoon = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [daysFilter, setDaysFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const activeFilterCount = (statusFilter !== "All" ? 1 : 0) + (daysFilter !== "All" ? 1 : 0) + (searchTerm ? 1 : 0);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [backendUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reminders/with-status`);
      const filtered = res.data
        .filter((user) => user.dews <= 4 && user.dews >= 0)
        .sort((a, b) => a.dews - b.dews);
      setContacts(filtered);
      setFilteredContacts(filtered);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = contacts;

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((c) => c.reminderStatus === statusFilter);
    }

    // Apply days filter
    if (daysFilter !== "All") {
      result = result.filter((c) => c.dews === parseInt(daysFilter));
    }

    // Apply search filter
    if (searchTerm) {
      result = result.filter((c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
      );
    }

    setFilteredContacts(result);
  }, [statusFilter, daysFilter, contacts, searchTerm]);

  const handleWhatsAppSend = async (contact) => {
    const { phone, name, dews, _id } = contact;
    if (!phone || !name || dews === undefined) return;

    const message = `Hi ${name}, your fit club membership expires in ${dews} day(s).
Please renew via GPay: +91 89714 23247
Send payment screenshot to confirm. Stay fit! 💪`;

    try {
      // Log the reminder
      await api.post(`/reminders/send/${_id}`);

      // Open WhatsApp with pre-filled message
      const digits = phone.replace(/[^\d]/g, '');
      const phoneNumber = digits.length === 10 ? `91${digits}` : digits;
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

      toast.success('Opening WhatsApp...');
      fetchData();
    } catch (error) {
      toast.error('Failed to log reminder');
    }
  };

  const sentCount = contacts.filter((c) => c.reminderStatus === "Sent").length;
  const pendingCount = contacts.filter((c) => c.reminderStatus !== "Sent").length;

  const getDaysColor = (days) => {
    if (days === 0) return 'text-zinc-900 bg-zinc-50';
    if (days <= 2) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const renderFilters = () => (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative w-full">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", "Pending", "Sent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === filter
              ? filter === "Pending" ? 'bg-orange-500 text-white shadow-sm'
                : filter === "Sent" ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-zinc-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Days filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {["All", "4", "3", "2", "1", "0"].map((day) => (
          <button
            key={day}
            onClick={() => setDaysFilter(day)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${daysFilter === day
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {day === "All" ? "All Days" : `${day} Day${day !== '1' ? 's' : ''}`}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout showGenderSwitch={false}>
      <div className="space-y-6">
        {/* Responsive Toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
          containerStyle={{
            bottom: 80,
          }}
        />

        {/* Inline header — title + actions on a single row even on mobile */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate min-w-0">
            Expiring Soon
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              disabled={loading}
              title="Refresh"
              aria-label="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="lg:hidden relative p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Filters"
              aria-label="Open filters"
            >
              <FaSlidersH />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats line — kept from the old PageHeader stats prop */}
        <div className="hidden lg:flex items-center gap-4 -mt-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FaSync className="text-gray-400" />
            <span>Pending:</span>
            <span className="font-semibold text-gray-900">{loading ? '...' : pendingCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FaCheck className="text-gray-400" />
            <span>Sent:</span>
            <span className="font-semibold text-gray-900">{loading ? '...' : sentCount}</span>
          </div>
        </div>

        {/* Toolbar — inline on desktop, hidden on mobile (mobile uses the bottom sheet) */}
        <div className="hidden lg:block bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          {renderFilters()}
        </div>

        {/* Mobile filter bottom sheet */}
        {isFilterSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsFilterSheetOpen(false)}
            />
            <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-zinc-800 max-h-[85vh] flex flex-col animate-sheet-up">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <FaSlidersH className="text-zinc-700" />
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Filters</h2>
                </div>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close filters"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}>
                {renderFilters()}
                <div className="flex gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('All');
                      setDaysFilter('All');
                      setSearchTerm('');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredContacts.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                      <FaUser className="text-gray-400 text-xs" />
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <FaPhone className="text-[10px]" />
                      {user.phone}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getDaysColor(user.dews)}`}>
                    <FaClock className="inline mr-1" />
                    {user.dews}d
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${user.reminderStatus === "Sent"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                    }`}>
                    {user.reminderStatus === "Sent" ? <FaCheck className="inline mr-1" /> : null}
                    {user.reminderStatus}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Sent {user.sentCount}x
                  </span>
                </div>

                <button
                  onClick={() => handleWhatsAppSend(user)}
                  className="w-full py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaWhatsapp />
                  Send Reminder
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </div>
    </AppLayout>
  );
};

export default InactiveSoon;

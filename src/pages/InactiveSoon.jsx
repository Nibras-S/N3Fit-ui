import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPhone, FaClock, FaUser, FaWhatsapp, FaCheck, FaExclamationTriangle, FaSync, FaSearch, FaUserSlash } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';

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
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [backendUrl]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/reminders/with-status`);
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

    const message = `Hi ${name}, your gym membership expires in ${dews} day(s).
Please renew via GPay: +91 89714 23247
Send payment screenshot to confirm. Stay fit! 💪`;

    try {
      // Log the reminder
      await axios.post(`${backendUrl}/api/reminders/send/${_id}`);

      // Open WhatsApp with pre-filled message
      const phoneNumber = phone.startsWith("91") ? phone : `91${phone}`;
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
    if (days === 0) return 'text-red-600 bg-red-50';
    if (days <= 2) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="p-4 lg:p-6">
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

      {/* Page Header */}
      <PageHeader
        title="Expiring Soon"
        stats={[
          { label: 'Pending', value: loading ? '...' : pendingCount, icon: FaExclamationTriangle },
          { label: 'Sent', value: loading ? '...' : sentCount, icon: FaCheck }
        ]}
        action={
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            disabled={loading}
            title="Refresh"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
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
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
              {["All", "Pending", "Sent"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${statusFilter === filter
                    ? filter === "Pending" ? 'bg-orange-500 text-white shadow-sm'
                      : filter === "Sent" ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
              {["All", "4", "3", "2", "1", "0"].map((day) => (
                <button
                  key={day}
                  onClick={() => setDaysFilter(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${daysFilter === day
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {day === "All" ? "All Days" : `${day} Day${day !== '1' ? 's' : ''}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>



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
  );
};

export default InactiveSoon;

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import AppLayout from "../layout/AppLayout";
import DataTable from "../components/ui/DataTable";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import bellAnimation from "./bellAnimation.json";
import {
  FaSearch, FaSync, FaTrash, FaMale, FaFemale, FaUserTimes, FaWhatsapp
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../components/ui/ConfirmModal';

function PageInactive() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedOption, setSelectedOption] = useState('1-Month');
  const [customDate, setCustomDate] = useState('');
  const [renewing, setRenewing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [archivedMembers, setArchivedMembers] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const { hasFeature } = useAuth();

  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${backendUrl}/api/settings`).then(res => setSettings(res.data)).catch(console.error);
  }, [backendUrl]);

  useEffect(() => {
    if (selectedOption && settings?.subscriptionPrices) {
      setAmount(settings.subscriptionPrices[selectedOption] || 0);
    }
  }, [selectedOption, settings]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const [contactsRes, remindersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/contacts/`),
        axios.get(`${backendUrl}/api/reminders/with-status`)
      ]);
      const merged = contactsRes.data.map(c => {
        const r = remindersRes.data.find(rem => rem._id === c._id);
        return { ...c, ...r };
      });
      setMembers(merged);
      const pending = remindersRes.data.filter(u => u.dews <= 4 && u.dews >= 0 && u.reminderStatus === "Pending");
      setPendingCount(pending.length);

      // Fetch archived members if feature is enabled
      if (hasFeature('archiveExpired')) {
        const archivedRes = await axios.get(`${backendUrl}/api/contacts/expired`);
        setArchivedMembers(archivedRes.data);
      } else {
        setArchivedMembers([]);
      }
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [backendUrl]);

  const stats = useMemo(() => {
    const expired = members.filter(u => u.dews < 0);
    return {
      total: expired.length,
      male: expired.filter(u => u.gender === 'Male').length,
      female: expired.filter(u => u.gender === 'Female').length
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let filtered = members.filter(u => u.dews < 0);
    if (genderFilter !== 'all') filtered = filtered.filter(u => u.gender === genderFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => u.name?.toLowerCase().includes(term) || u.phone?.includes(searchTerm));
    }
    filtered.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        valA = valA?.toLowerCase() || "";
        valB = valB?.toLowerCase() || "";
      } else if (['date', 'endDate', 'createdAt'].includes(sortConfig.key)) {
        valA = new Date(valA || 0);
        valB = new Date(valB || 0);
      } else if (sortConfig.key === 'dews') {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [members, genderFilter, searchTerm, sortConfig]);

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const handleRenew = async (userId) => {
    setRenewing(true);
    if (!selectedOption) return setRenewing(false);

    try {
      // Always start from today or custom date — server computes endDate and dews
      const newStart = customDate ? new Date(customDate) : new Date();

      await axios.put(`${backendUrl}/api/contacts/${userId}`, {
        date: newStart.toISOString(),
        plan: selectedOption,
        amount: parseInt(amount),
        paymentMethod,
        paymentStatus
      });
      await axios.patch(`${backendUrl}/api/reminders/reset/${userId}`, { sentCount: 0, messageStatus: 'Pending', lastSentAt: null });

      toast.success(`Renewed for ${selectedOption}! WhatsApp confirmation sent.`);
      fetchMembers();
      setExpandedRow(null);
    } catch { toast.error('Failed to renew'); }
    finally { setRenewing(false); }
  };

  const handleDelete = async () => {
    const { id, name } = deleteModal;
    try {
      await axios.delete(`${backendUrl}/api/contacts/${id}`);
      setMembers(prev => prev.filter(u => u._id !== id));
      toast.success(`${name} deleted`);
    } catch { toast.error('Failed to delete'); }
  };

  const handleWhatsApp = async (userId, phone, name, dews) => {
    const message = encodeURIComponent(`Hello ${name}, we noticed that your membership expired ${Math.abs(dews)} days ago. Please contact us to renew. Thank you!`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    try {
      await axios.post(`${backendUrl}/api/reminders/log/${userId}`);
      setMembers(prev => prev.map(m => m._id === userId
        ? { ...m, reminderStatus: "Sent", sentCount: (m.sentCount || 0) + 1 }
        : m
      ));
      toast.success('Reminder logged!');
    } catch (err) {
      console.error('Failed to update reminder status:', err);
      toast.error('Failed to log reminder');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Name', sortable: true,
      render: (row) => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50/80 p-1 -m-1 rounded-lg transition-colors group"
          onClick={() => navigate(`/members/${row._id}`)}
        >
          {row.profileImage ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                alt={row.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${row.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
              {row.name?.charAt(0)}
            </div>
          )}
          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{row.name}</span>
        </div>

      )
    },
    { key: 'phone', label: 'Phone', render: (row) => <span className="text-gray-500">{row.phone}</span> },
    {
      key: 'dews', label: 'Expired', sortable: true,
      render: (row) => <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">{Math.abs(row.dews)}d ago</span>
    },
    {
      key: 'reminderStatus', label: 'Status',
      render: (row) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${row.reminderStatus === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {row.reminderStatus || 'Pending'}
        </span>
      )
    },
    {
      key: 'sentCount', label: 'Sent',
      render: (row) => <span className="text-gray-600 font-medium">{row.sentCount || 0}</span>
    }
  ];

  const renderActions = (row) => (
    <div className="flex items-center gap-2">
      <button onClick={() => handleWhatsApp(row._id, row.phone, row.name, row.dews)} className="px-2.5 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 flex items-center gap-1"><FaWhatsapp /> Send</button>
      <button onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Renew</button>
      <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
    </div>
  );

  const renderExpandedRow = (row) => (
    <div className="flex flex-wrap items-center gap-3">
      <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
        <option>1-Month</option><option>2-Month</option><option>3-Month</option>
      </select>
      <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-24 px-3 py-2 border rounded-lg text-sm" placeholder="Amount" />
      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
        <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
      </select>
      <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
        <option>Paid</option><option>Pending</option><option>Partial</option>
      </select>
      <button onClick={() => handleRenew(row._id)} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Confirm</button>
      <button onClick={() => setExpandedRow(null)} className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
    </div>
  );

  const renderMobileCard = (row) => (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {row.profileImage ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
              <img
                src={row.profileImage.startsWith('http') ? row.profileImage : `${backendUrl}${row.profileImage}`}
                alt={row.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${row.gender === 'Male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
              {row.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.phone}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">{Math.abs(row.dews)}d ago</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full font-semibold ${row.reminderStatus === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {row.reminderStatus || 'Pending'}
          </span>
          <span className="text-gray-500">Sent: {row.sentCount || 0}x</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Ended: {formatDate(row.endDate)}</span>
        <div className="flex gap-2">
          <button onClick={() => handleWhatsApp(row._id, row.phone, row.name, row.dews)} className="px-2 py-1.5 bg-green-500 text-white text-xs font-medium rounded flex items-center gap-1"><FaWhatsapp /> Send</button>
          <button onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)} className="px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded">Renew</button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FaTrash /></button>
        </div>
      </div>
      {expandedRow === row._id && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} className="px-2 py-2 border rounded text-sm">
              <option>1-Month</option><option>2-Month</option><option>3-Month</option>
            </select>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="px-2 py-2 border rounded text-sm" placeholder="₹" />
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="px-2 py-2 border rounded text-sm">
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
            </select>
            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="px-2 py-2 border rounded text-sm">
              <option>Paid</option><option>Pending</option><option>Partial</option>
            </select>
          </div>
          <button onClick={() => handleRenew(row._id)} className="w-full py-2 bg-green-600 text-white text-sm font-medium rounded-lg">Confirm</button>
        </div>
      )}
    </>
  );

  return (
    <AppLayout showGenderSwitch={false}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />

      {renewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Renewing...</p>
          </div>
        </div>
      )}

      <PageHeader
        title="Expired Members"
        gender={genderFilter}
        stats={[
          { label: 'Total Expired', value: stats.total, icon: FaUserTimes },
          { label: 'Male', value: stats.male, icon: FaMale },
          { label: 'Female', value: stats.female, icon: FaFemale }
        ]}
        action={
          <button
            onClick={() => navigate("/active")}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            ← Back to Active
          </button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {['all', 'Male', 'Female'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setGenderFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${genderFilter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'all' ? 'All' : tab}
                </button>
              ))}
            </div>

            <button
              onClick={fetchMembers}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              title="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <DataTable
        data={filteredMembers}
        columns={columns}
        loading={loading}
        emptyMessage="No expired members"
        emptyDescription="All members are up to date!"
        sortConfig={sortConfig}
        onSort={handleSort}
        renderActions={renderActions}
        renderMobileCard={renderMobileCard}
        renderExpandedRow={renderExpandedRow}
        expandedRowId={expandedRow}
        hoverColor="hover:bg-red-50"
        gender={genderFilter} // Pass gender for dynamic theming
      />

      {/* Archived Members Section — Gated by Feature */}
      {hasFeature('archiveExpired') && archivedMembers.length > 0 && (
        <div className="mt-12 mb-20">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FaUserTimes className="text-gray-500" />
              <span className="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-widest text-xs">
                Archived Members ({archivedMembers.length})
              </span>
              <span className="text-[10px] text-gray-500 lowercase font-normal italic">— expired {">"} 3 months ago</span>
            </div>
            <span className="text-gray-400">{showArchived ? 'Hide' : 'Show'}</span>
          </button>

          {showArchived && (
            <div className="mt-4 animate-fadeIn">
              <DataTable
                data={archivedMembers}
                columns={columns}
                loading={loading}
                emptyMessage="No archived members"
                sortConfig={sortConfig}
                onSort={handleSort}
                renderActions={renderActions}
                renderMobileCard={renderMobileCard}
                renderExpandedRow={renderExpandedRow}
                expandedRowId={expandedRow}
                hoverColor="hover:bg-gray-100"
              />
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-20 right-4 z-10 md:bottom-6 md:right-6">
        <button onClick={() => navigate("/inactivesoon")} className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative">
          <Lottie animationData={bellAnimation} loop style={{ width: 32, height: 32 }} />
          {pendingCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">{pendingCount}</span>}
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteModal.name}? This action cannot be undone.`}
        type="danger"
      />
    </AppLayout >
  );
}

export default PageInactive;

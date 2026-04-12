import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaUsers, FaMale, FaFemale, FaSearch, FaEdit, FaTrash, FaTimes, FaSync } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import DataTable from '../../../shared/components/data/DataTable';
import PageHeader from '../../../shared/components/layout/PageHeader';
import EditMemberModal from './EditMemberModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import CSVImportModal from './ImportModal';
import { FaFileImport } from 'react-icons/fa';
import { useAuth } from '../../auth/context/AuthContext';

const AllMembers = () => {
    const { hasFeature } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: "" });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // Search Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                status: 'all', // Fetch both Active and Inactive
                search: debouncedSearch,
                gender: genderFilter,
                sortBy: sortConfig.key,
                sortOrder: sortConfig.direction,
                includeExpired: true
            };

            const response = await api.get(`/contacts/`, { params });

            // Response is auto-unwrapped to: { data: [], pagination: {} }
            const data = response.data?.data || [];
            const pagination = response.data?.pagination || {};

            setMembers(data);
            setTotalRecords(pagination.total || 0);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when params change
    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backendUrl, page, limit, debouncedSearch, genderFilter, sortConfig]);

    const stats = useMemo(() => ({
        total: totalRecords,
        male: 0, // Placeholder
        female: 0, // Placeholder
        active: 0 // Placeholder
    }), [totalRecords]);

    // handleSort updates state which triggers fetch
    const handleSort = (key) => setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

    const handleDeleteClick = async () => {
        const { id, name } = deleteModal;
        try {
            await api.delete(`/contacts/${id}`);
            setMembers(prev => prev.filter(u => u._id !== id));
            toast.success('Member deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const handleEditClick = (userId) => {
        setEditData(userId); // Store ID instead of full object
        setIsEditing(true);
    };

    const handleUpdateSuccess = () => {
        setIsEditing(false);
        fetchMembers();
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

    // Column definitions
    const columns = [
        {
            key: 'name', label: 'Name', sortable: true,
            render: (row) => (
                <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded-lg transition-colors group"
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${row.gender === 'Male' ? 'bg-zinc-100 text-zinc-900' : 'bg-pink-100 text-pink-600'}`}>
                            {row.name?.charAt(0)}
                        </div>
                    )}
                    <span className="font-medium text-gray-900 group-hover:text-zinc-900 transition-colors">{row.name}</span>
                </div>
            )
        },
        { key: 'phone', label: 'Phone', sortable: true, render: (row) => <span className="text-gray-500">{row.phone}</span> },
        {
            key: 'status', label: 'Status',
            render: (row) => <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${row.dews >= 0 ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>{row.dews >= 0 ? 'Active' : 'Expired'}</span>
        },
        {
            key: 'dews', label: 'Days Left', sortable: true,
            render: (row) => <span className={row.dews < 0 ? 'text-zinc-700 font-medium' : 'text-gray-700'}>{row.dews}</span>
        },
        {
            key: 'paymentStatus', label: 'Payment',
            render: (row) => {
                const statusStyles = {
                    Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    Partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    Refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                };
                const status = row.paymentStatus || 'Pending';
                return (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.Pending}`}>
                        {status}
                    </span>
                );
            }
        },
        { key: 'date', label: 'Start Date', sortable: true, render: (row) => <span className="text-gray-500 text-sm">{formatDate(row.date)}</span> },
        { key: 'endDate', label: 'End Date', sortable: true, render: (row) => <span className="text-gray-500 text-sm">{formatDate(row.endDate)}</span> }
    ];

    const renderActions = (row) => (
        <div className="flex gap-2">
            <button onClick={() => handleEditClick(row._id)} className="p-1.5 text-zinc-700 hover:bg-zinc-50 rounded-lg"><FaEdit /></button>
            <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="p-1.5 text-zinc-700 hover:bg-zinc-50 rounded-lg"><FaTrash /></button>
        </div>
    );

    const renderMobileCard = (row) => (
        <>
            <div className="flex justify-between items-start mb-3">
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${row.gender === 'Male' ? 'bg-zinc-100 text-zinc-900' : 'bg-pink-100 text-pink-600'}`}>
                            {row.name?.charAt(0)}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-900">{row.name}</div>
                        <div className="text-sm text-gray-500">{row.phone}</div>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.dews >= 0 ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>
                    {row.dews >= 0 ? 'Active' : 'Expired'}
                </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span className={row.dews < 0 ? 'text-zinc-700 font-medium' : ''}>{row.dews} days</span>
                <span>{formatDate(row.date)}</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => handleEditClick(row._id)} className="flex-1 py-2 bg-zinc-50 text-zinc-900 font-medium rounded-lg text-sm flex items-center justify-center gap-2"><FaEdit /> Edit</button>
                <button onClick={() => setDeleteModal({ isOpen: true, id: row._id, name: row.name })} className="flex-1 py-2 bg-zinc-50 text-zinc-900 font-medium rounded-lg text-sm flex items-center justify-center gap-2"><FaTrash /> Delete</button>
            </div>
        </>
    );

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '10px' } }} />

            {/* Page Header */}
            <PageHeader
                title="All Members"
                gender={genderFilter} // Pass gender for dynamic theming
                stats={[
                    { label: 'Total', value: stats.total, icon: FaUsers },
                    { label: 'Male', value: stats.male, icon: FaMale },
                    { label: 'Female', value: stats.female, icon: FaFemale },
                    { label: 'Active', value: stats.active, icon: undefined } // No specific icon for active in stats chips usually, maybe allow text only? Or reuse FaUsers?
                ]}
            />

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm"
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {hasFeature('memberImport') && (
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-bold border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all font-outfit"
                            >
                                <FaFileImport size={14} />
                                <span>Import CSV</span>
                            </button>
                        )}
                        <button
                            onClick={fetchMembers}
                            disabled={loading}
                            className="p-2 text-gray-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors border border-transparent hover:border-zinc-200"
                            title="Refresh"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} />
                        </button>
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
                    </div>
                </div>
            </div>

            {/* DataTable */}
            <DataTable
                data={members}
                columns={columns}
                loading={loading}
                emptyMessage="No members found"
                emptyDescription={searchTerm ? 'Try a different search' : 'Add new members to get started'}
                sortConfig={sortConfig}
                onSort={handleSort}
                renderActions={renderActions}
                renderMobileCard={renderMobileCard}
                hoverColor="hover:bg-zinc-50"
                gender={genderFilter} // Pass gender for dynamic theming
                serverSide={true}
                count={totalRecords}
                page={page}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
                rowsPerPage={limit}
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteClick}
                title="Delete Member"
                message={`Are you sure you want to delete ${deleteModal.name}? This action cannot be undone.`}
                type="danger"
            />

            {
                isEditing && editData && (
                    <EditMemberModal
                        memberId={editData}
                        onClose={() => setIsEditing(false)}
                        onUpdate={handleUpdateSuccess}
                    />
                )
            }

            {/* Import Modal */}
            <CSVImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onRefresh={fetchMembers}
            />
        </div >
    );
};

export default AllMembers;

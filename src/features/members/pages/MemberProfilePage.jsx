import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../shared/services/api';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import {
    FaUser, FaPhone, FaCalendarAlt, FaHistory, FaEdit,
    FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaMoneyBillWave
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import EditMemberModal from '../components/EditMemberModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';

function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, txnRes] = await Promise.all([
                    api.get(`${backendUrl}/api/contacts/${id}`),
                    api.get(`${backendUrl}/api/transactions?memberId=${id}`)
                ]);
                setMember(memberRes.data);
                const txnData = txnRes.data;
                setTransactions(Array.isArray(txnData) ? txnData : []);
            } catch (error) {
                console.error("Error fetching member details:", error);
                toast.error("Failed to load member details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, backendUrl]);

    const handleUpdateSuccess = (updatedMember) => {
        setMember(updatedMember);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`${backendUrl}/api/contacts/${id}`);
            toast.success("Member deleted successfully");
            navigate('/manageUsers');
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete member");
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </AppLayout>
        );
    }

    if (!member) return <AppLayout><div>Member not found</div></AppLayout>;

    const statusColor = member.dews >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
    const statusText = member.dews >= 0 ? "Active" : "Expired";

    return (
        <AppLayout>
            <Toaster position="top-right" />

            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
                >
                    <FaArrowLeft /> Back
                </button>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {member.profileImage ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                                <img
                                    src={member.profileImage.startsWith('http') ? member.profileImage : `${backendUrl}${member.profileImage}`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${member.gender === 'Male' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                {member.name?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${member.dews >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                    {statusText}
                                </span>
                                <span className="flex items-center gap-1 text-sm"><FaPhone className="text-xs" /> {member.phone}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                    >
                        <FaEdit /> Edit Member
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Overview
                        {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Transaction History
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                                <FaUser className="text-blue-500" /> Membership Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Current Plan</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{member.plan || 'No Plan'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Status</p>
                                    <p className={`font-bold ${member.dews >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {member.dews >= 0 ? `${member.dews} Days Left` : `${Math.abs(member.dews)} Days Overdue`}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Start Date</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {new Date(member.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Expiry Date</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {new Date(member.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Info</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Joined On:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                            {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Gender:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{member.gender}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaHistory className="text-blue-500" /> Payment History
                                </h3>
                                <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {transactions.length} Records
                                </span>
                            </div>

                            {transactions.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <table className="hidden md:table w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-900">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Method</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                            {transactions.map((txn) => (
                                                <tr key={txn._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 group">
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{txn.plan}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">₹{txn.amount}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{txn.paymentMethod}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            txn.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {txn.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => navigate(`/invoice/${txn._id}`)}
                                                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="View Invoice"
                                                        >
                                                            Invoice
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
                                        {transactions.map((txn) => (
                                            <div key={txn._id} className="p-4 flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{txn.plan}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            txn.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {txn.paymentStatus}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <span>{txn.paymentMethod}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">₹{txn.amount}</p>
                                                    <button
                                                        onClick={() => navigate(`/invoice/${txn._id}`)}
                                                        className="text-blue-500 text-xs font-medium mt-0.5"
                                                    >
                                                        Invoice
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    No transaction history found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Stats/Actions) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <FaMoneyBillWave /> Total Spent
                        </div>
                        <p className="text-3xl font-bold">
                            ₹{transactions.reduce((sum, t) => sum + (t.paymentStatus === 'Paid' ? t.amount : 0), 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs opacity-75 mt-1">Lifetime Value</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2.5 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaCheckCircle /> Renew Membership
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaEdit /> Update Details
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaExclamationCircle /> Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <EditMemberModal
                    memberId={id}
                    onClose={() => setIsEditing(false)}
                    onUpdate={handleUpdateSuccess}
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Member"
                message={`Are you sure you want to delete ${member.name}? This action cannot be undone.`}
                type="danger"
            />
        </AppLayout>
    );
}

export default MemberProfile;

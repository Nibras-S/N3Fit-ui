import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/components/layout/AppLayout';
import {
    FaUser, FaPhone, FaCalendarAlt, FaHistory, FaEdit,
    FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaMoneyBillWave, FaPlusCircle, FaIdCard, FaSearchPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import EditMemberModal from '../components/EditMemberModal';
import RenewMembershipModal from '../components/RenewMembershipModal';
import ConfirmModal from '../../../shared/components/feedback/ConfirmModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import EditEndDateModal from '../components/EditEndDateModal';
import MembershipHistoryTab from '../components/MembershipHistoryTab';
import { ProfileSkeleton } from '../../../shared/components/ui/Skeleton';
import ImageViewer from '../../../shared/components/ui/ImageViewer';
import { getImageUrl } from '../../../shared/lib/imageUrl';
import { useQueryClient } from '@tanstack/react-query';
import {
    useMember,
    useMemberTransactions,
    useMemberAudit,
    useDeleteMember,
    memberKeys,
} from '../hooks/useMembersQueries';

function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paymentTxn, setPaymentTxn] = useState(null);
    const [isExtendOpen, setIsExtendOpen] = useState(false);
    const [renewOpen, setRenewOpen] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);

    // Three parallel queries — TanStack Query runs them in parallel and
    // each caches independently, so revisiting this page or opening a
    // modal that also reads /contacts/:id is free after the first load.
    const memberQuery = useMember(id);
    const transactionsQuery = useMemberTransactions(id);
    const auditQuery = useMemberAudit(id);
    const queryClient = useQueryClient();

    const member = memberQuery.data;
    const transactions = transactionsQuery.data ?? [];
    const auditLogs = auditQuery.data ?? [];
    const loading = memberQuery.isPending;

    // Invalidate the whole member-detail subtree so detail + transactions +
    // audit all refetch. One call covers all three because memberKeys.detail(id)
    // is the prefix for detailTransactions and detailAudit.
    const handleUpdateSuccess = () => {
        queryClient.invalidateQueries({ queryKey: memberKeys.detail(id) });
    };

    const deleteMemberMutation = useDeleteMember();
    const handleDelete = () => {
        deleteMemberMutation.mutate(id, {
            onSuccess: () => {
                toast.success('Member deleted successfully');
                navigate('/manageUsers');
            },
            onError: (error) => {
                console.error('Delete error:', error);
                toast.error('Failed to delete member');
            },
        });
    };

    if (loading) {
        return (
            <AppLayout>
                <ProfileSkeleton />
            </AppLayout>
        );
    }

    if (!member) return <AppLayout><div>Member not found</div></AppLayout>;

    const statusText = member.dews >= 0 ? "Active" : "Expired";

    return (
        <AppLayout>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <FaArrowLeft /> Back
                    </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-4 min-w-0">
                        {member.profileImage ? (
                            <button
                                type="button"
                                onClick={() => setIsImageOpen(true)}
                                aria-label={`View ${member.name}'s profile photo`}
                                className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md shrink-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 transition"
                            >
                                <img
                                    src={getImageUrl(member.profileImage)}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/35">
                                    <FaSearchPlus className="text-white text-sm" />
                                </span>
                            </button>
                        ) : (
                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 ${member.gender === 'Male' ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700/50 dark:text-zinc-500' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                {member.name?.charAt(0)}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white truncate">{member.name}</h1>
                            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${member.dews >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-500'}`}>
                                    {statusText}
                                </span>
                                <span className="flex items-center gap-1 text-xs sm:text-sm"><FaPhone className="text-xs" /> {member.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit button — icon-only on mobile, full label on desktop */}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
                    >
                        <FaEdit />
                        <span className="hidden sm:inline">Edit Member</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-zinc-800 mb-6 overflow-x-auto hide-scrollbar">
                <div className="flex gap-6 min-w-max">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-zinc-900 dark:text-zinc-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Overview
                        {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-zinc-900 dark:text-zinc-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Transaction History
                        {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('memberships')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-1.5 ${activeTab === 'memberships' ? 'text-zinc-900 dark:text-zinc-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <FaIdCard className="text-xs" /> Memberships
                        {activeTab === 'memberships' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'audit' ? 'text-zinc-900 dark:text-zinc-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Edit History
                        {activeTab === 'audit' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-t-full"></div>}
                        {auditLogs.length > 0 && (
                            <span className="ml-1.5 text-[10px] bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-300 px-1.5 py-0.5 rounded-full font-semibold">
                                {auditLogs.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                                <FaUser className="text-zinc-700" /> Membership Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Current Plan</p>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">{member.plan || 'No Plan'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Status</p>
                                    <p className={`font-bold ${member.dews >= 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-500'}`}>
                                        {member.dews >= 0 ? `${member.dews} Days Left` : `${Math.abs(member.dews)} Days Overdue`}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Start Date</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {new Date(member.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Expiry Date</p>
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {new Date(member.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsExtendOpen(true)}
                                            title="Extend membership"
                                            className="flex items-center gap-1 text-xs text-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium transition-colors mt-0.5"
                                        >
                                            <FaPlusCircle className="text-sm" /> Extend
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Additional Info</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Joined On:</span>
                                        <span className="ml-2 text-gray-900 dark:text-white font-medium">
                                            {(member.joinedDate || member.createdAt) ? new Date(member.joinedDate || member.createdAt).toLocaleDateString() : '-'}
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
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaHistory className="text-zinc-700" /> Payment History
                                </h3>
                                <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {transactions.length} Records
                                </span>
                            </div>

                            {transactions.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <table className="hidden md:table w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-zinc-950">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Method</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                            {transactions.map((txn) => (
                                                <tr key={txn._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 group">
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{txn.plan}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">₹{txn.amount}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{txn.paymentMethod}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            txn.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-500'
                                                            }`}>
                                                            {txn.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {(txn.paymentStatus === 'Pending' || txn.paymentStatus === 'Partial') && (
                                                                <button
                                                                    onClick={() => setPaymentTxn(txn)}
                                                                    className="px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium whitespace-nowrap"
                                                                >
                                                                    Mark as Paid
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => navigate(`/invoice/${txn._id}`)}
                                                                className="text-zinc-700 hover:text-zinc-700 dark:hover:text-red-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="View Invoice"
                                                            >
                                                                Invoice
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
                                        {transactions.map((txn) => (
                                            <div key={txn._id} className="p-4 flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{txn.plan}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${txn.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            txn.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-500'
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
                                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">₹{txn.amount}</p>
                                                    {(txn.paymentStatus === 'Pending' || txn.paymentStatus === 'Partial') && (
                                                        <button
                                                            onClick={() => setPaymentTxn(txn)}
                                                            className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-medium"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigate(`/invoice/${txn._id}`)}
                                                        className="text-zinc-700 text-xs font-medium"
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
                    {activeTab === 'memberships' && (
                        <MembershipHistoryTab memberId={id} />
                    )}
                    {activeTab === 'audit' && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaCalendarAlt className="text-zinc-900" /> Membership Edit History
                                </h3>
                                <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                    {auditLogs.length} {auditLogs.length === 1 ? 'Change' : 'Changes'}
                                </span>
                            </div>

                            {auditLogs.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {auditLogs.map((log) => (
                                        <div key={log._id} className="p-4 space-y-1.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {log.performedBy?.name || 'Unknown'}
                                                        <span className="ml-1.5 text-xs font-normal text-gray-400">({log.performedBy?.role})</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        {' '}at{' '}
                                                        {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-[10px] bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-300 px-2 py-0.5 rounded-full font-medium">
                                                    End Date Edit
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                <span className="line-through text-gray-400">
                                                    {new Date(log.previousEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' '}({log.previousDews}d)
                                                </span>
                                                <span className="text-gray-400">→</span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {new Date(log.newEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' '}({log.newDews}d)
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                "{log.reason}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    No edit history found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Stats/Actions) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <FaMoneyBillWave /> Total Spent
                        </div>
                        <p className="text-3xl font-bold">
                            ₹{transactions.reduce((sum, t) => sum + (t.paymentStatus === 'Paid' ? t.amount : 0), 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs opacity-75 mt-1">Lifetime Value</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h4 className="font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => setRenewOpen(true)}
                                className="w-full py-2.5 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaCheckCircle /> Renew Membership
                            </button>
                            <button
                                onClick={() => setIsExtendOpen(true)}
                                className="w-full py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaPlusCircle /> Extend Days
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaEdit /> Update Details
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaExclamationCircle /> Delete Member
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renew membership flow (plan → amount → payment) */}
            {renewOpen && member && (
                <RenewMembershipModal
                    member={member}
                    onClose={() => setRenewOpen(false)}
                    onRenewed={handleUpdateSuccess}
                />
            )}

            {/* Record Payment Modal */}
            {paymentTxn && (
                <RecordPaymentModal
                    transactionId={paymentTxn._id}
                    totalAmount={paymentTxn.amount}
                    paidSoFar={paymentTxn.paidAmount || 0}
                    memberName={member.name}
                    confirmCancel={!!(paymentTxn.pendingRenewal && !paymentTxn.pendingRenewal.applied)}
                    onClose={() => setPaymentTxn(null)}
                    onPaid={() => { setPaymentTxn(null); handleUpdateSuccess(); }}
                />
            )}

            {/* Extend End Date Modal */}
            <EditEndDateModal
                isOpen={isExtendOpen}
                onClose={() => setIsExtendOpen(false)}
                member={member}
                onSuccess={() => { setIsExtendOpen(false); handleUpdateSuccess(); }}
            />

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

            {/* Full-screen profile photo preview (pinch / double-tap to zoom) */}
            {member.profileImage && (
                <ImageViewer
                    isOpen={isImageOpen}
                    onClose={() => setIsImageOpen(false)}
                    src={getImageUrl(member.profileImage)}
                    alt={member.name}
                />
            )}
        </AppLayout>
    );
}

export default MemberProfile;

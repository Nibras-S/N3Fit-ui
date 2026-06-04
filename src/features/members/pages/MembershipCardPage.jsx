import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    FaCheckCircle, FaClock, FaExclamationTriangle,
    FaDumbbell, FaMoneyBillWave,
    FaCalendarAlt, FaIdCard, FaWhatsapp,
} from 'react-icons/fa';
import api from '../../../shared/services/api';
import { openWhatsApp } from '../../../shared/lib/phone';
import { useAuth } from '../../auth/context/AuthContext';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { CardSkeleton } from '../../../shared/components/ui/Skeleton';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const toIST = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
    });
};

const STATUS_CONFIG = {
    Paid: {
        icon: FaCheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        label: 'Paid',
        dot: 'bg-emerald-500',
    },
    Pending: {
        icon: FaClock,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        label: 'Payment Pending',
        dot: 'bg-amber-500',
    },
    Partial: {
        icon: FaExclamationTriangle,
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        label: 'Partial Payment',
        dot: 'bg-orange-500',
    },
};

export default function MembershipCardPage() {
    const { id: memberId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // transactionId can be passed as a URL param to pre-select the right txn
    const txnIdFromUrl = searchParams.get('txn');

    const [member, setMember] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [memberRes, txnRes] = await Promise.all([
                    api.get(`/contacts/${memberId}`),
                    txnIdFromUrl
                        ? api.get(`/transactions/${txnIdFromUrl}`)
                        : api.get(`/transactions?memberId=${memberId}&sortBy=transactionDate&sortOrder=desc&limit=1`),
                ]);

                setMember(memberRes.data);

                if (txnIdFromUrl) {
                    setTransaction(txnRes.data);
                } else {
                    const list = txnRes.data?.data || txnRes.data;
                    setTransaction(Array.isArray(list) ? list[0] : null);
                }
            } catch {
                // api interceptor handles toast
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [memberId, txnIdFromUrl]);

    const handlePaid = (updatedTxn) => {
        setTransaction(updatedTxn);
        setShowPayModal(false);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
            </AppLayout>
        );
    }

    if (!member) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <p className="text-gray-500">Member not found.</p>
                    <button onClick={() => navigate('/members')} className="px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm">
                        Back to Members
                    </button>
                </div>
            </AppLayout>
        );
    }

    const status = transaction?.paymentStatus || 'Pending';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    const profileImg = member.profileImage
        ? (member.profileImage.startsWith('http') ? member.profileImage : `${backendUrl}${member.profileImage}`)
        : null;

    const totalAmount = transaction?.amount || 0;
    const paidSoFar = transaction?.paidAmount || 0;
    const balanceDue = Math.max(0, totalAmount - paidSoFar);
    const isPendingOrPartial = status === 'Pending' || status === 'Partial';

    const gymName = user?.gym?.name || 'N3FitBook';
    const gymLogo = user?.gym?.logo
        ? (user.gym.logo.startsWith('http') ? user.gym.logo : `${backendUrl}${user.gym.logo}`)
        : null;

    return (
        <AppLayout showBackToList={false}>
            {/* Full-page centred layout */}
            <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">

                {/* ── Membership Card ─────────────────────────────────────── */}
                <div className="w-full max-w-sm">

                    {/* Card container with gradient accent on top */}
                    <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">

                        {/* Top colour band */}
                        <div className="h-2 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500" />

                        <div className="p-6 space-y-5">
                            {/* Gym header */}
                            <div className="flex items-center gap-3">
                                {gymLogo ? (
                                    <img src={gymLogo} alt={gymName} className="w-10 h-10 rounded-xl object-contain bg-gray-50 dark:bg-zinc-800 p-1" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                                        <FaDumbbell className="text-white" size={16} />
                                    </div>
                                )}
                                <div>
                                    <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{gymName}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Membership Card</p>
                                </div>
                                {/* Status badge top-right */}
                                <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </div>
                            </div>

                            {/* Member identity */}
                            <div className="flex items-center gap-4">
                                {profileImg ? (
                                    <img src={profileImg} alt={member.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-md" />
                                ) : (
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${
                                        member.gender === 'Female' ? 'bg-pink-100 text-pink-600' : 'bg-zinc-100 text-zinc-900'
                                    }`}>
                                        {member.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900 dark:text-white text-lg leading-tight truncate">{member.name}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{member.phone}</p>
                                    {member.gender && (
                                        <span className="text-[9px] font-black uppercase bg-gray-100 dark:bg-zinc-800 text-gray-500 px-2 py-0.5 rounded-full">
                                            {member.gender}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-dashed border-gray-100 dark:border-zinc-800" />

                            {/* Plan + dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{member.plan}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{fmt(totalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <FaCalendarAlt size={7} /> Start
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{toIST(member.date)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <FaCalendarAlt size={7} /> Expires
                                    </p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{toIST(member.endDate)}</p>
                                </div>
                            </div>

                            {/* Payment summary (for Partial/Pending) */}
                            {status !== 'Paid' && (
                                <div className={`rounded-xl p-3 border ${cfg.border} ${cfg.bg}`}>
                                    {paidSoFar > 0 && (
                                        <div className="flex justify-between text-[11px] mb-1">
                                            <span className="text-gray-500 font-semibold">Paid so far</span>
                                            <span className="text-gray-900 dark:text-white font-bold">₹{fmt(paidSoFar)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[11px] font-black ${cfg.color}`}>Balance Due</span>
                                        <span className={`text-lg font-black ${cfg.color}`}>₹{fmt(balanceDue)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Paid confirmation */}
                            {status === 'Paid' && (
                                <div className="flex items-center gap-3 rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <FaCheckCircle className="text-emerald-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">Payment Complete</p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500">₹{fmt(totalAmount)} received via {transaction?.paymentMethod}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom band — gradient matches top */}
                        <div className="h-1 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 opacity-30" />
                    </div>

                    {/* ── Actions ──────────────────────────────────────────── */}
                    <div className="mt-5 space-y-3">

                        {/* Mark as Paid — prominent when payment is due */}
                        {isPendingOrPartial && transaction && (
                            <button
                                type="button"
                                onClick={() => setShowPayModal(true)}
                                className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2"
                            >
                                <FaMoneyBillWave size={15} />
                                Mark as Paid
                            </button>
                        )}

                        {/* Navigation actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate(`/members/${member._id}`)}
                                className="py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 rounded-xl font-black text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5"
                            >
                                <FaIdCard size={11} /> View Profile
                            </button>
                            <button
                                onClick={() => {
                                    // Use backend's dews (computed at IST midnight) so the count
                                    // matches exactly. Fallback to IST-midnight math if dews is missing.
                                    const istNow = new Date();
                                    const istMidnight = new Date(istNow.getTime() + 5.5 * 3600000);
                                    istMidnight.setUTCHours(0, 0, 0, 0);
                                    const todayIST = istMidnight.getTime() - 5.5 * 3600000;
                                    const days = Number.isFinite(member.dews)
                                        ? Math.max(0, member.dews)
                                        : Math.max(0, Math.round((new Date(member.endDate).getTime() - todayIST) / 86400000));
                                    const paidAmt = transaction?.paidAmount ?? 0;
                                    const balance = Math.max(0, totalAmount - paidAmt);
                                    const paymentStatus = transaction?.paymentStatus || 'Pending';
                                    const lines = [
                                        `Hello ${member.name},`,
                                        '',
                                        `Welcome to ${gymName}!`,
                                        '',
                                        `Plan: ${member.plan}`,
                                        `Total Amount: Rs. ${fmt(totalAmount)}`,
                                        `Amount Paid: Rs. ${fmt(paidAmt)}`,
                                        ...(balance > 0 ? [`Balance Due: Rs. ${fmt(balance)}`] : []),
                                        `Payment Status: ${paymentStatus}`,
                                        `Membership Valid Till: ${toIST(member.endDate)}`,
                                        `Days Remaining: ${days} days`,
                                        '',
                                        'Stay fit and strong!',
                                    ];
                                    openWhatsApp(member.phone, lines.join('\n'));
                                }}
                                className="py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-[11px] uppercase tracking-wide transition-all flex items-center justify-center gap-1.5"
                            >
                                <FaWhatsapp size={14} /> Share on WhatsApp
                            </button>
                        </div>

                        {/* Skip payment hint */}
                        {isPendingOrPartial && (
                            <p className="text-center text-[10px] text-gray-400">
                                Skip for now — transaction stays{' '}
                                <span className="font-bold text-amber-600">{status}</span> and appears in pending payments.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Record Payment Modal */}
            {showPayModal && transaction && (
                <RecordPaymentModal
                    transactionId={transaction._id}
                    totalAmount={totalAmount}
                    paidSoFar={paidSoFar}
                    memberName={member.name}
                    onClose={() => setShowPayModal(false)}
                    onPaid={handlePaid}
                />
            )}
        </AppLayout>
    );
}

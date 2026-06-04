import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../auth/context/AuthContext';
import { FaPrint, FaArrowLeft, FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { CardSkeleton } from '../../../shared/components/ui/Skeleton';
import { openWhatsApp } from '../../../shared/lib/phone';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const STATUS_STYLE = {
    Paid:    'bg-green-100 text-green-700',
    Partial: 'bg-amber-100 text-amber-700',
    Pending: 'bg-zinc-100 text-zinc-700',
    Refunded:'bg-red-100 text-red-700',
};

const METHOD_COLOR = {
    Cash:           'text-green-700',
    UPI:            'text-violet-700',
    Card:           'text-sky-700',
    'Bank Transfer':'text-amber-700',
    Split:          'text-zinc-700',
};

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const handleBack = () => {
        if (location.key === 'default') navigate('/transactions');
        else navigate(-1);
    };
    const { api } = useAuth();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/transactions/${id}`);
                setTransaction(res.data);
            } catch (err) {
                toast.error("Failed to load invoice");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [api, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] p-6">
                <CardSkeleton className="max-w-2xl mx-auto" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Invoice not found</p>
                <button onClick={() => navigate(-1)} className="text-zinc-900 hover:underline">Go Back</button>
            </div>
        );
    }

    const {
        gymId: gym,
        memberName,
        phone,
        amount = 0,
        discount = 0,
        plan,
        paymentMethod,
        paymentStatus,
        paidAmount = 0,
        splits = [],
        remarks,
        transactionDate,
        _id,
    } = transaction;

    const total = amount - discount;
    const balanceDue = Math.max(0, total - paidAmount);
    const isPartial = paymentStatus === 'Partial';
    const isPending = paymentStatus === 'Pending';
    const isSplit = paymentMethod === 'Split' && splits.length > 0;

    const invoiceDate = new Date(transactionDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    });

    return (
        <div
            className="min-h-screen bg-gray-50 px-3 pb-3 sm:px-6 sm:pb-6 md:px-8 md:pb-8 print:bg-white print:p-0"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        >
            <Toaster position="top-right" containerStyle={{ top: 'calc(env(safe-area-inset-top) + 24px)' }} />

            {/* Toolbar */}
            <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center print:hidden">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const digits = String(phone || '').replace(/\D/g, '');
                            if (!digits) {
                                toast.error('Member phone not available');
                                return;
                            }
                            const waPhone = digits.length === 10 ? `91${digits}` : digits;
                            const lines = [
                                `Hello ${memberName},`,
                                '',
                                `Invoice from ${gym?.name || 'Fit'}`,
                                `Invoice No: #${_id.slice(-6).toUpperCase()}`,
                                `Date: ${invoiceDate}`,
                                '',
                                `Plan: ${plan}`,
                                `Subtotal: Rs. ${fmt(amount)}`,
                                ...(discount > 0 ? [`Discount: Rs. ${fmt(discount)}`] : []),
                                `Total: Rs. ${fmt(total)}`,
                                `Paid: Rs. ${fmt(paidAmount)}`,
                                ...(balanceDue > 0 ? [`Balance Due: Rs. ${fmt(balanceDue)}`] : []),
                                `Payment Method: ${paymentMethod || '-'}`,
                                `Status: ${paymentStatus}`,
                                ...(remarks ? ['', `Note: ${remarks}`] : []),
                                '',
                                'Thank you for your business!',
                            ];
                            openWhatsApp(waPhone, lines.join('\n'));
                        }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm text-sm"
                    >
                        <FaWhatsapp /> <span className="hidden sm:inline">Share on WhatsApp</span><span className="sm:hidden">Share</span>
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm text-sm"
                    >
                        <FaPrint /> <span className="hidden sm:inline">Print Invoice</span><span className="sm:hidden">Print</span>
                    </button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div
                ref={invoiceRef}
                className="max-w-2xl mx-auto bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:w-full"
            >
                {/* ── Header ── */}
                <div className="border-b border-gray-100 pb-5 mb-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex gap-3 items-center min-w-0">
                            {gym?.logo ? (
                                <img
                                    src={gym.logo.startsWith('http') ? gym.logo : `${backendUrl}${gym.logo}`}
                                    alt="Logo"
                                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-lg bg-gray-50 shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-xl shrink-0">
                                    {gym?.name?.charAt(0) || 'G'}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{gym?.name || 'Fit'}</h1>
                                {gym?.address && <p className="text-xs text-gray-500 leading-snug">{gym.address}</p>}
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-100 uppercase tracking-widest leading-none">Invoice</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                            {gym?.contactPhone && <p>Tel: {gym.contactPhone}</p>}
                            {gym?.contactEmail && <p>{gym.contactEmail}</p>}
                        </div>
                        <div className="text-right space-y-0.5">
                            <p>Invoice No: <span className="font-mono font-semibold text-gray-900">#{_id.slice(-6).toUpperCase()}</span></p>
                            <p>Date: <span className="font-medium text-gray-900">{invoiceDate}</span></p>
                            <p>Status:
                                <span className={`ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLE[paymentStatus] || 'bg-zinc-100 text-zinc-700'}`}>
                                    {paymentStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Bill To ── */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="font-bold text-base sm:text-lg text-gray-900">{memberName}</p>
                    {phone && <p className="text-sm text-gray-500">Phone: {phone}</p>}
                </div>

                {/* ── Line Items ── */}
                <div className="mb-6 overflow-x-auto">
                    <table className="w-full min-w-[300px]">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Plan</th>
                                <th className="py-2.5 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="py-3 px-3 text-sm text-gray-900">
                                    <p className="font-medium">Membership Subscription</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{plan} Plan</p>
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600 text-right whitespace-nowrap">{plan}</td>
                                <td className="py-3 px-3 text-sm font-bold text-gray-900 text-right whitespace-nowrap">₹{fmt(amount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ── Totals + Payment Summary ── */}
                <div className="flex flex-col sm:flex-row sm:justify-between gap-6 mb-8">

                    {/* Payment Details (left column) */}
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>

                        {/* Split breakdown */}
                        {isSplit ? (
                            <div className="space-y-1.5">
                                {splits.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className={`font-semibold ${METHOD_COLOR[s.paymentMethod] || 'text-gray-700'}`}>
                                            {s.paymentMethod}
                                        </span>
                                        <span className="font-bold text-gray-900">₹{fmt(s.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
                                    <span>Split across {splits.length} methods</span>
                                    <span className="font-semibold text-gray-700">₹{fmt(paidAmount)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`font-semibold ${METHOD_COLOR[paymentMethod] || 'text-gray-700'}`}>
                                    {paymentMethod || '—'}
                                </span>
                                {(isPartial || isPending) && paidAmount > 0 && (
                                    <span className="text-gray-400 text-xs">· ₹{fmt(paidAmount)} paid</span>
                                )}
                            </div>
                        )}

                        {/* Remarks/notes */}
                        {remarks && (
                            <p className="text-xs text-gray-400 mt-3 italic">Note: {remarks}</p>
                        )}
                    </div>

                    {/* Totals (right column) */}
                    <div className="w-full sm:w-[220px] space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{fmt(amount)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-700">
                                <span>Discount</span>
                                <span>− ₹{fmt(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2.5 border-t border-gray-200">
                            <span>Total</span>
                            <span>₹{fmt(total)}</span>
                        </div>

                        {/* Paid / Balance rows for partial/pending */}
                        {(isPartial || isPending) && (
                            <>
                                <div className="flex justify-between text-sm text-green-700 pt-1">
                                    <span className="font-medium">Paid</span>
                                    <span className="font-bold">₹{fmt(paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-amber-700 pt-1 border-t border-gray-200">
                                    <span>Balance Due</span>
                                    <span>₹{fmt(balanceDue)}</span>
                                </div>
                            </>
                        )}

                        {/* Fully paid stamp */}
                        {paymentStatus === 'Paid' && (
                            <div className="mt-2 text-center py-1 rounded border border-green-200 bg-green-50 text-[10px] font-black text-green-700 uppercase tracking-widest">
                                Paid in Full
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="border-t border-gray-100 pt-5 text-center text-sm text-gray-400">
                    <p>Thank you for your business!</p>
                    <p className="mt-1 text-xs">Generated via N3FitBook Management Software</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;

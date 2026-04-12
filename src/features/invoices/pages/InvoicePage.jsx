import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../../auth/context/AuthContext';
import { FaPrint, FaArrowLeft, FaDownload, FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { CardSkeleton } from '../../../shared/components/ui/Skeleton';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const invoiceRef = useRef();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/transactions/${id}`);
                // Handle both new { success, data: {...} } and old direct object shapes
                const txData = res.data?.data ?? res.data;
                setTransaction(txData);
            } catch (err) {
                toast.error("Failed to load invoice");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [api, id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0d] p-6"><CardSkeleton className="max-w-2xl mx-auto" /></div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Invoice not found</p>
                <button onClick={() => navigate(-1)} className="text-zinc-900 hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    const { gymId: gym, memberId: member, amount, plan, paymentMethod, paymentStatus, transactionDate, _id } = transaction;
    const invoiceDate = new Date(transactionDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
    });

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 md:p-8 print:bg-white print:p-0">
            <Toaster position="top-right" />

            {/* Toolbar */}
            <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                    <FaArrowLeft /> Back
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-sm text-sm"
                >
                    <FaPrint /> <span className="hidden sm:inline">Print Invoice</span><span className="sm:hidden">Print</span>
                </button>
            </div>

            {/* Invoice Paper */}
            <div
                ref={invoiceRef}
                className="max-w-2xl mx-auto bg-white p-5 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:w-full"
            >
                {/* Header */}
                <div className="border-b border-gray-100 pb-5 mb-6">
                    {/* Top row: logo+name | INVOICE label */}
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

                    {/* Contact + invoice meta in a grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                            {gym?.contactPhone && <p>Tel: {gym.contactPhone}</p>}
                            {gym?.contactEmail && <p>{gym.contactEmail}</p>}
                        </div>
                        <div className="text-right space-y-0.5">
                            <p>Invoice No: <span className="font-mono font-semibold text-gray-900">#{_id.slice(-6).toUpperCase()}</span></p>
                            <p>Date: <span className="font-medium text-gray-900">{invoiceDate}</span></p>
                            <p>Status:
                                <span className={`ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-800'}`}>
                                    {paymentStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                    <p className="font-bold text-base sm:text-lg text-gray-900">{transaction.memberName}</p>
                    {transaction.phone && <p className="text-sm text-gray-500">Phone: {transaction.phone}</p>}
                </div>

                {/* Table */}
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
                                <td className="py-3 px-3 text-sm font-bold text-gray-900 text-right whitespace-nowrap">₹{amount.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-[220px] space-y-2.5">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Discount</span>
                            <span>₹{transaction.discount || 0}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2.5 border-t border-gray-100">
                            <span>Total</span>
                            <span>₹{(amount - (transaction.discount || 0)).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-5 text-center text-sm text-gray-400">
                    <p>Thank you for your business!</p>
                    <p className="mt-1 text-xs">Generated via Fit Management Software</p>
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

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from '../../auth/context/AuthContext';
import { FaPrint, FaArrowLeft, FaDownload, FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

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
                const res = await api.get(`/api/transactions/${id}`);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Invoice not found</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:bg-white print:p-0">
            <Toaster position="top-right" />

            {/* Toolbar (Hidden in Print) */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <FaPrint /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div
                ref={invoiceRef}
                className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:w-full"
            >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div className="flex gap-4 items-center">
                        {gym?.logo ? (
                            <img
                                src={`${backendUrl}${gym.logo}`}
                                alt="Fit Club Logo"
                                className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {gym?.name?.charAt(0) || "G"}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{gym?.name || "Fit"}</h1>
                            <p className="text-sm text-gray-500 max-w-[250px]">{gym?.address}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {gym?.contactPhone && <span>Tel: {gym.contactPhone}</span>}
                                {gym?.contactEmail && <span className="block">{gym.contactEmail}</span>}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-extrabold text-gray-100 uppercase tracking-widest">Invoice</h2>
                        <div className="mt-4 space-y-1">
                            <p className="text-sm text-gray-500">Invoice No: <span className="font-mono font-medium text-gray-900">#{_id.slice(-6).toUpperCase()}</span></p>
                            <p className="text-sm text-gray-500">Date: <span className="font-medium text-gray-900">{invoiceDate}</span></p>
                            <p className="text-sm text-gray-500">Status:
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {paymentStatus}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-10">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                    <div className="text-gray-900">
                        <p className="font-bold text-lg">{transaction.memberName}</p>
                        {transaction.phone && <p className="text-sm text-gray-500">Phone: {transaction.phone}</p>}
                        {member?.address && <p className="text-sm text-gray-500">{member.address}</p>}
                    </div>
                </div>

                {/* Table */}
                <table className="w-full mb-10">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Plan Type</th>
                            <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-4 px-4 text-sm text-gray-900">
                                <p className="font-medium">Fit Club Membership Subscription</p>
                                <p className="text-xs text-gray-500 mt-0.5">{plan} Plan</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 text-right">{plan}</td>
                            <td className="py-4 px-4 text-sm font-bold text-gray-900 text-right">₹{amount.toLocaleString("en-IN")}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{amount.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Discount</span>
                            <span>₹{transaction.discount || 0}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                            <span>Total</span>
                            <span>₹{(amount - (transaction.discount || 0)).toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
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

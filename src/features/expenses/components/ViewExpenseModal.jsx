import React from 'react';
import { FaTimes, FaRupeeSign, FaCalendarAlt, FaTag, FaCreditCard, FaUser, FaStickyNote, FaDownload, FaEye, FaFilePdf, FaImage, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const ViewExpenseModal = ({ isOpen, onClose, expense }) => {
    if (!isOpen || !expense) return null;

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const fileUrl = expense.receiptUrl
        ? (expense.receiptUrl.startsWith('http') ? expense.receiptUrl : `${backendUrl}${expense.receiptUrl}`)
        : null;
    const isPDF = expense.receiptUrl?.toLowerCase().endsWith('.pdf');

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                            <FaEye />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Details</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Reference: {expense._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1 flex flex-col md:flex-row">
                    {/* Left: Info */}
                    <div className="p-6 space-y-6 flex-1 border-r border-gray-100 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                    <FaTag className="text-zinc-600" /> {expense.category}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Amount</label>
                                <div className="text-2xl font-black text-zinc-700 dark:text-zinc-300">
                                    {formatCurrency(expense.amount)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <FaCalendarAlt className="text-purple-500" /> {formatDate(expense.date)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment Method</label>
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                    <FaCreditCard className="text-orange-500" /> {expense.paymentMethod}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Vendor / Receiver</label>
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                <FaUser className="text-zinc-900" /> {expense.vendor || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Note</label>
                            <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                {expense.note || <span className="italic opacity-50 text-xs text-gray-400">No additional notes provided.</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right: Attachment Preview */}
                    <div className="w-full md:w-72 bg-gray-50 dark:bg-zinc-950/50 p-6 flex flex-col">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Attachment</label>

                        {fileUrl ? (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center relative group">
                                    {isPDF ? (
                                        <div className="text-center p-4">
                                            <FaFilePdf size={48} className="mx-auto text-zinc-600 mb-2" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDF Document</p>
                                        </div>
                                    ) : (
                                        <img src={fileUrl} alt="Receipt" className="w-full h-full object-contain" />
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-colors"
                                            title="View Full"
                                        >
                                            <FaEye />
                                        </a>
                                        <a
                                            href={fileUrl}
                                            download
                                            className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors"
                                            title="Download"
                                        >
                                            <FaDownload />
                                        </a>
                                    </div>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                    <FaCheckCircle className="flex-shrink-0" />
                                    <span>Attachment Verified</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <FaTimesCircle size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium italic">No receipt attached to this expense.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all text-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewExpenseModal;

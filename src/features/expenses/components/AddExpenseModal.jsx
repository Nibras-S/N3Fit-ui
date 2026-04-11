import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaRupeeSign, FaCalendarAlt, FaTag, FaCreditCard, FaUser, FaUserTie, FaStickyNote, FaFileInvoice, FaPaperclip } from 'react-icons/fa';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import { FileUpload } from '../../../shared/components/ui/file-upload/file-upload-base';

const AddExpenseModal = ({ isOpen, onClose, onRefresh, expense = null }) => {
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        vendor: '',
        note: '',
        staffId: '', // populated only for the Staff Salary category
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [staffOptions, setStaffOptions] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const isStaffSalary = formData.category === 'Staff Salary';

    const uploadFile = (file, onProgress) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            onProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 50);
    };

    const handleDropFiles = (files) => {
        const newFiles = Array.from(files).slice(0, 1);
        const newFilesWithIds = newFiles.map((file) => ({
            id: Math.random().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            fileObject: file,
        }));

        setUploadedFiles(newFilesWithIds);

        newFilesWithIds.forEach(({ id, fileObject }) => {
            uploadFile(fileObject, (progress) => {
                setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress } : uploadedFile)));
            });
        });
    };

    const handleDeleteFile = (id) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handleRetryFile = (id) => {
        const file = uploadedFiles.find((f) => f.id === id);
        if (!file) return;

        uploadFile(file.fileObject, (progress) => {
            setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress, failed: false } : uploadedFile)));
        });
    };

    useEffect(() => {
        if (expense) {
            setFormData({
                category: expense.category,
                amount: expense.amount,
                date: new Date(expense.date).toISOString().split('T')[0],
                paymentMethod: expense.paymentMethod,
                vendor: expense.vendor || '',
                note: expense.note || '',
                staffId: expense.staffId || '',
            });
            if (expense.receiptUrl) {
                setUploadedFiles([{
                    id: 'existing-receipt',
                    name: expense.receiptUrl.split('/').pop(),
                    size: 0,
                    type: 'unknown',
                    progress: 100,
                    fileObject: null,
                    isExisting: true
                }]);
            } else {
                setUploadedFiles([]);
            }
        } else {
            setFormData({
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Cash',
                vendor: '',
                note: '',
                staffId: '',
            });
            setUploadedFiles([]);
        }
    }, [expense, isOpen]);

    // Lazy-load the staff list the first time Staff Salary is chosen. We don't
    // fetch unconditionally on mount because most expense entries aren't salary
    // and the dropdown isn't visible otherwise.
    useEffect(() => {
        if (!isOpen || !isStaffSalary || staffOptions.length || staffLoading) return;
        let cancelled = false;
        setStaffLoading(true);
        api.get('/gym/staff')
            .then((res) => {
                if (cancelled) return;
                const data = Array.isArray(res.data?.data) ? res.data.data
                    : Array.isArray(res.data) ? res.data : [];
                setStaffOptions(data.filter((s) => s.isActive !== false));
            })
            .catch(() => { /* surfaced via global interceptor */ })
            .finally(() => { if (!cancelled) setStaffLoading(false); });
        return () => { cancelled = true; };
    }, [isOpen, isStaffSalary, staffOptions.length, staffLoading]);

    // When the user switches away from Staff Salary, drop the staffId so it
    // doesn't accidentally hitch a ride on a non-salary expense.
    useEffect(() => {
        if (!isStaffSalary && formData.staffId) {
            setFormData((p) => ({ ...p, staffId: '' }));
        }
    }, [isStaffSalary, formData.staffId]);

    const categories = [
        "Rent", "Electricity", "Water", "Staff Salary", "Equipment",
        "Maintenance", "Marketing", "Cleaning", "Internet", "Software", "Others"
    ];

    // Removed old handleFileChange logic

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            // Only attach staffId for Staff Salary, and skip the synthetic
            // "other" sentinel — backend treats it as null.
            if (key === 'staffId') {
                if (isStaffSalary && formData.staffId && formData.staffId !== 'other') {
                    data.append('staffId', formData.staffId);
                }
                return;
            }
            data.append(key, formData[key]);
        });
        if (uploadedFiles.length > 0 && uploadedFiles[0].fileObject) {
            data.append('receipt', uploadedFiles[0].fileObject);
        }

        try {
            if (expense) {
                await api.put(`/expenses/${expense._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Expense updated');
            } else {
                await api.post(`/expenses`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Expense added');
            }
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save expense');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <FaFileInvoice />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {expense ? 'Edit Expense' : 'Add New Expense'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <FaTimes className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Category */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaTag className="text-red-500 text-xs" /> Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    {/* Staff selector — only when category is Staff Salary.
                        "Other" lets admins log a salary for someone not in the
                        staff list (e.g. a contractor) without needing to add
                        them as a user first. */}
                    {isStaffSalary && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                                <FaUserTie className="text-red-500 text-xs" /> Staff Member
                            </label>
                            <select
                                value={formData.staffId}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFormData((p) => ({
                                        ...p,
                                        staffId: v,
                                        // Auto-fill vendor with the chosen staff name for clarity
                                        // in lists/exports. Cleared when "Other" is picked so the
                                        // admin can type a custom name in the Vendor field below.
                                        vendor: v && v !== 'other'
                                            ? (staffOptions.find((s) => s._id === v)?.name || p.vendor)
                                            : (v === 'other' ? '' : p.vendor),
                                    }));
                                }}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                                required
                            >
                                <option value="">
                                    {staffLoading ? 'Loading staff…' : 'Select staff member'}
                                </option>
                                {staffOptions.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                                <option value="other">Other (enter name below)</option>
                            </select>
                            {formData.staffId === 'other' && (
                                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    Enter the recipient's name in the Vendor / Receiver field below.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaRupeeSign className="text-green-500 text-xs" /> Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                                <FaCalendarAlt className="text-purple-500 text-xs" /> Date
                            </label>
                            <DatePicker
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="!bg-gray-50 dark:!bg-slate-900 border-gray-200 dark:border-slate-700"
                                required
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                                <FaCreditCard className="text-orange-500 text-xs" /> Method
                            </label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                                required
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Vendor */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaUser className="text-rose-500 text-xs" /> Vendor / Receiver
                        </label>
                        <input
                            type="text"
                            value={formData.vendor}
                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                            placeholder="e.g. Electric Board, Staff Name"
                        />
                    </div>

                    {/* Receipt Upload */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaPaperclip className="text-red-500 text-xs" /> Attachment (Receipt/PDF)
                        </label>
                        <FileUpload.Root>
                            {uploadedFiles.length === 0 ? (
                                <FileUpload.DropZone isDisabled={loading} onDropFiles={handleDropFiles} />
                            ) : (
                                <FileUpload.List>
                                    {uploadedFiles.map((file) => (
                                        <FileUpload.ListItemProgressBar
                                            key={file.id}
                                            {...file}
                                            size={file.size}
                                            onDelete={() => handleDeleteFile(file.id)}
                                            onRetry={() => handleRetryFile(file.id)}
                                        />
                                    ))}
                                </FileUpload.List>
                            )}
                        </FileUpload.Root>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-2">
                            <FaStickyNote className="text-yellow-500 text-xs" /> Additional Note
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-none"
                            placeholder="Details about the expense..."
                            rows="2"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-brand-50 text-brand-600 font-bold hover:bg-brand-100 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;

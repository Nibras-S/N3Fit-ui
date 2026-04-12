import React, { useState, useMemo } from 'react';
import { FaTimes, FaPlus, FaTrash, FaCreditCard } from 'react-icons/fa';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';

const METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

/**
 * RecordPaymentModal
 *
 * Props:
 *   transactionId  – MongoDB _id of the transaction to pay
 *   totalAmount    – total plan amount (what is owed)
 *   paidSoFar      – already collected (0 for fresh transactions)
 *   memberName     – display only
 *   onClose()      – dismiss without paying
 *   onPaid(txn)    – called with the updated transaction on success
 */
export default function RecordPaymentModal({
    transactionId,
    totalAmount,
    paidSoFar = 0,
    memberName,
    onClose,
    onPaid,
}) {
    const balanceDue = Math.max(0, totalAmount - paidSoFar);

    const [splits, setSplits] = useState([{ paymentMethod: 'Cash', amount: '' }]);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ── Derived ──────────────────────────────────────────────────────────────

    const splitTotal = useMemo(
        () => splits.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
        [splits],
    );

    const remaining = Math.max(0, balanceDue - splitTotal);
    const isOver = splitTotal > balanceDue + 0.005;
    const isFull = splitTotal > 0 && !isOver && Math.abs(remaining) < 0.01;
    const isPartial = splitTotal > 0 && !isOver && remaining > 0.01;

    // ── Helpers ───────────────────────────────────────────────────────────────

    const updateSplit = (idx, field, value) => {
        setSplits((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const addSplit = () => {
        setSplits((prev) => [...prev, { paymentMethod: 'Cash', amount: '' }]);
    };

    const removeSplit = (idx) => {
        setSplits((prev) => prev.filter((_, i) => i !== idx));
    };

    // Fill-in helpers
    const fillFull = (idx) => {
        const others = splits.reduce((s, r, i) => (i !== idx ? s + (parseFloat(r.amount) || 0) : s), 0);
        const fill = Math.max(0, balanceDue - others);
        updateSplit(idx, 'amount', fill > 0 ? String(fill) : '');
    };

    const fillRest = (idx) => {
        const others = splits.reduce((s, r, i) => (i !== idx ? s + (parseFloat(r.amount) || 0) : s), 0);
        const rest = Math.max(0, balanceDue - others);
        updateSplit(idx, 'amount', rest > 0 ? String(rest) : '');
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (splitTotal <= 0) return toast.error('Enter an amount to pay');
        if (isOver) return toast.error('Payment exceeds balance due');

        const payload = splits
            .filter((s) => parseFloat(s.amount) > 0)
            .map((s) => ({ paymentMethod: s.paymentMethod, amount: parseFloat(s.amount) }));

        if (!payload.length) return toast.error('Enter an amount to pay');

        setSubmitting(true);
        try {
            const res = await api.put(`/transactions/${transactionId}/pay`, {
                splits: payload,
                notes: notes.trim() || undefined,
            });
            const updated = res.data;
            toast.success(isFull ? 'Payment recorded — Paid in full!' : 'Partial payment recorded');
            onPaid(updated);
        } catch {
            // axios interceptor already toasts the error
        } finally {
            setSubmitting(false);
        }
    };

    const isSingleSplit = splits.length === 1;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center">
                            <FaCreditCard className="text-zinc-900" size={16} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-base">Record Payment</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Total due: <span className="font-bold text-gray-900 dark:text-white">₹{fmt(balanceDue)}</span>
                                {paidSoFar > 0 && (
                                    <span className="ml-1 text-amber-600">(₹{fmt(paidSoFar)} already paid)</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <FaTimes className="text-gray-500" size={14} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4">

                    {/* Single split or multiple */}
                    {isSingleSplit ? (
                        <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                Payment Method &amp; Amount
                            </label>

                            {/* Method tabs */}
                            <div className="flex gap-2 mb-3">
                                {METHODS.map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => updateSplit(0, 'paymentMethod', m)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase transition-all border ${
                                            splits[0].paymentMethod === m
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-zinc-700 hover:border-red-300'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Amount input */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus-within:border-zinc-900 transition-colors">
                                <span className="text-gray-400 font-bold text-sm">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={splits[0].amount}
                                    onChange={(e) => updateSplit(0, 'amount', e.target.value)}
                                    placeholder="0"
                                    className="flex-1 bg-transparent outline-none font-black text-lg text-gray-900 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => fillFull(0)}
                                    className="text-[10px] font-black text-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded-md hover:bg-zinc-100 transition-colors"
                                >
                                    Full
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                Payment Splits
                            </label>
                            <div className="space-y-3">
                                {splits.map((split, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-zinc-950/40 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-gray-500 uppercase">Split {idx + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSplit(idx)}
                                                className="text-zinc-500 hover:text-zinc-900 p-1 transition-colors"
                                            >
                                                <FaTrash size={11} />
                                            </button>
                                        </div>

                                        {/* Method tabs */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {METHODS.map((m) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => updateSplit(idx, 'paymentMethod', m)}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all border ${
                                                        split.paymentMethod === m
                                                            ? 'bg-zinc-900 text-white border-zinc-900'
                                                            : 'bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-zinc-700'
                                                    }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Amount */}
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 focus-within:border-zinc-900 transition-colors">
                                            <span className="text-gray-400 font-bold text-sm">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={split.amount}
                                                onChange={(e) => updateSplit(idx, 'amount', e.target.value)}
                                                placeholder="0"
                                                className="flex-1 bg-transparent outline-none font-black text-base text-gray-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fillFull(idx)}
                                                className="text-[10px] font-black text-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md hover:bg-zinc-100 transition-colors"
                                            >
                                                Full
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => fillRest(idx)}
                                                className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md hover:bg-green-100 transition-colors"
                                            >
                                                Rest
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add split button */}
                    <button
                        type="button"
                        onClick={addSplit}
                        className="w-full py-2.5 border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl text-[11px] font-black text-gray-400 hover:text-zinc-900 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <FaPlus size={10} /> Add Split Payment
                    </button>

                    {/* Optional notes */}
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                            Notes <span className="text-gray-300">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Cash collected by trainer"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 text-sm transition-colors"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 dark:bg-zinc-950/40 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 space-y-1.5">
                        {/* Per-split breakdown when multiple */}
                        {!isSingleSplit && splits.map((split, idx) => {
                            const amt = parseFloat(split.amount) || 0;
                            if (!amt) return null;
                            return (
                                <div key={idx} className="flex justify-between text-[11px]">
                                    <span className="text-gray-500 font-bold">{split.paymentMethod}</span>
                                    <span className="text-gray-700 dark:text-gray-200 font-bold">+₹{fmt(amt)}</span>
                                </div>
                            );
                        })}

                        <div className="flex justify-between text-[12px] pt-1">
                            <span className="text-gray-500">This payment</span>
                            <span className="text-gray-900 dark:text-white font-bold">+₹{fmt(splitTotal)}</span>
                        </div>

                        <div className={`flex justify-between items-center text-sm font-black pt-1 border-t border-gray-100 dark:border-zinc-800 ${isOver ? 'text-zinc-900' : remaining < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
                            <span>Remaining after</span>
                            <span>₹{fmt(isOver ? '-' : remaining)}</span>
                        </div>

                        {isOver && (
                            <p className="text-[10px] font-bold text-zinc-700 flex items-center gap-1">
                                ⚠ Payment exceeds the balance due
                            </p>
                        )}
                        {isFull && (
                            <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                ✓ This will fully pay the invoice
                            </p>
                        )}
                        {isPartial && (
                            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                ⚠ This will be recorded as a partial payment
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-zinc-800 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || isOver || splitTotal <= 0}
                        className={`flex-2 flex-grow py-3 rounded-xl font-black text-[11px] uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFull
                                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                    >
                        {submitting ? 'Recording…' : isFull ? 'Confirm Full Payment' : isPartial ? 'Record Partial Payment' : 'Record Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FaRedo } from 'react-icons/fa';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import RecordPaymentModal from './RecordPaymentModal';
import api from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';

/**
 * RenewMembershipModal
 *
 * The dedicated renewal flow (plan → amount → optional start date), shared by
 * the members list and the member profile page so both behave identically.
 *
 * Two-step for normal gyms: stage the renewal (creates a Pending txn) then
 * record the payment via RecordPaymentModal. For `simplePayments` gyms the
 * backend renews + marks Paid in one call, so the payment step is skipped.
 *
 * Props:
 *   member      – { _id, name } of the member being renewed (required)
 *   onClose()   – dismiss the flow (parent stops rendering this component)
 *   onRenewed() – called after a successful renewal (parent should refresh)
 */
export default function RenewMembershipModal({ member, onClose, onRenewed }) {
    const { hasFeature } = useAuth();
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState(null);
    const [renewForm, setRenewForm] = useState({ plan: '', date: '', amount: '' });
    const [renewalTxn, setRenewalTxn] = useState(null); // txn awaiting payment (Step 2)

    // Invalidate every cache a renewal touches RIGHT NOW, rather than waiting on
    // the socket event (which can be missed if the socket is mid-reconnect).
    // This is what makes the Active/Expired tabs, dashboard, transactions and
    // membership history reflect the renewal without a manual refresh.
    // Invalidating ['members'] covers both the list and the member-detail tree.
    const refreshAfterRenewal = () => {
        queryClient.invalidateQueries({ queryKey: ['members'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['memberships'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['reports'] });
    };

    // Plans for the picker.
    useEffect(() => {
        api.get('/settings')
            .then((res) => setSettings(res.data)) // envelope already stripped by interceptor
            .catch((err) => console.error('Failed to load settings', err));
    }, []);

    const submitRenewal = async () => {
        if (!renewForm.plan || !renewForm.amount) {
            toast.error('Please select a plan and enter an amount');
            return;
        }
        const payload = { _isRenewal: true, plan: renewForm.plan, amount: Number(renewForm.amount) };
        if (renewForm.date) payload.date = renewForm.date;

        try {
            const res = await api.put(`/contacts/${member._id}`, payload);
            const txn = res.data?.transaction || res.data;
            if (hasFeature('simplePayments')) {
                // Backend already renewed + recorded the payment as Paid.
                refreshAfterRenewal();
                toast.success('Membership renewed!');
                onRenewed?.();
                onClose?.();
            } else {
                setRenewalTxn(txn); // open Step 2: RecordPaymentModal
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.error?.message ||
                'Failed to renew membership',
            );
        }
    };

    const handleRenewalPaid = () => {
        setRenewalTxn(null);
        refreshAfterRenewal();
        toast.success('Membership renewed and payment recorded!');
        onRenewed?.();
        onClose?.();
    };

    if (!member) return null;

    // ── Step 2: Record Payment ──────────────────────────────────────────────
    if (renewalTxn) {
        return (
            <RecordPaymentModal
                transactionId={renewalTxn._id}
                totalAmount={renewalTxn.amount}
                paidSoFar={0}
                memberName={renewalTxn.memberName}
                confirmCancel
                onClose={() => { refreshAfterRenewal(); onRenewed?.(); onClose?.(); }}
                onPaid={handleRenewalPaid}
            />
        );
    }

    // ── Step 1: Plan + Amount + Date ────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <FaRedo className="text-zinc-900 dark:text-white" size={14} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-base">Renew Membership</h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">{member.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Plan selector */}
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Plan</label>
                        <div className="grid grid-cols-2 gap-2">
                            {settings?.plans?.filter((p) => p.isActive)?.map((p, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setRenewForm((f) => ({ ...f, plan: p.name, amount: p.price }))}
                                    className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${
                                        renewForm.plan === p.name
                                            ? 'bg-zinc-900 border-zinc-900 text-white'
                                            : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-zinc-400'
                                    }`}
                                >
                                    <span className="text-xs font-black">{p.name}</span>
                                    <span className={`text-[11px] font-semibold mt-0.5 ${renewForm.plan === p.name ? 'text-zinc-300' : 'text-gray-400'}`}>
                                        ₹{Number(p.price).toLocaleString('en-IN')}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {!settings?.plans?.length && (
                            <p className="text-xs text-gray-400 text-center py-3">No plans configured. Go to Settings to add plans.</p>
                        )}
                    </div>

                    {/* Amount override */}
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Amount (₹)</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus-within:border-zinc-900 transition-colors">
                            <span className="text-gray-400 font-bold text-sm">₹</span>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={renewForm.amount}
                                onChange={(e) => setRenewForm((f) => ({ ...f, amount: e.target.value }))}
                                placeholder="0"
                                className="flex-1 bg-transparent outline-none font-black text-lg text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Start date (optional) */}
                    <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                            Start Date <span className="text-gray-300 normal-case font-normal">(optional — defaults to current end date)</span>
                        </label>
                        <DatePicker
                            value={renewForm.date}
                            onChange={(e) => setRenewForm((f) => ({ ...f, date: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-black text-[11px] uppercase bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={submitRenewal}
                        disabled={!renewForm.plan || !renewForm.amount}
                        className="flex-[2] py-3 rounded-xl font-black text-[11px] uppercase bg-black text-white border border-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {hasFeature('simplePayments') ? 'Renew' : 'Continue to Payment →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

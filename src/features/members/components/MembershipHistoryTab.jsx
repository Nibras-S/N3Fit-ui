import React from 'react';
import { Link } from 'react-router-dom';
import { FaIdCard, FaArrowRight } from 'react-icons/fa';
import { useMemberMemberships } from '../hooks/useMembersQueries';
import { formatDateIST } from '../../../shared/lib/timezone';

const STATUS_PILL = {
    active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    expired:   'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

/**
 * Membership history for a single member. Renders one row per membership
 * period (start → end) with the plan name, amount, and a link to the
 * transaction that paid for it.
 *
 * Data source is the new `/api/v1/memberships` endpoint introduced in the
 * membership refactor. Until PR-2's backfill has run for this member's gym,
 * the list may be sparse — the empty state covers that case gracefully.
 */
export default function MembershipHistoryTab({ memberId }) {
    const { data: memberships = [], isLoading, isError } = useMemberMemberships(memberId);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 text-sm text-gray-500 dark:text-gray-400">
                Loading subscription history…
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 text-sm text-gray-500 dark:text-gray-400">
                Couldn't load subscription history. Try refreshing.
            </div>
        );
    }

    if (memberships.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FaIdCard className="text-3xl text-gray-300 dark:text-zinc-700 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No subscription history yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Membership periods are recorded automatically on every renewal.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaIdCard className="text-zinc-700" /> Subscription History
                </h3>
                <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    {memberships.length} period{memberships.length === 1 ? '' : 's'}
                </span>
            </div>

            {/* Desktop table */}
            <table className="hidden md:table w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950">
                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <th className="px-4 py-3 font-semibold">Plan</th>
                        <th className="px-4 py-3 font-semibold">Period</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                        <th className="px-4 py-3 font-semibold">Invoice</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                    {memberships.map((m) => (
                        <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                                {m.planName || '—'}
                                {m.planDays ? (
                                    <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                                        ({m.planDays} days)
                                    </span>
                                ) : null}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                <span>{formatDateIST(m.startDate)}</span>
                                <FaArrowRight className="inline mx-2 text-gray-400 text-[10px]" />
                                <span>{formatDateIST(m.endDate)}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_PILL[m.status] || STATUS_PILL.expired}`}>
                                    {m.status || 'expired'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                {formatCurrency(m.amount)}
                            </td>
                            <td className="px-4 py-3">
                                {m.transactionId ? (
                                    <Link
                                        to={`/invoice/${m.transactionId}`}
                                        className="text-xs text-zinc-900 dark:text-zinc-300 hover:underline"
                                    >
                                        View invoice
                                    </Link>
                                ) : (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-zinc-800/60">
                {memberships.map((m) => (
                    <div key={m._id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{m.planName || '—'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatDateIST(m.startDate)} → {formatDateIST(m.endDate)}
                                </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_PILL[m.status] || STATUS_PILL.expired}`}>
                                {m.status || 'expired'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(m.amount)}</span>
                            {m.transactionId ? (
                                <Link
                                    to={`/invoice/${m.transactionId}`}
                                    className="text-xs text-zinc-900 dark:text-zinc-300 hover:underline"
                                >
                                    View invoice
                                </Link>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBuilding, FaSpinner, FaExchangeAlt, FaStar, FaCrown, FaEdit, FaChevronDown, FaCheck, FaChartBar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import api from '../../../shared/services/api';

/** Stable color derived from gym name initial — matches Avatar pattern */
const GYM_COLORS = [
    'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500',
];
function gymColor(name = '') {
    const code = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
    return GYM_COLORS[code % GYM_COLORS.length];
}

const ManageAccountPage = () => {
    const { user, switchGym } = useAuth();
    const navigate = useNavigate();
    const [switching, setSwitching] = useState(null);

    const allGyms = user?.allGyms || [];
    const activeGymId = (user?.activeGymId || user?.gymId)?.toString();
    const isSuperAdmin = user?.role === 'superadmin';
    const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const userRole = isSuperAdmin ? 'Super Admin' : user?.role === 'gymadmin' ? 'Admin' : 'Staff';

    // Multi-gym combined report state
    const [selectedGyms, setSelectedGyms] = useState([]);
    const [gymDropdownOpen, setGymDropdownOpen] = useState(false);
    const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const gymDropdownRef = useRef(null);

    // Initialize selectedGyms when allGyms loads.
    // Intentionally omits `selectedGyms.length` from deps: this is a one-shot
    // bootstrap. If the user later toggles every gym off, we don't want this
    // effect to re-fire and silently reset their selection back to "all".
    useEffect(() => {
        if (allGyms.length > 1 && selectedGyms.length === 0) {
            setSelectedGyms(allGyms.map(g => g._id?.toString()));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allGyms]);

    // Close gym dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (gymDropdownRef.current && !gymDropdownRef.current.contains(e.target)) {
                setGymDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchReport = useCallback(async () => {
        if (selectedGyms.length === 0) return;
        setReportLoading(true);
        try {
            const params = new URLSearchParams({ gymIds: selectedGyms.join(',') });
            if (reportDateRange.start) params.set('startDate', reportDateRange.start);
            if (reportDateRange.end) params.set('endDate', reportDateRange.end);
            const res = await api.get(`/reports/multi-gym?${params.toString()}`);
            setReportData(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load report');
        } finally {
            setReportLoading(false);
        }
    }, [selectedGyms, reportDateRange]);

    useEffect(() => {
        if (allGyms.length > 1 && selectedGyms.length > 0) {
            fetchReport();
        }
    }, [selectedGyms, reportDateRange, fetchReport, allGyms.length]);

    const toggleGymSelection = (gymId) => {
        const id = gymId?.toString();
        setSelectedGyms(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );

    };

    const handleSwitch = async (gymId) => {
        if (gymId === activeGymId) return;
        setSwitching(gymId);
        try {
            await switchGym(gymId);
            toast.success('Switched successfully');
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to switch gym');
            setSwitching(null);
        }
    };

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="max-w-4xl mx-auto pb-12 space-y-8">

                {/* Page title */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Account</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Switch between your gyms or update your profile
                    </p>
                </div>

                {/* Profile card */}
                <div className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <div className="flex items-center gap-4">
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-700"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center ring-2 ring-gray-100 dark:ring-zinc-700">
                                <span className="text-xl font-bold text-white dark:text-zinc-900">{userInitial}</span>
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base">{user?.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {userRole}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(isSuperAdmin ? '/superadmin/settings' : '/settings')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                        <FaEdit size={12} />
                        Edit Profile
                    </button>
                </div>

                {/* Gyms section (non-superadmin only) */}
                {!isSuperAdmin && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">My Gyms</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {allGyms.length > 0 ? `${allGyms.length} gym${allGyms.length > 1 ? 's' : ''}` : 'Linked to 1 gym'}
                                </p>
                            </div>
                        </div>

                        {allGyms.length === 0 ? (
                            /* Single gym — show current gym card only */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SingleGymCard
                                    name={user?.gym?.name}
                                    gymCode={user?.gym?.gymCode}
                                    logo={user?.gym?.logo}
                                    isActive
                                />
                                <PlaceholderCard />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allGyms.map((gym) => {
                                    const isActive = gym._id?.toString() === activeGymId;
                                    const isSwitching = switching === gym._id?.toString();
                                    return (
                                        <GymCard
                                            key={gym._id}
                                            gym={gym}
                                            isActive={isActive}
                                            isSwitching={isSwitching}
                                            onSwitch={() => handleSwitch(gym._id?.toString())}
                                            disabled={!!switching}
                                            gymColor={gymColor(gym.name)}
                                            role={userRole}
                                        />
                                    );
                                })}
                                <PlaceholderCard />
                            </div>
                        )}
                    </div>
                )}

                {/* Multi-Gym Combined Report (shown when user has 2+ gyms) */}
                {!isSuperAdmin && allGyms.length > 1 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                <FaChartBar className="text-zinc-600 dark:text-zinc-300" size={16} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Combined Report</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Income, expenses, and profit across selected gyms</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 mb-5">
                            {/* Gym multi-select */}
                            <div className="relative" ref={gymDropdownRef}>
                                <button
                                    onClick={() => setGymDropdownOpen(v => !v)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-zinc-500 transition-all min-w-[160px]"
                                >
                                    <FaBuilding size={12} className="text-gray-400" />
                                    <span className="flex-1 text-left">
                                        {selectedGyms.length === allGyms.length
                                            ? 'All Gyms'
                                            : selectedGyms.length === 1
                                                ? allGyms.find(g => g._id?.toString() === selectedGyms[0])?.name || '1 Gym'
                                                : `${selectedGyms.length} Gyms`}
                                    </span>
                                    <FaChevronDown size={10} className={`text-gray-400 transition-transform ${gymDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {gymDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 z-20 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
                                        {allGyms.map(gym => {
                                            const gid = gym._id?.toString();
                                            const checked = selectedGyms.includes(gid);
                                            return (
                                                <button
                                                    key={gid}
                                                    onClick={() => toggleGymSelection(gid)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                                                >
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white' : 'border-gray-300 dark:border-zinc-600'}`}>
                                                        {checked && <FaCheck size={8} className="text-white dark:text-zinc-900" />}
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{gym.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Date range */}
                            <input
                                type="date"
                                value={reportDateRange.start}
                                onChange={e => setReportDateRange(r => ({ ...r, start: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                            />
                            <input
                                type="date"
                                value={reportDateRange.end}
                                onChange={e => setReportDateRange(r => ({ ...r, end: e.target.value }))}
                                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
                            />
                        </div>

                        {reportLoading ? (
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
                                ))}
                            </div>
                        ) : reportData ? (
                            <>
                                {/* Totals */}
                                <div className="grid grid-cols-3 gap-4 mb-5">
                                    <ReportStatCard
                                        label="Total Income"
                                        value={reportData.totals?.income ?? 0}
                                        color="text-emerald-600 dark:text-emerald-400"
                                        bg="bg-emerald-50 dark:bg-emerald-900/15"
                                    />
                                    <ReportStatCard
                                        label="Total Expenses"
                                        value={reportData.totals?.expenses ?? 0}
                                        color="text-rose-600 dark:text-rose-400"
                                        bg="bg-rose-50 dark:bg-rose-900/15"
                                    />
                                    <ReportStatCard
                                        label="Net Profit"
                                        value={reportData.totals?.profit ?? 0}
                                        color={(reportData.totals?.profit ?? 0) >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}
                                        bg="bg-zinc-50 dark:bg-zinc-800"
                                    />
                                </div>

                                {/* Per-gym breakdown */}
                                {reportData.byGym && reportData.byGym.length > 0 && (
                                    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                                        <div className="px-5 py-3 border-b border-gray-50 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Per-Gym Breakdown</p>
                                        </div>
                                        <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                                            {reportData.byGym.map(row => {
                                                const gymName = allGyms.find(g => g._id?.toString() === row.gymId)?.name || row.gymId;
                                                return (
                                                <div key={row.gymId} className="flex items-center justify-between px-5 py-3.5">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white w-1/3 truncate">{gymName}</p>
                                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-mono w-1/4 text-right">₹{(row.income ?? 0).toLocaleString('en-IN')}</p>
                                                    <p className="text-sm text-rose-500 dark:text-rose-400 font-mono w-1/4 text-right">₹{(row.expenses ?? 0).toLocaleString('en-IN')}</p>
                                                    <p className={`text-sm font-bold font-mono w-1/4 text-right ${(row.profit ?? 0) >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-500'}`}>
                                                        ₹{(row.profit ?? 0).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                );
                                            })}
                                        </div>
                                        <div className="px-5 py-2.5 border-t border-gray-50 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 flex justify-end gap-8">
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Income</p>
                                            <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">Expenses</p>
                                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Profit</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* Superadmin — simple links */}
                {isSuperAdmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ActionCard
                            label="Platform Settings"
                            desc="Manage SaaS plans, gyms and system config"
                            onClick={() => navigate('/superadmin/settings')}
                        />
                        <ActionCard
                            label="All Gyms"
                            desc="View and manage all registered gyms"
                            onClick={() => navigate('/superadmin')}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

/* ── Sub-components ─────────────────────────────────────────────────── */

function GymCard({ gym, isActive, isSwitching, onSwitch, disabled, gymColor: color, role }) {
    const initial = gym.name?.charAt(0)?.toUpperCase() || 'G';
    return (
        <div className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all ${
            isActive
                ? 'border-zinc-900 dark:border-white/30 shadow-lg shadow-zinc-900/10'
                : 'border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'
        } bg-white dark:bg-zinc-900`}>
            {/* Top section */}
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                    {/* Logo / Initial */}
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${!gym.logo ? color : ''}`}>
                        {gym.logo ? (
                            <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-black text-white">{initial}</span>
                        )}
                    </div>
                    {/* Status badge */}
                    <div className="flex flex-col items-end gap-1.5">
                        {isActive && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </span>
                        )}
                    </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{gym.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">#{gym.gymCode}</p>
                {/* Role badge */}
                <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <FaCrown size={9} /> {role}
                    </span>
                </div>
            </div>
            {/* Bottom action */}
            <div className="border-t border-gray-50 dark:border-zinc-800 px-5 py-3">
                {isActive ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <FaStar size={10} className="text-zinc-500 dark:text-zinc-400" />
                        Currently Working Here
                    </div>
                ) : (
                    <button
                        onClick={onSwitch}
                        disabled={disabled}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white transition-colors disabled:opacity-40"
                    >
                        {isSwitching
                            ? <FaSpinner className="animate-spin" size={10} />
                            : <FaExchangeAlt size={10} />
                        }
                        Switch to this Gym
                    </button>
                )}
            </div>
        </div>
    );
}

function SingleGymCard({ name, gymCode, logo }) {
    const initial = name?.charAt(0)?.toUpperCase() || 'G';
    return (
        <div className="relative flex flex-col rounded-2xl border-2 border-zinc-900 dark:border-white/30 overflow-hidden bg-white dark:bg-zinc-900 shadow-lg shadow-zinc-900/10">
            <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 bg-zinc-900">
                        {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-white">{initial}</span>}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                    </span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-base">{name || 'Your Gym'}</p>
                {gymCode && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">#{gymCode}</p>}
                <div className="mt-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        <FaCrown size={9} /> Admin
                    </span>
                </div>
            </div>
            <div className="border-t border-gray-50 dark:border-zinc-800 px-5 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <FaStar size={10} className="text-zinc-500 dark:text-zinc-400" />
                    Currently Working Here
                </div>
            </div>
        </div>
    );
}

function PlaceholderCard() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-700 min-h-[200px] gap-3 text-center px-4 py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                <FaBuilding className="text-gray-300 dark:text-zinc-600 text-lg" />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-400 dark:text-zinc-500">Add Another Gym</p>
                <p className="text-xs text-gray-300 dark:text-zinc-600 mt-0.5">Contact your platform admin</p>
            </div>
        </div>
    );
}

function ActionCard({ label, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start gap-2 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-600 transition-all text-left w-full"
        >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <FaBuilding className="text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
            </div>
        </button>
    );
}

function ReportStatCard({ label, value, color, bg }) {
    return (
        <div className={`flex flex-col gap-1 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 ${bg}`}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-xl font-black font-mono ${color}`}>
                ₹{(value).toLocaleString('en-IN')}
            </p>
        </div>
    );
}

export default ManageAccountPage;

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../../shared/components/layout/AppLayout';
import { useBirthdays } from '../hooks/useMembersQueries';
import { formatDate } from '../../../shared/lib/formatters';
import { formatPhoneForDisplay } from '../../../shared/lib/phone';
import { FaBirthdayCake, FaSearch, FaSync, FaUser } from 'react-icons/fa';
import { CardSkeleton } from '../../../shared/components/ui/Skeleton';

const FILTER_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
];

function getBadge(days) {
    if (days === 0) return { text: 'Today!', bg: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' };
    if (days === 1) return { text: 'Tomorrow', bg: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' };
    if (days <= 7) return { text: `In ${days} days`, bg: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
    if (days <= 30) return { text: `In ${days} days`, bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' };
    return { text: `In ${days} days`, bg: 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500' };
}

function filterMembers(members, filter, search) {
    let filtered = members;

    if (filter === 'today') filtered = filtered.filter(m => m.upcomingBirthdayDays === 0);
    else if (filter === 'tomorrow') filtered = filtered.filter(m => m.upcomingBirthdayDays === 1);
    else if (filter === 'week') filtered = filtered.filter(m => m.upcomingBirthdayDays <= 7);
    else if (filter === 'month') filtered = filtered.filter(m => m.upcomingBirthdayDays <= 30);

    if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(term) || (m.phone && m.phone.includes(search)),
        );
    }
    return filtered;
}

const BirthdaysPage = () => {
    const navigate = useNavigate();
    const { data: members = [], isLoading, refetch } = useBirthdays();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(
        () => filterMembers(members, activeFilter, searchTerm),
        [members, activeFilter, searchTerm],
    );

    const counts = useMemo(() => ({
        today: members.filter(m => m.upcomingBirthdayDays === 0).length,
        tomorrow: members.filter(m => m.upcomingBirthdayDays === 1).length,
        week: members.filter(m => m.upcomingBirthdayDays <= 7).length,
        month: members.filter(m => m.upcomingBirthdayDays <= 30).length,
        all: members.length,
    }), [members]);

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="pb-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FaBirthdayCake className="text-rose-500" />
                            Birthdays
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                            {members.length} member{members.length !== 1 ? 's' : ''} with birthday saved
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <FaSync size={14} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {FILTER_OPTIONS.map(opt => {
                        const count = counts[opt.key];
                        const isActive = activeFilter === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setActiveFilter(opt.key)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                                    isActive
                                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {opt.label}
                                {count > 0 && (
                                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                                        isActive
                                            ? 'bg-white/20 dark:bg-zinc-900/20'
                                            : 'bg-zinc-200 dark:bg-zinc-700'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                    <div className="text-center py-16">
                        <div className="mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <FaBirthdayCake className="text-zinc-400 dark:text-zinc-600" size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {searchTerm ? 'No results found' : members.length === 0 ? 'No birthdays saved' : 'No birthdays in this range'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-zinc-500">
                            {searchTerm
                                ? `No members match "${searchTerm}".`
                                : members.length === 0
                                    ? 'Members with date of birth saved will appear here.'
                                    : 'Try a different filter to see upcoming birthdays.'}
                        </p>
                    </div>
                )}

                {/* Cards grid */}
                {!isLoading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(member => {
                            const badge = getBadge(member.upcomingBirthdayDays);
                            const initial = member.name?.charAt(0)?.toUpperCase() || '?';

                            return (
                                <div
                                    key={member._id}
                                    onClick={() => navigate(`/members/${member._id}`)}
                                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 hover:shadow-md dark:hover:border-zinc-700 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        {member.profileImage ? (
                                            <img
                                                src={member.profileImage}
                                                alt={member.name}
                                                className="w-11 h-11 rounded-full object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                                                <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">{initial}</span>
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                    {member.name}
                                                </h3>
                                                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                                                    {badge.text}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
                                                {formatPhoneForDisplay(member.phone)}
                                            </p>

                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                                                    <FaBirthdayCake className="text-rose-400" size={10} />
                                                    {formatDate(member.dob)}
                                                </span>
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                                    member.dews > 0
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500'
                                                }`}>
                                                    {member.dews > 0 ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default BirthdaysPage;

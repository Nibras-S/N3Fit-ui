import React from 'react';
import { FaHome, FaChevronRight } from 'react-icons/fa';

/**
 * Standard Page Header
 * 
 * Features:
 * - Breadcrumbs
 * - Page Title
 * - Stats/Metadata (optional)
 * - Primary Action Button (optional)
 */
const PageHeader = ({
    title,
    breadcrumbs = [],
    stats = [],
    action = null,
    gender = 'all' // 'all', 'Male', 'Female'
}) => {
    const getTheme = () => {
        if (gender === 'Male') return 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30';
        if (gender === 'Female') return 'bg-pink-50 border-pink-100 dark:bg-pink-900/20 dark:border-pink-900/30';
        return 'bg-white border-gray-100 dark:bg-slate-800 dark:border-slate-700'; // Default clean look
    };

    return (
        <div className={`mb-6 p-6 rounded-2xl border ${getTheme()} transition-colors duration-300`}>


            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                {/* Title & Stats */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    {stats.length > 0 && (
                        <div className="hidden lg:flex items-center gap-4 mt-1">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    {stat.icon && <stat.icon className="text-gray-400 dark:text-gray-500" />}
                                    <span>{stat.label}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {action && (
                    <div>
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;

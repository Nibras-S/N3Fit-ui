import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

export const DatePicker = ({ value, onChange, className = '', ...props }) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <FaCalendarAlt className="text-gray-400" size={14} />
            </div>
            <input
                type="date"
                value={value || ''}
                onChange={onChange}
                className={`custom-date-input w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white sm:text-sm transition-all text-left ${className}`}
                {...props}
            />
        </div>
    );
};

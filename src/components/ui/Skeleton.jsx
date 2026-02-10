import React from 'react';

// Skeleton component for loading states
export const Skeleton = ({ className = '', ...props }) => (
    <div
        className={`skeleton ${className}`}
        {...props}
    />
);

// Table skeleton for member lists
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
            {Array.from({ length: cols }).map((_, i) => (
                <div key={i} className={`skeleton h-4 rounded ${i === 0 ? 'w-32' : 'w-20'}`} />
            ))}
        </div>

        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                {/* Avatar */}
                <div className="skeleton skeleton-circle w-10 h-10 shrink-0" />

                {/* Content cells */}
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded opacity-60" />
                </div>

                {Array.from({ length: cols - 2 }).map((_, i) => (
                    <div key={i} className="skeleton h-4 w-16 rounded" />
                ))}

                {/* Action button */}
                <div className="skeleton h-8 w-20 rounded-lg" />
            </div>
        ))}
    </div>
);

// Card skeleton for dashboard stats
export const CardSkeleton = () => (
    <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="skeleton h-4 w-20 rounded mb-2" />
        <div className="skeleton h-7 w-28 rounded mb-1" />
        <div className="skeleton h-3 w-16 rounded opacity-60" />
    </div>
);

// Simple loading spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
    return (
        <div className={`${sizeClass} border-3 border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} />
    );
};

// Page loading wrapper
export const PageLoading = ({ children, loading, skeleton }) => {
    if (loading) {
        return skeleton || (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }
    return children;
};

export default Skeleton;

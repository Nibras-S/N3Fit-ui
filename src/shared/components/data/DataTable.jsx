import React from 'react';
import { FaUserSlash, FaSortAmountUp, FaSortAmountDown, FaCaretUp, FaCaretDown } from 'react-icons/fa';

/**
 * Reusable DataTable Component
 * 
 * Features:
 * - Zebra striping (alternating row colors)
 * - Loading skeleton
 * - Empty state
 * - Sortable columns
 * - Responsive (desktop table, mobile cards)
 * - Hover effects
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data rows
 * @param {Array} props.columns - Column definitions [{ key, label, sortable?, render? }]
 * @param {boolean} props.loading - Show loading skeleton
 * @param {string} props.emptyMessage - Message when no data
 * @param {string} props.emptyDescription - Description when no data
 * @param {Object} props.sortConfig - { key, direction } for sorting
 * @param {Function} props.onSort - Callback when column header clicked
 * @param {Function} props.renderActions - Render actions column (row) => JSX
 * @param {Function} props.renderMobileCard - Custom mobile card renderer (row, index) => JSX
 * @param {Function} props.getRowKey - Get unique key for row (row) => string
 * @param {string} props.hoverColor - Hover color class (default: 'hover:bg-blue-50')
 * @param {Function} props.renderExpandedRow - Render expanded row content (row) => JSX
 * @param {string} props.expandedRowId - Currently expanded row ID
 */

// Skeleton components
const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse">
        {columns.map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
            </td>
        ))}
        <td className="px-4 py-3">
            <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
        </td>
    </tr>
);

const SkeletonCard = () => (
    <div className="p-4 animate-pulse bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="flex gap-2">
            <div className="h-8 flex-1 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
    </div>
);

// Empty state component
const EmptyState = ({ message = 'No data found', description = '' }) => (
    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
        <FaUserSlash className="text-4xl mx-auto mb-3 text-gray-300 dark:text-slate-600" />
        <p className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-200">{message}</p>
        {description && <p className="text-sm">{description}</p>}
    </div>
);

const DataTable = ({
    data = [],
    columns = [],
    loading = false,
    emptyMessage = 'No data found',
    emptyDescription = '',
    sortConfig = null,
    onSort = null,
    renderActions = null,
    renderMobileCard = null,
    getRowKey = (row) => row._id || row.id,
    hoverColor = 'hover:bg-blue-50',
    renderExpandedRow = null,
    expandedRowId = null,
    gender = 'all',
    showSelection = false,
    selectedIds = [],
    onSelectionChange = null,
    serverSide = false,
    count = 0,
    page = 1,
    onPageChange = null,
    onRowsPerPageChange = null,
    rowsPerPage: propRowsPerPage // Rename to avoid conflict with state
}) => {
    // State for client-side pagination
    const [clientPage, setClientPage] = React.useState(1);
    const [clientRowsPerPage, setClientRowsPerPage] = React.useState(10);

    // Determine values based on serverSide prop
    const currentPage = serverSide ? page : clientPage;
    const rowsPerPage = serverSide ? propRowsPerPage || 10 : clientRowsPerPage;
    const totalRecords = serverSide ? count : data.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    // Data slicing
    // If serverSide, data is already sliced. If clientSide, slice it here.
    const currentData = serverSide ? data : data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);

    // Reset page when data length changes (only for client-side filtering)
    React.useEffect(() => {
        if (!serverSide) setClientPage(1);
    }, [data.length, serverSide]);

    const totalColumns = columns.length + (renderActions ? 1 : 0) + (showSelection ? 1 : 0);

    const handleSelectAll = (e) => {
        if (!onSelectionChange) return;
        if (e.target.checked) {
            onSelectionChange(currentData.map(getRowKey));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectRow = (id) => {
        if (!onSelectionChange) return;
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(item => item !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const isAllSelected = currentData.length > 0 && currentData.every(row => selectedIds.includes(getRowKey(row)));

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            if (serverSide) {
                if (onPageChange) onPageChange(newPage);
            } else {
                setClientPage(newPage);
            }
        }
    };

    const handleRowsPerChange = (e) => {
        const newRows = Number(e.target.value);
        if (serverSide) {
            if (onRowsPerPageChange) onRowsPerPageChange(newRows);
        } else {
            setClientRowsPerPage(newRows);
            setClientPage(1);
        }
    };

    // Calculate visible pages for pagination (e.g. 1 2 3 ... 10)
    const getVisiblePages = () => {
        let pages = [];
        if (totalPages <= 5) {
            pages = [...Array(totalPages).keys()].map(i => i + 1);
        } else {
            if (currentPage <= 3) pages = [1, 2, 3, 4, '...', totalPages];
            else if (currentPage >= totalPages - 2) pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            else pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
        return pages;
    };

    // Dynamic header color based on gender
    const getHeaderColor = () => {
        if (gender === 'Male') return 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30';
        if (gender === 'Female') return 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-900/30';
        return 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700';
    };

    const headerClass = getHeaderColor();

    // Loading state
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Desktop skeleton */}
                <div className="hidden lg:block">
                    <table className="w-full">
                        <thead className={`${headerClass} border-b`}>
                            <tr>
                                {showSelection && <th className="px-4 py-3 text-left w-10"><div className="h-4 w-4 bg-gray-200 rounded"></div></th>}
                                {columns.map((col, i) => (
                                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        {col.label}
                                    </th>
                                ))}
                                {renderActions && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {[...Array(rowsPerPage)].map((_, i) => <SkeletonRow key={i} columns={columns} />)}
                        </tbody>
                    </table>
                </div>
                {/* Mobile skeleton */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700">
                    {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    // Empty state
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <EmptyState message={emptyMessage} description={emptyDescription} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto hide-scrollbar min-h-[400px]">
                <table className="w-full">
                    <thead className={`${headerClass} border-b sticky top-0 z-10 transition-colors duration-300`}>
                        <tr>
                            {showSelection && (
                                <th className="px-4 py-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase ${col.sortable && onSort ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors' : ''}`}
                                    title={col.sortable ? `Sort by ${col.label}` : ''}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && onSort && (
                                            <div className="flex flex-col text-[10px] text-gray-400">
                                                <FaCaretUp className={sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-blue-600 dark:text-blue-400' : ''} />
                                                <FaCaretDown className={sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-blue-600 dark:text-blue-400' : ''} />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                        {currentData.map((row, index) => {
                            const rowId = getRowKey(row);
                            const isSelected = selectedIds.includes(rowId);
                            return (
                                <React.Fragment key={rowId}>
                                    <tr className={`${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} ${hoverColor} dark:hover:bg-slate-700 transition-colors`}>
                                        {showSelection && (
                                            <td className="px-4 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(rowId)}
                                                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col, i) => (
                                            <td key={i} className="px-4 py-3 text-gray-900 dark:text-gray-200">
                                                {col.render ? col.render(row, index) : row[col.key]}
                                            </td>
                                        ))}
                                        {renderActions && (
                                            <td className="px-4 py-3">
                                                {renderActions(row, index)}
                                            </td>
                                        )}
                                    </tr>
                                    {/* Expanded row */}
                                    {renderExpandedRow && expandedRowId === rowId && (
                                        <tr className="bg-green-50 dark:bg-green-900/20">
                                            <td colSpan={totalColumns} className="px-4 py-4">
                                                {renderExpandedRow(row)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700">
                {currentData.map((row, index) => {
                    const rowId = getRowKey(row);
                    const isSelected = selectedIds.includes(rowId);
                    return (
                        <div
                            key={rowId}
                            className={`p-4 relative ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                        >
                            {showSelection && (
                                <div className="absolute top-4 right-4">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleSelectRow(rowId)}
                                        className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer shadow-sm"
                                    />
                                </div>
                            )}
                            {renderMobileCard ? renderMobileCard(row, index) : (
                                // Default mobile card
                                <div>
                                    {columns.slice(0, 2).map((col, i) => (
                                        <div key={i} className={i === 0 ? 'font-medium text-gray-900 dark:text-gray-100 pr-8' : 'text-sm text-gray-500 dark:text-gray-400'}>
                                            {col.render ? col.render(row, index) : row[col.key]}
                                        </div>
                                    ))}
                                    {renderActions && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                                            {renderActions(row, index)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 gap-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-2">Rows per page:</span>
                    <select
                        value={rowsPerPage}
                        onChange={handleRowsPerChange}
                        className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="ml-4">
                        Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        Prev
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex gap-1">
                        {getVisiblePages().map((p, i) => (
                            <button
                                key={i}
                                onClick={() => typeof p === 'number' && handlePageChange(p)}
                                disabled={p === '...'}
                                className={`w-8 h-8 text-sm rounded flex items-center justify-center border ${p === currentPage
                                    ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                                    } ${p === '...' ? 'cursor-default border-none bg-transparent hover:bg-transparent dark:text-gray-500' : ''}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
export { SkeletonRow, SkeletonCard, EmptyState };

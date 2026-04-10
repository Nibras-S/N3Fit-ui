import React from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';

/**
 * DataTable — Untitled UI inspired
 * - Clean white card with border
 * - Alternating row fills (odd:bg-secondary pattern)
 * - Minimal header: light gray bg, uppercase xs labels
 * - Hover highlight per row
 * - Sortable column indicators
 * - Responsive: desktop table / mobile cards
 */

const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse border-b border-gray-100 dark:border-slate-700/50">
        {columns.map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full w-3/4" />
            </td>
        ))}
        <td className="px-6 py-4">
            <div className="flex gap-2 justify-end">
                <div className="h-8 w-16 bg-gray-100 dark:bg-slate-700 rounded-lg" />
                <div className="h-8 w-8 bg-gray-100 dark:bg-slate-700 rounded-lg" />
            </div>
        </td>
    </tr>
);

const SkeletonCard = () => (
    <div className="p-4 animate-pulse bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full" />
            <div className="flex-1">
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-1/3" />
            </div>
            <div className="h-6 w-16 bg-gray-100 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-slate-700">
            <div className="h-8 flex-1 bg-gray-100 dark:bg-slate-700 rounded-lg" />
            <div className="h-8 w-8 bg-gray-100 dark:bg-slate-700 rounded-lg" />
        </div>
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
    hoverColor = 'hover:bg-blue-50/40 dark:hover:bg-blue-900/10',
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
    rowsPerPage: propRowsPerPage,
    className = '',
    onRowClick = null,
}) => {
    const [clientPage, setClientPage] = React.useState(1);
    const [clientRowsPerPage, setClientRowsPerPage] = React.useState(10);

    const currentPage = serverSide ? page : clientPage;
    const rowsPerPage = serverSide ? propRowsPerPage || 10 : clientRowsPerPage;
    const totalRecords = serverSide ? count : data.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
    const currentData = serverSide ? data : data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRecords);

    React.useEffect(() => {
        if (!serverSide) setClientPage(1);
    }, [data.length, serverSide]);

    const totalColumns = columns.length + (renderActions ? 1 : 0) + (showSelection ? 1 : 0);

    const handleSelectAll = (e) => {
        if (!onSelectionChange) return;
        onSelectionChange(e.target.checked ? currentData.map(getRowKey) : []);
    };
    const handleSelectRow = (id) => {
        if (!onSelectionChange) return;
        onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
    };
    const isAllSelected = currentData.length > 0 && currentData.every(row => selectedIds.includes(getRowKey(row)));

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        if (serverSide) { if (onPageChange) onPageChange(newPage); }
        else setClientPage(newPage);
    };

    const handleRowsPerChange = (e) => {
        const newRows = Number(e.target.value);
        if (serverSide) { if (onRowsPerPageChange) onRowsPerPageChange(newRows); }
        else { setClientRowsPerPage(newRows); setClientPage(1); }
    };

    const getVisiblePages = () => {
        if (totalPages <= 7) return [...Array(totalPages).keys()].map(i => i + 1);
        if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
        if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    if (loading) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm ${className}`}>
                <div className="hidden lg:block">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                {columns.map((col, i) => (
                                    <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {col.label}
                                    </th>
                                ))}
                                {renderActions && <th className="px-6 py-3" />}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700/50">
                            {[...Array(rowsPerPage)].map((_, i) => <SkeletonRow key={i} columns={columns} />)}
                        </tbody>
                    </table>
                </div>
                <div className="lg:hidden">
                    {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col ${className}`}>

            {/* ── Desktop Table ────────────────────────────────── */}
            <div className="hidden lg:block overflow-x-auto min-h-[360px]">
                <table className="w-full">
                    {/* Header */}
                    <thead>
                        <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                            {showSelection && (
                                <th className="pl-6 pr-3 py-3 w-10">
                                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                </th>
                            )}
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors' : ''}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable && onSort && (
                                            <span className="flex flex-col gap-0 text-[9px] leading-none">
                                                <FaCaretUp className={sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'} />
                                                <FaCaretDown className={sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'} />
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {renderActions && (
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                        {currentData.map((row, index) => {
                            const rowId = getRowKey(row);
                            const isSelected = selectedIds.includes(rowId);
                            const isEven = index % 2 === 0;
                            return (
                                <React.Fragment key={rowId}>
                                    <tr
                                        onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                                        className={`transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''} ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                            : isEven
                                                ? `bg-white dark:bg-slate-800 ${hoverColor}`
                                                : `bg-gray-50/60 dark:bg-slate-800/70 ${hoverColor}`
                                            }`}>
                                        {showSelection && (
                                            <td className="pl-6 pr-3 py-4 w-10">
                                                <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(rowId)}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                            </td>
                                        )}
                                        {columns.map((col, i) => (
                                            <td key={i} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                                                {col.render ? col.render(row, index) : row[col.key]}
                                            </td>
                                        ))}
                                        {renderActions && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {renderActions(row, index)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {renderExpandedRow && expandedRowId === rowId && (
                                        <tr className="bg-blue-50/40 dark:bg-blue-900/10">
                                            <td colSpan={totalColumns} className="px-6 py-4">
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

            {/* ── Mobile Cards ────────────────────────────────── */}
            <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700/50">
                {currentData.map((row, index) => {
                    const rowId = getRowKey(row);
                    const isSelected = selectedIds.includes(rowId);
                    return (
                        <div
                            key={rowId}
                            onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                            className={`p-4 relative ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/60 dark:bg-slate-800/70'}`}
                        >
                            {showSelection && (
                                <div className="absolute top-4 right-4">
                                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectRow(rowId)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm" />
                                </div>
                            )}
                            {renderMobileCard ? renderMobileCard(row, index) : (
                                <div>
                                    {columns.slice(0, 2).map((col, i) => (
                                        <div key={i} className={i === 0 ? 'font-medium text-gray-900 dark:text-gray-100 pr-8' : 'text-sm text-gray-500 dark:text-gray-400 mt-0.5'}>
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

            {/* ── Pagination ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 gap-3 mt-auto">
                {/* Left: rows per page + count */}
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <select
                            value={rowsPerPage}
                            onChange={handleRowsPerChange}
                            className="border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">
                        Showing {totalRecords === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalRecords)} of {totalRecords}
                    </span>
                </div>

                {/* Right: page buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Prev
                    </button>

                    <div className="hidden sm:flex gap-1">
                        {getVisiblePages().map((p, i) => (
                            <button
                                key={i}
                                onClick={() => typeof p === 'number' && handlePageChange(p)}
                                disabled={p === '...'}
                                className={`w-8 h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-colors ${p === currentPage
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                                    : p === '...'
                                        ? 'cursor-default text-gray-400 dark:text-gray-500'
                                        : 'border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
export { SkeletonRow, SkeletonCard };

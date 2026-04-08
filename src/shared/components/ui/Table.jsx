import React from "react";
import { TableSkeleton } from "./Skeleton";

/**
 * Table Component
 *
 * A clean, configurable data table with built-in loading and empty states.
 *
 * Props:
 *  - columns     : array of column definitions (see below)
 *  - data        : array of row objects
 *  - loading     : show skeleton loader instead of data
 *  - emptyText   : message shown when data is empty (default: "No data found")
 *  - onRowClick  : optional callback called with the row object when a row is clicked
 *  - skeletonRows: number of skeleton rows to show while loading (default: 5)
 *  - className   : additional wrapper classes
 *
 * Column definition object:
 *  {
 *    key      : string  — unique key matching a field in the data object
 *    label    : string  — column header label
 *    render   : (value, row) => ReactNode  — optional custom cell renderer
 *    align    : "left" | "center" | "right"  (default: "left")
 *    width    : string  — optional Tailwind width class e.g. "w-16"
 *  }
 *
 * Example usage:
 *   const columns = [
 *     { key: "name",   label: "Member Name", render: (v, row) => <Avatar name={v} src={row.photo} /> },
 *     { key: "status", label: "Status",      render: (v) => <Badge variant={v === "active" ? "success" : "error"}>{v}</Badge> },
 *     { key: "joined", label: "Joined",      align: "right" },
 *   ];
 *
 *   <Table columns={columns} data={members} loading={isLoading} onRowClick={(row) => navigate(`/members/${row.id}`)} />
 */

const alignClass = { left: "text-left", center: "text-center", right: "text-right" };

export function Table({
    columns = [],
    data = [],
    loading = false,
    emptyText = "No data found.",
    onRowClick,
    skeletonRows = 5,
    className = "",
}) {
    if (loading) {
        return <TableSkeleton rows={skeletonRows} cols={columns.length || 5} className={className} />;
    }

    return (
        <div className={`overflow-x-auto rounded-xl border border-gray-100 dark:border-dark-border ${className}`}>
            <table className="w-full text-sm text-left">
                {/* Header */}
                <thead className="bg-gray-50 dark:bg-dark border-b border-gray-100 dark:border-dark-border">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${alignClass[col.align] ?? "text-left"} ${col.width ?? ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border bg-white dark:bg-dark-card">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-gray-400 dark:text-gray-500"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    {/* Empty state icon */}
                                    <svg className="w-10 h-10 text-gray-300 dark:text-dark-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{emptyText}</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIdx) => (
                            <tr
                                key={row.id ?? rowIdx}
                                onClick={() => onRowClick?.(row)}
                                className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-dark" : ""}`}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-6 py-4 text-gray-700 dark:text-gray-300 ${alignClass[col.align] ?? "text-left"} ${col.width ?? ""}`}
                                    >
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : row[col.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

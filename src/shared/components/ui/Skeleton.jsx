import React from "react";

/**
 * Skeleton & Loading Components
 *
 * Use these EVERYWHERE instead of spinners for loading states.
 *
 * Available:
 *  - <Skeleton />           — single line/block shimmer
 *  - <SkeletonText />       — multi-line text block
 *  - <CardSkeleton />       — card loading placeholder
 *  - <TableSkeleton />      — table rows loading (default 5 rows)
 *  - <AvatarSkeleton />     — circle + name/email lines
 *  - <FormSkeleton />       — form fields loading placeholder
 *  - <StatCardSkeleton />   — dashboard stat card loading
 *  - <PageSkeleton />       — full page content loading
 *
 * Example usage:
 *   // Single block
 *   <Skeleton className="h-10 w-full rounded-lg" />
 *
 *   // Table loading
 *   {loading ? <TableSkeleton rows={8} cols={5} /> : <MyTable />}
 *
 *   // Card loading
 *   {loading ? <CardSkeleton /> : <MemberCard />}
 */

const shimmer =
  "animate-pulse bg-gray-200 dark:bg-dark-border rounded";

// ─── Base Skeleton ─────────────────────────────────────────────────────────────
export function Skeleton({ className = "" }) {
  return <div className={`${shimmer} ${className}`} aria-hidden="true" />;
}

// ─── Multi-line text block ──────────────────────────────────────────────────────
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${shimmer} h-4 rounded ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

// ─── Card Skeleton ──────────────────────────────────────────────────────────────
export function CardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className={`${shimmer} w-10 h-10 rounded-full`} />
        <div className="flex-1 space-y-2">
          <div className={`${shimmer} h-4 w-2/3 rounded`} />
          <div className={`${shimmer} h-3 w-1/2 rounded`} />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className={`${shimmer} h-9 w-1/3 rounded-lg`} />
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5, className = "" }) {
  const colWidths = ["w-8", "w-32", "w-24", "w-20", "w-16", "w-12"];
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-100 dark:border-dark-border ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`${shimmer} h-4 ${colWidths[i % colWidths.length]} rounded`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="px-6 py-4 border-b last:border-0 border-gray-50 dark:border-dark-border bg-white dark:bg-dark-card flex gap-4 items-center"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              className={`${shimmer} h-4 ${col === 0 ? "w-8 rounded-full h-8" : colWidths[col % colWidths.length]} rounded`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Avatar Skeleton ────────────────────────────────────────────────────────────
export function AvatarSkeleton({ size = "md", showText = true, className = "" }) {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12", xl: "w-16 h-16" };
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className={`${shimmer} rounded-full shrink-0 ${sizes[size] ?? sizes.md}`} />
      {showText && (
        <div className="space-y-1.5 flex-1">
          <div className={`${shimmer} h-4 w-28 rounded`} />
          <div className={`${shimmer} h-3 w-20 rounded`} />
        </div>
      )}
    </div>
  );
}

// ─── Form Skeleton ──────────────────────────────────────────────────────────────
export function FormSkeleton({ fields = 4, className = "" }) {
  return (
    <div className={`space-y-5 ${className}`} aria-hidden="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className={`${shimmer} h-4 w-24 rounded`} />
          <div className={`${shimmer} h-10 w-full rounded-lg`} />
        </div>
      ))}
      <div className={`${shimmer} h-10 w-32 rounded-lg`} />
    </div>
  );
}

// ─── Stat Card Skeleton ─────────────────────────────────────────────────────────
export function StatCardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-5 space-y-3 ${className}`}
      aria-hidden="true"
    >
      <div className="flex justify-between items-start">
        <div className={`${shimmer} h-4 w-20 rounded`} />
        <div className={`${shimmer} w-9 h-9 rounded-lg`} />
      </div>
      <div className={`${shimmer} h-8 w-28 rounded`} />
      <div className={`${shimmer} h-3 w-36 rounded`} />
    </div>
  );
}

// ─── Page Skeleton ──────────────────────────────────────────────────────────────
/**
 * Full page loading placeholder.
 * Shows stat cards row + table skeleton.
 *
 * Example:
 *   if (loading) return <PageSkeleton />;
 */
export function PageSkeleton({ stats = 4, tableRows = 8, tableCols = 5 }) {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading page…">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: stats }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Table */}
      <TableSkeleton rows={tableRows} cols={tableCols} />
    </div>
  );
}

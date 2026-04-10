/**
 * Report Exporters — pure-browser CSV / Excel / PDF.
 *
 * Why no dependencies?
 *   We deliberately avoid xlsx, jspdf, file-saver, etc. They add 100s of KB
 *   to the bundle for what amounts to three calls. Each exporter here uses a
 *   different native browser primitive:
 *
 *     CSV   → Blob with `text/csv;charset=utf-8;` (UTF-8 BOM so Excel opens
 *             ₹ symbols and accented names correctly).
 *     Excel → Blob with HTML-table content + `application/vnd.ms-excel` MIME
 *             and a `.xls` extension. Excel and Google Sheets both open this
 *             natively as a real spreadsheet (not a CSV pretending to be one).
 *     PDF   → A new window with print-friendly HTML and `window.print()`.
 *             The browser handles "Save as PDF". This produces a far better
 *             rendering than rasterising the page would, because text stays
 *             text and tables stay tables.
 *
 * All three accept a common `{ filename, columns, rows, title, subtitle }`
 * shape so a caller can wire one ExportMenu component to all three.
 */

// ─────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────

const stringify = (val) => {
    if (val === null || val === undefined) return '';
    if (val instanceof Date) return val.toLocaleDateString('en-IN');
    return String(val);
};

const escapeCsvCell = (val) => {
    const str = stringify(val);
    if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
};

const escapeHtml = (val) => stringify(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const todayStamp = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────
// CSV
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {Object}   opts
 * @param {string}   opts.filename  — base filename without extension
 * @param {Array<{key: string, label: string}>} opts.columns
 * @param {Array<Object>} opts.rows
 */
export function exportToCSV({ filename, columns, rows }) {
    const headers = columns.map(c => escapeCsvCell(c.label)).join(',');
    const body = rows.map(row =>
        columns.map(c => escapeCsvCell(row[c.key])).join(',')
    ).join('\n');

    // BOM ('\ufeff') is what convinces Excel that this file is UTF-8 and not
    // Windows-1252, which would otherwise corrupt ₹, é, ñ, etc.
    const blob = new Blob(['\ufeff' + headers + '\n' + body], {
        type: 'text/csv;charset=utf-8;',
    });
    triggerDownload(blob, `${filename}-${todayStamp()}.csv`);
}

// ─────────────────────────────────────────────────────────────────────────
// Excel (.xls via HTML table)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Excel/Sheets recognise an HTML table inside an `application/vnd.ms-excel`
 * payload as a real spreadsheet — no xlsx library required. The styling is
 * intentionally minimal: thick header borders, bold headers, right-aligned
 * numerics. Anything fancier risks breaking older Excel versions.
 */
export function exportToExcel({ filename, columns, rows, title }) {
    const headerHtml = columns.map(c =>
        `<th style="background:#1e293b;color:#fff;padding:8px;border:1px solid #334155;text-align:left;font-weight:bold">${escapeHtml(c.label)}</th>`
    ).join('');

    const bodyHtml = rows.map(row => {
        const cells = columns.map(c => {
            const val = row[c.key];
            const isNumber = typeof val === 'number';
            const align = isNumber ? 'right' : 'left';
            return `<td style="padding:6px;border:1px solid #cbd5e1;text-align:${align}">${escapeHtml(val)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>${escapeHtml(title || 'Report')}</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
        </head>
        <body>
            ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
            <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px">
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/vnd.ms-excel',
    });
    triggerDownload(blob, `${filename}-${todayStamp()}.xls`);
}

// ─────────────────────────────────────────────────────────────────────────
// PDF (via print window)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Opens a new tab with a clean, print-styled report and triggers
 * `window.print()`. The user picks "Save as PDF" in the print dialog.
 *
 * Why this beats jsPDF: text stays selectable, tables flow across pages
 * naturally, and the bundle stays small. Downside: it's a two-click flow
 * (click Export PDF → choose Save as PDF). Acceptable tradeoff.
 */
export function exportToPDF({ filename, columns, rows, title, subtitle }) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
        // Pop-up blocker hit. Caller should toast a hint.
        throw new Error('POPUP_BLOCKED');
    }

    const headerHtml = columns.map(c =>
        `<th>${escapeHtml(c.label)}</th>`
    ).join('');

    const bodyHtml = rows.map(row => {
        const cells = columns.map(c => {
            const val = row[c.key];
            const isNumber = typeof val === 'number';
            return `<td class="${isNumber ? 'num' : ''}">${escapeHtml(val)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>${escapeHtml(filename)}</title>
            <style>
                @page { size: A4; margin: 18mm 14mm; }
                * { box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
                    color: #0f172a;
                    margin: 0;
                    padding: 24px;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .header {
                    border-bottom: 2px solid #1e293b;
                    padding-bottom: 12px;
                    margin-bottom: 18px;
                }
                .header h1 {
                    font-size: 20px;
                    margin: 0 0 4px 0;
                    color: #0f172a;
                }
                .header .subtitle {
                    font-size: 12px;
                    color: #64748b;
                    margin: 0;
                }
                .header .meta {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 6px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                    margin-top: 8px;
                }
                thead th {
                    background: #1e293b;
                    color: #ffffff;
                    text-align: left;
                    padding: 8px 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 0.04em;
                }
                tbody td {
                    padding: 7px 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tbody tr:nth-child(even) td {
                    background: #f8fafc;
                }
                td.num { text-align: right; font-variant-numeric: tabular-nums; }
                .footer {
                    margin-top: 24px;
                    padding-top: 12px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 10px;
                    color: #94a3b8;
                    text-align: center;
                }
                @media print {
                    body { padding: 0; }
                    thead { display: table-header-group; }
                    tr { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${escapeHtml(title || filename)}</h1>
                ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
                <p class="meta">Generated ${new Date().toLocaleString('en-IN')} · ${rows.length} record${rows.length === 1 ? '' : 's'}</p>
            </div>
            <table>
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${bodyHtml}</tbody>
            </table>
            <div class="footer">N3 Fit · Generated by Reports Module</div>
            <script>
                // Wait for layout, then print. Auto-close after the dialog
                // dismisses so we don't leave orphan tabs.
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 300);
                    }, 200);
                });
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}

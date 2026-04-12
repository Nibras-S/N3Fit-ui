import React, { useState, useEffect } from 'react';
import { FaFileCsv, FaUpload, FaTimes, FaCheck, FaExclamationTriangle, FaDownload, FaArrowRight, FaArrowLeft, FaTable, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../../shared/services/api';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';

const dateFormats = [
    {
        group: 'Year-Month-Day (International)', formats: [
            { label: 'YYYY-MM-DD (e.g. 2024-01-31)', value: 'YYYY-MM-DD' },
            { label: 'YYYY/MM/DD (e.g. 2024/01/31)', value: 'YYYY/MM/DD' },
            { label: 'YYYY.MM.DD (e.g. 2024.01.31)', value: 'YYYY.MM.DD' },
            { label: 'YYYYMMDD (e.g. 20240131)', value: 'YYYYMMDD' },
        ]
    },
    {
        group: 'Month-Day-Year (US Format)', formats: [
            { label: 'MM-DD-YYYY (e.g. 01-31-2024)', value: 'MM-DD-YYYY' },
            { label: 'MM/DD/YYYY (e.g. 01/31/2024)', value: 'MM/DD/YYYY' },
            { label: 'MM.DD.YYYY (e.g. 01.31.2024)', value: 'MM.DD.YYYY' },
            { label: 'M/D/YYYY (e.g. 1/31/2024)', value: 'M/D/YYYY' },
        ]
    },
    {
        group: 'Day-Month-Year (Common)', formats: [
            { label: 'DD-MM-YYYY (e.g. 31-01-2024)', value: 'DD-MM-YYYY' },
            { label: 'DD/MM/YYYY (e.g. 31/01/2024)', value: 'DD/MM/YYYY' },
            { label: 'DD.MM.YYYY (e.g. 31.01.2024)', value: 'DD.MM.YYYY' },
            { label: 'D/M/YYYY (e.g. 31/1/2024)', value: 'D/M/YYYY' },
        ]
    },
    {
        group: 'Short Year (2-digit)', formats: [
            { label: 'MM-DD-YY (e.g. 01-31-24)', value: 'MM-DD-YY' },
            { label: 'DD-MM-YY (e.g. 31-01-24)', value: 'DD-MM-YY' },
            { label: 'YY-MM-DD (e.g. 24-01-31)', value: 'YY-MM-DD' },
            { label: 'MM/DD/YY (e.g. 01/31/24)', value: 'MM/DD/YY' },
            { label: 'DD/MM/YY (e.g. 31/01/24)', value: 'DD/MM/YY' },
        ]
    },
    {
        group: 'Text Month Formats', formats: [
            { label: 'January 31, 2024', value: 'TEXT-MDY' },
            { label: '31 January 2024', value: 'TEXT-DMY' },
            { label: '2024 January 31', value: 'TEXT-YMD' },
        ]
    }
];

const CSVImportModal = ({ isOpen, onClose, onRefresh }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [hasHeaders, setHasHeaders] = useState(true);
    const [csvRows, setCsvRows] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [importing, setImporting] = useState(false);
    const [dateFormat, setDateFormat] = useState('DD-MM-YYYY');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"' && inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    };

    const targetFields = [
        { key: 'name', label: 'Member Name', required: true },
        { key: 'phone', label: 'Phone Number', required: true },
        { key: 'gender', label: 'Gender', required: false },
        { key: 'plan', label: 'Membership Plan', required: false },
        { key: 'date', label: 'Start Date', required: false },
        { key: 'endDate', label: 'End Date', required: false },
        { key: 'dob', label: 'Date of Birth', required: false },
        { key: 'address', label: 'Address', required: false },
    ];

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFile(null);
            setCsvRows([]);
            setCsvHeaders([]);
            setMapping({});
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            readCSV(selectedFile);
        } else {
            toast.error("Please select a valid CSV file");
        }
    };

    const readCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            const rows = lines.map(line => parseCSVLine(line));
            setCsvRows(rows);

            if (rows.length > 0) {
                const firstRow = rows[0];
                const initialMapping = {};
                const currentHeaders = hasHeaders ? firstRow : firstRow.map((_, i) => `Column ${i + 1}`);
                setCsvHeaders(currentHeaders);

                targetFields.forEach(field => {
                    const matchIdx = firstRow.findIndex(h => {
                        const head = String(h || '').toLowerCase();
                        return head.includes(field.key.toLowerCase()) ||
                            (field.key === 'phone' && (head.includes('contact') || head.includes('mobile')));
                    });
                    if (matchIdx !== -1) {
                        initialMapping[field.key] = matchIdx;
                    }
                });
                setMapping(initialMapping);
            }
        };
        reader.readAsText(file);
    };

    const handleHeaderToggle = (val) => {
        setHasHeaders(val);
        if (csvRows.length > 0) {
            const firstRow = csvRows[0];
            const newHeaders = val ? firstRow : firstRow.map((_, i) => `Column ${i + 1}`);
            setCsvHeaders(newHeaders);
        }
    };

    const downloadSample = () => {
        const headers = "name,phone,gender,plan,date,dob,address\n";
        const sample = "John Doe,9876543210,Male,1-Month,2024-01-01,1990-05-15,\"123 Gym Street, City\"";
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_members.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const validateMapping = () => {
        const missing = targetFields.filter(f => f.required && mapping[f.key] === undefined);
        if (missing.length > 0) {
            toast.error(`Please map required fields: ${missing.map(m => m.label).join(', ')}`);
            return false;
        }
        return true;
    };

    const handleImport = async () => {
        if (!validateMapping()) return;
        setImporting(true);
        try {
            const startIndex = hasHeaders ? 1 : 0;
            const contacts = csvRows.slice(startIndex).map(row => {
                const obj = {};
                Object.keys(mapping).forEach(fieldKey => {
                    const colIdx = mapping[fieldKey];
                    if (colIdx !== undefined && row[colIdx]) {
                        obj[fieldKey] = row[colIdx];
                    }
                });
                return obj;
            }).filter(c => c.name && c.phone);

            const response = await api.post(`/contacts/import`, {
                contacts,
                dateFormat
            });
            const { success, duplicates, errors } = response.data.data;

            toast.success(
                <div className="flex flex-col gap-1">
                    <p className="font-bold">Import Finished!</p>
                    <p className="text-xs">✅ {success} Success</p>
                    {duplicates > 0 && <p className="text-xs">🔄 {duplicates} Duplicates skipped</p>}
                    {errors > 0 && <p className="text-xs">❌ {errors} Errors</p>}
                </div>,
                { duration: 5000 }
            );

            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to import members");
        } finally {
            setImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-900/20">
                            <FaFileCsv size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Import Members Wizard</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step === 1 ? 'bg-zinc-100 text-zinc-900' : 'bg-green-100 text-green-600'}`}>STEP {step} OF 2</span>
                                <span className="text-[10px] text-gray-400 font-medium">{step === 1 ? 'Upload & Settings' : 'Column Mapping'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors">
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {!file ? (
                                <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl p-12 text-center bg-gray-50/50 dark:bg-zinc-900/10 hover:bg-white dark:hover:bg-zinc-800/50 transition-all group relative">
                                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csvFile" />
                                    <label htmlFor="csvFile" className="cursor-pointer block">
                                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <FaUpload className="text-zinc-900 dark:text-zinc-500" size={24} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Click to upload CSV</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-10">Select a member list in CSV format to start the import process.</p>
                                        <span className="px-8 py-3 bg-zinc-900 rounded-2xl text-sm font-bold text-white shadow-xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all">Choose File</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm border border-zinc-200 dark:border-zinc-700/20">
                                                <FaFileCsv className="text-zinc-900" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{(file.size / 1024).toFixed(1)} KB • {csvRows.length} Rows Detected</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setFile(null); setCsvRows([]); }} className="p-2 text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 rounded-lg transition-colors" title="Remove File">
                                            <FaTimes size={16} />
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Import Settings</h4>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">First line contains column names</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">Toggle this if your CSV has a header row at the top.</p>
                                            </div>
                                            <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
                                                <button
                                                    onClick={() => handleHeaderToggle(true)}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${hasHeaders ? 'bg-zinc-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => handleHeaderToggle(false)}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${!hasHeaders ? 'bg-zinc-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                                        <FaExclamationTriangle size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Tips</span>
                                    </div>
                                    <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed font-medium">Use consistent plan names like <b>1-Month, 3-Month</b> etc. Support for dates in <b>YYYY-MM-DD</b> format is recommended.</p>
                                </div>
                                <button
                                    onClick={downloadSample}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-950/30 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 transition-all group"
                                >
                                    <FaDownload className="text-zinc-700 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-center">Download Sample CSV Template</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/20 mb-4">
                                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-500 mb-1">
                                    <FaTable size={14} />
                                    <h4 className="text-xs font-bold uppercase tracking-wider">Map your columns</h4>
                                </div>
                                <p className="text-xs text-gray-500 leading-normal">Tell us which column in your CSV matches each member field. Fields marked with * are mandatory.</p>
                            </div>

                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {targetFields.map((field) => (
                                    <div key={field.key} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 transition-colors">
                                        <div className="w-1/3">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {field.label} {field.required && <span className="text-zinc-700">*</span>}
                                            </p>
                                        </div>
                                        <div className="w-2/3">
                                            <select
                                                value={mapping[field.key] ?? ''}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 outline-none transition-all"
                                            >
                                                <option value="">-- Don't Map / Skip --</option>
                                                {csvHeaders.map((header, idx) => (
                                                    <option key={idx} value={idx}>{header}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                                <p className="text-[10px] text-gray-400 font-medium">CSV Preview: <span className="text-gray-600 dark:text-gray-300 italic">{csvRows[hasHeaders ? 1 : 0]?.slice(0, 3).join(', ')} ...</span></p>
                            </div>

                            <div className="p-5 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                        <FaCalendarAlt size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Date Format Correction</h4>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Tell us how dates (Start Date, DOB, etc.) are written in your file.</p>
                                    </div>
                                </div>

                                <select
                                    value={dateFormat}
                                    onChange={(e) => setDateFormat(e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-700 dark:text-gray-200 shadow-sm"
                                >
                                    {dateFormats.map((group, gIdx) => (
                                        <optgroup key={gIdx} label={group.group}>
                                            {group.formats.map((f, fIdx) => (
                                                <option key={fIdx} value={f.value}>{f.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2"
                        >
                            <FaArrowLeft /> Back
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                    >
                        Cancel
                    </button>
                    {step === 1 ? (
                        <button
                            onClick={() => file ? setStep(2) : toast.error("Please select a file first")}
                            disabled={!file}
                            className="flex-1 py-3 rounded-2xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 shadow-xl shadow-zinc-900/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Configure Mapping <FaArrowRight />
                        </button>
                    ) : (
                        <button
                            onClick={handleImport}
                            disabled={importing}
                            className="flex-1 py-3 rounded-2xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 shadow-xl shadow-zinc-900/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {importing ? (
                                <ButtonSpinner />
                            ) : (
                                <>
                                    <FaCheck /> Start Final Import
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;

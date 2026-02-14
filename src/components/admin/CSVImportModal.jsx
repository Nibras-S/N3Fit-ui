import React, { useState } from 'react';
import { FaFileCsv, FaUpload, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const CSVImportModal = ({ isOpen, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            parseCSV(selectedFile);
        } else {
            toast.error("Please select a valid CSV file");
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const data = lines.slice(1).filter(l => l.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = values[i];
                });
                return obj;
            });
            setPreviewData(data.slice(0, 5)); // Show first 5 rows
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const contacts = lines.slice(1).filter(l => l.trim()).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const obj = {};
                    headers.forEach((header, i) => {
                        // Map CSV headers to model fields
                        const key = mapHeader(header);
                        if (key) obj[key] = values[i];
                    });
                    return obj;
                }).filter(c => c.name && c.phone);

                await axios.post(`${backendUrl}/api/contacts/import`, { contacts });
                toast.success(`${contacts.length} members imported successfully`);
                onRefresh();
                onClose();
            };
            reader.readAsText(file);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to import members");
        } finally {
            setImporting(false);
        }
    };

    const mapHeader = (h) => {
        if (h.includes('name')) return 'name';
        if (h.includes('phone') || h.includes('contact') || h.includes('mobile')) return 'phone';
        if (h.includes('gender')) return 'gender';
        if (h.includes('plan')) return 'plan';
        if (h.includes('date')) return 'date';
        if (h.includes('dew') || h.includes('day')) return 'dews';
        if (h.includes('status')) return 'status';
        if (h.includes('dob') || h.includes('birth')) return 'dob';
        return null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FaFileCsv size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Import Members</h3>
                            <p className="text-xs text-gray-500">Upload a CSV file to bulk add members</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="p-8">
                    {!file ? (
                        <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl p-12 text-center bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 transition-all group">
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csvFile" />
                            <label htmlFor="csvFile" className="cursor-pointer">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <FaUpload className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Click to upload CSV</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">File must contain headers like: name, phone, gender, plan</p>
                                <span className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm group-hover:border-blue-300 transition-colors">Select File</span>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-3">
                                    <FaFileCsv className="text-blue-600" size={20} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => { setFile(null); setPreviewData([]); }} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                            </div>

                            {previewData.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preview (First 5 Rows)</p>
                                    <div className="border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 border-b border-gray-100 dark:border-slate-700">
                                                <tr>
                                                    {Object.keys(previewData[0]).map(h => <th key={h} className="px-4 py-2 font-bold uppercase">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="bg-white dark:bg-slate-800">
                                                        {Object.values(row).map((v, j) => <td key={j} className="px-4 py-2 text-gray-600 dark:text-gray-300">{v}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <FaExclamationTriangle className="text-amber-500 shrink-0" size={14} />
                                <p className="text-[10px] text-amber-700 dark:text-amber-400">Ensure your CSV headers match:<b>name, phone, gender, plan</b> for best results.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {importing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaCheck /> Confirm Import
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;

import React, { useState, useEffect, useMemo } from 'react';
import {
    FaBullhorn, FaImage, FaUsers, FaArrowRight,
    FaCheckCircle, FaExclamationCircle, FaSpinner,
    FaSearch, FaCheck, FaTrash, FaPlus, FaTimes, FaWhatsapp, FaBell, FaExclamationTriangle
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';

const Announcement = () => {
    const { api, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingContacts, setFetchingContacts] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [mode, setMode] = useState(user?.role === 'superadmin' ? 'internal' : 'whatsapp'); // whatsapp, internal
    const [gyms, setGyms] = useState([]);
    const [selectedGyms, setSelectedGyms] = useState([]);
    const [fetchingGyms, setFetchingGyms] = useState(false);

    const [form, setForm] = useState({
        heading: '',
        caption: '',
        image: null,
        imagePreview: null,
        audience: 'all', // all, active, expired, selected (whatsapp) | all, selected (internal)
        type: 'notification' // notification, warning
    });

    const [progress, setProgress] = useState(null);

    useEffect(() => {
        if (user?.role === 'superadmin') {
            fetchGyms();
        } else {
            fetchContacts();
        }
    }, [user]);

    const fetchGyms = async () => {
        setFetchingGyms(true);
        try {
            const res = await api.get('/api/superadmin/gyms');
            setGyms(res.data);
        } catch (err) {
            toast.error('Failed to load gyms');
        } finally {
            setFetchingGyms(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get('/api/contacts/');
            setContacts(res.data);
        } catch (err) {
            toast.error('Failed to load contacts');
        } finally {
            setFetchingContacts(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({
                ...prev,
                image: {
                    data: reader.result.split(',')[1],
                    mimetype: file.type,
                    filename: file.name
                },
                imagePreview: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const toggleGym = (id) => {
        setSelectedGyms(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const filteredContacts = useMemo(() => {
        if (!searchTerm) return contacts;
        const term = searchTerm.toLowerCase();
        return contacts.filter(c =>
            c.name.toLowerCase().includes(term) ||
            c.phone.includes(searchTerm)
        );
    }, [contacts, searchTerm]);

    const handleSend = async () => {
        if (!form.caption && !form.image && mode === 'whatsapp') {
            toast.error('Please provide at least a caption or an image');
            return;
        }

        if (!form.caption && mode === 'internal') {
            toast.error('Please provide a message');
            return;
        }



        setLoading(true);
        try {
            if (mode === 'whatsapp') {
                if (form.audience === 'selected' && selectedMembers.length === 0) {
                    toast.error('Please select at least one member');
                    setLoading(false);
                    return;
                }
                const res = await api.post('/api/whatsapp/announcement', {
                    ...form,
                    selectedMembers: form.audience === 'selected' ? selectedMembers : []
                });
                if (res.data.success) {
                    toast.success(`Announcement sent! (Sent: ${res.data.results.sent}, Failed: ${res.data.results.failed})`);
                    resetForm();
                }
            } else {
                // Internal Notification/Warning
                if (form.audience === 'selected' && selectedGyms.length === 0) {
                    toast.error('Please select at least one gym');
                    setLoading(false);
                    return;
                }
                const res = await api.post('/api/notifications', {
                    message: form.caption,
                    type: form.type,
                    targetGyms: form.audience === 'all' ? ['all'] : selectedGyms
                });
                if (res.status === 201) {
                    toast.success(`${form.type.charAt(0).toUpperCase() + form.type.slice(1)} sent successfully!`);
                    resetForm();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            heading: '',
            caption: '',
            image: null,
            imagePreview: null,
            audience: 'all',
            type: 'notification'
        });
        setSelectedMembers([]);
        setSelectedGyms([]);
    };

    return (
        <AppLayout showGenderSwitch={false}>
            <div className="max-w-5xl mx-auto pb-10">
                <Toaster position="top-right" />



                <PageHeader
                    title={user?.role === 'superadmin' ? 'Internal Broadcast' : 'WhatsApp Announcement'}
                    subtitle={user?.role === 'superadmin' ? 'Post news or urgent warnings to gym dashboards' : 'Broadcast messages to your gym members instantly'}
                />

                {/* No more toggle - feature is strictly role-based */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Draft Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {mode === 'whatsapp' ? <FaBullhorn className="text-blue-500" /> : <FaBell className="text-orange-500" />}
                                    {mode === 'whatsapp' ? 'Draft WhatsApp Message' : 'Draft Internal Message'}
                                </h2>
                                {mode === 'whatsapp' ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                                        <FaWhatsapp className="text-green-500 text-[10px]" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Cloud API</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                                        <FaBell className="text-orange-500 text-[10px]" />
                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Internal Broadcast</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-5">
                                {mode === 'whatsapp' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Heading (Optional)</label>
                                        <input
                                            type="text"
                                            value={form.heading}
                                            onChange={(e) => setForm(p => ({ ...p, heading: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="e.g. SPECIAL OFFER! 🎉"
                                        />
                                    </div>
                                )}

                                {mode === 'internal' && (
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'notification', label: 'Notification', icon: FaBell, color: 'text-blue-500' },
                                            { id: 'warning', label: 'Urgent Warning', icon: FaExclamationTriangle, color: 'text-red-500' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setForm(p => ({ ...p, type: t.id }))}
                                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${form.type === t.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-slate-700 text-gray-400'}`}
                                            >
                                                <t.icon className={form.type === t.id ? t.color : ''} size={20} />
                                                <span className={`text-xs font-bold ${form.type === t.id ? 'text-gray-900 dark:text-white' : ''}`}>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{mode === 'whatsapp' ? 'Caption' : 'Message Content'}</label>
                                    <textarea
                                        rows={mode === 'whatsapp' ? 4 : 6}
                                        value={form.caption}
                                        onChange={(e) => setForm(p => ({ ...p, caption: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                        placeholder={mode === 'whatsapp' ? "Write your announcement message here..." : "Type the update or warning message for the app users..."}
                                    />
                                </div>

                                {mode === 'whatsapp' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-gray-900 dark:text-white">Announcement Image</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-slate-700 border-dashed rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors group cursor-pointer"
                                            onClick={() => document.getElementById('image-upload').click()}>
                                            <div className="space-y-1 text-center font-bold text-gray-900 dark:text-white">
                                                {form.imagePreview ? (
                                                    <div className="relative inline-block">
                                                        <img src={form.imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-md" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, image: null, imagePreview: null })); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FaImage className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">Upload an image</span>
                                                            <p className="pl-1 text-gray-900 dark:text-white">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-bold text-gray-900 dark:text-white">PNG, JPG up to 5MB</p>
                                                    </>
                                                )}
                                                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Audience Section */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FaUsers className="text-purple-500" />
                                    Target Audience
                                </h2>
                            </div>
                            <div className="p-6 space-y-3 font-bold text-gray-900 dark:text-white">
                                {mode === 'whatsapp' ? (
                                    [
                                        { id: 'all', label: 'All Members', desc: 'Send to everyone in your database' },
                                        { id: 'active', label: 'Active Only', desc: 'Only members with active plans' },
                                        { id: 'expired', label: 'Expired Only', desc: 'Only members with expired plans' },
                                        { id: 'selected', label: 'Select Specific', desc: 'Choose members manually' }
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.audience === opt.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-50 dark:border-slate-700 hover:border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="audience"
                                                className="mt-1"
                                                checked={form.audience === opt.id}
                                                onChange={() => setForm(p => ({ ...p, audience: opt.id }))}
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    [
                                        { id: 'all', label: 'All Gyms', desc: 'Broadcast to every gym on platform' },
                                        { id: 'selected', label: 'Select Gyms', desc: 'Target specific gym locations' }
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.audience === opt.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-50 dark:border-slate-700 hover:border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="audience"
                                                className="mt-1"
                                                checked={form.audience === opt.id}
                                                onChange={() => setForm(p => ({ ...p, audience: opt.id }))}
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.label}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {form.audience === 'selected' && mode === 'whatsapp' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-4 border-b border-gray-50 dark:border-slate-700">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg text-xs outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {fetchingContacts ? (
                                        <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-blue-500" /></div>
                                    ) : filteredContacts.map(contact => (
                                        <div
                                            key={contact._id}
                                            onClick={() => toggleMember(contact._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(contact._id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{contact.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{contact.phone}</p>
                                            </div>
                                            {selectedMembers.includes(contact._id) && <FaCheckCircle className="text-blue-500" size={12} />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-[10px] font-medium text-gray-500">{selectedMembers.length} selected</span>
                                    <button
                                        onClick={() => setSelectedMembers([])}
                                        className="text-[10px] font-medium text-red-500 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}

                        {form.audience === 'selected' && mode === 'internal' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-4 border-b border-gray-50 dark:border-slate-700">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            placeholder="Search gyms..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg text-xs outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {fetchingGyms ? (
                                        <div className="text-center py-4"><FaSpinner className="animate-spin mx-auto text-blue-500" /></div>
                                    ) : gyms.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(gym => (
                                        <div
                                            key={gym._id}
                                            onClick={() => toggleGym(gym._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedGyms.includes(gym._id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{gym.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{gym.gymCode}</p>
                                            </div>
                                            {selectedGyms.includes(gym._id) && <FaCheckCircle className="text-blue-500" size={12} />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-[10px] font-medium text-gray-500">{selectedGyms.length} selected</span>
                                    <button
                                        onClick={() => setSelectedGyms([])}
                                        className="text-[10px] font-medium text-red-500 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    {mode === 'whatsapp' ? 'Sending Announcements...' : 'Posting Message...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'whatsapp' ? <FaWhatsapp size={20} /> : <FaBell size={20} />}
                                    {mode === 'whatsapp' ? 'Send WhatsApp Announcement' : `Send ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Announcement;

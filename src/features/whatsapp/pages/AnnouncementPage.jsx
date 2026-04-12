import React, { useState, useEffect, useMemo } from 'react';
import {
    FaBullhorn, FaImage, FaUsers, FaArrowRight,
    FaCheckCircle, FaExclamationCircle, FaSpinner,
    FaSearch, FaCheck, FaTrash, FaPlus, FaTimes, FaWhatsapp, FaBell, FaExclamationTriangle
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';

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
            const res = await api.get('/superadmin/gyms');
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const data = Array.isArray(res.data) ? res.data : [];
            setGyms(data);
        } catch (err) {
            toast.error('Failed to load gyms');
        } finally {
            setFetchingGyms(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const res = await api.get('/contacts/');
            // response.data IS already the unwrapped payload — don't re-unwrap in feature code
            const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
            setContacts(data);
        } catch (err) {
            toast.error('Failed to load contacts');
        } finally {
            setFetchingContacts(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error('No file selected');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Only JPG and PNG images are supported by WhatsApp');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            if (!base64Data) {
                toast.error('Failed to process image file');
                return;
            }

            setForm(prev => ({
                ...prev,
                image: {
                    data: base64Data,
                    mimetype: file.type,
                    filename: file.name
                },
                imagePreview: reader.result
            }));
            toast.success('Image attached successfully!');
        };
        reader.onerror = () => {
            toast.error('Error reading the file');
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

                // Debug log before sending
                console.log("Sending payload to backend with image:", !!form.image);

                const res = await api.post('/whatsapp/announcement', {
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
                    toast.error('Please select at least one fit club');
                    setLoading(false);
                    return;
                }
                const res = await api.post('/notifications', {
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
            console.error("Announcement Error:", err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to send';
            // Need to make sure the errorMessage is a string, not an object
            toast.error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
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
        <AppLayout
            title={user?.role === 'superadmin' ? 'Internal Broadcast' : 'WhatsApp Announcement'}
            description={user?.role === 'superadmin' ? 'Post news or urgent warnings to fit club dashboards' : 'Broadcast messages to your fit club members instantly'}
            icon={user?.role === 'superadmin' ? FaBell : FaWhatsapp}
            showGenderSwitch={false}
        >
            <div className="mx-auto pb-10">
                <Toaster position="top-right" />

                {/* Auto-reminder status info card (gym users only) */}
                {user?.role !== 'superadmin' && (
                    <div className={`mt-4 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
                        user?.gym?.features?.autoWhatsappReminders
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/40 text-green-800 dark:text-green-300'
                            : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400'
                    }`}>
                        <FaBell className={`mt-0.5 shrink-0 ${user?.gym?.features?.autoWhatsappReminders ? 'text-green-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                        <div>
                            <span className="font-medium">
                                Auto reminders are {user?.gym?.features?.autoWhatsappReminders ? 'ON' : 'OFF'}
                            </span>
                            <span className="ml-1">
                                {user?.gym?.features?.autoWhatsappReminders
                                    ? '— Members receive automatic WhatsApp messages 3 days before, on expiry day, and 3 days after expiry.'
                                    : '— Enable "Auto WhatsApp Reminders" from your gym settings to send automatic expiry reminders.'}
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Draft Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/30">
                                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    {mode === 'whatsapp' ? <FaBullhorn className="text-zinc-700" /> : <FaBell className="text-orange-500" />}
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
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all outline-none"
                                            placeholder="e.g. SPECIAL OFFER! 🎉"
                                        />
                                    </div>
                                )}

                                {mode === 'internal' && (
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'notification', label: 'Notification', icon: FaBell, color: 'text-zinc-700' },
                                            { id: 'warning', label: 'Urgent Warning', icon: FaExclamationTriangle, color: 'text-zinc-700' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setForm(p => ({ ...p, type: t.id }))}
                                                className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${form.type === t.id ? 'border-zinc-900 bg-zinc-50/50 dark:bg-zinc-800/50' : 'border-gray-100 dark:border-zinc-800 text-gray-400'}`}
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
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all outline-none resize-none"
                                        placeholder={mode === 'whatsapp' ? "Write your announcement message here..." : "Type the update or warning message for the app users..."}
                                    />
                                </div>

                                {mode === 'whatsapp' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-gray-900 dark:text-white">Announcement Image</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-zinc-800 border-dashed rounded-2xl hover:border-zinc-400 dark:hover:border-zinc-900 transition-colors group cursor-pointer"
                                            onClick={() => document.getElementById('image-upload').click()}>
                                            <div className="space-y-1 text-center font-bold text-gray-900 dark:text-white">
                                                {form.imagePreview ? (
                                                    <div className="relative inline-block">
                                                        <img src={form.imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-md" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, image: null, imagePreview: null })); }}
                                                            className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 shadow-lg hover:bg-zinc-900 transition-colors"
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FaImage className="mx-auto h-12 w-12 text-gray-400 group-hover:text-zinc-700 transition-colors" />
                                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                            <span className="relative cursor-pointer rounded-md font-medium text-zinc-700 hover:text-zinc-700">Upload an image</span>
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
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
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
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.audience === opt.id ? 'border-zinc-900 bg-zinc-50/50 dark:bg-zinc-800/30' : 'border-gray-50 dark:border-zinc-800 hover:border-gray-200'}`}>
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
                                        { id: 'all', label: 'All Fit Clubs', desc: 'Broadcast to every fit club on platform' },
                                        { id: 'selected', label: 'Select Fit Clubs', desc: 'Target specific fit club locations' }
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.audience === opt.id ? 'border-zinc-900 bg-zinc-50/50 dark:bg-zinc-800/30' : 'border-gray-50 dark:border-zinc-800 hover:border-gray-200'}`}>
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
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {fetchingContacts ? (
                                        <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-full"></div><div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-3/4"></div></div>
                                    ) : filteredContacts.map(contact => (
                                        <div
                                            key={contact._id}
                                            onClick={() => toggleMember(contact._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedMembers.includes(contact._id) ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{contact.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{contact.phone}</p>
                                            </div>
                                            {selectedMembers.includes(contact._id) && <FaCheckCircle className="text-zinc-700" size={12} />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-950/50 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                    <span className="text-[10px] font-medium text-gray-500">{selectedMembers.length} selected</span>
                                    <button
                                        onClick={() => setSelectedMembers([])}
                                        className="text-[10px] font-medium text-zinc-700 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}

                        {form.audience === 'selected' && mode === 'internal' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-4 border-b border-gray-50 dark:border-zinc-800">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                        <input
                                            type="text"
                                            placeholder="Search fit clubs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {fetchingGyms ? (
                                        <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-full"></div><div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-3/4"></div></div>
                                    ) : gyms.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(gym => (
                                        <div
                                            key={gym._id}
                                            onClick={() => toggleGym(gym._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedGyms.includes(gym._id) ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{gym.name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{gym.gymCode}</p>
                                            </div>
                                            {selectedGyms.includes(gym._id) && <FaCheckCircle className="text-zinc-700" size={12} />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-950/50 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                    <span className="text-[10px] font-medium text-gray-500">{selectedGyms.length} selected</span>
                                    <button
                                        onClick={() => setSelectedGyms([])}
                                        className="text-[10px] font-medium text-zinc-700 hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/25`}
                        >
                            {loading ? (
                                <>
                                    <ButtonSpinner />
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

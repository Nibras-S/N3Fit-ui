import React, { useState, useEffect, useRef } from 'react';
import api from '../../../shared/services/api';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaMale, FaFemale, FaTimes, FaCamera, FaUpload, FaSyncAlt, FaCropAlt, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';

/**
 * Convert a stored UTC instant (e.g. "2026-04-07T18:30:00.000Z" = IST midnight
 * of Apr 8) to the YYYY-MM-DD calendar day in IST.
 */
const toISTDateInputValue = (input) => {
    if (!input) return '';
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

const EditMemberModal = ({ memberId, onClose, onUpdate }) => {
    const [formData, setFormData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState(null);
    const { hasFeature } = useAuth();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const navigate = useNavigate();

    // Photo state
    const [photoBlob, setPhotoBlob] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [tempCapture, setTempCapture] = useState(null);
    const [facingMode, setFacingMode] = useState('user');
    const modalVideoRef = useRef(null);
    const modalCanvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memberRes, settingsRes] = await Promise.all([
                    api.get(`/contacts/${memberId}`),
                    api.get(`/settings`)
                ]);
                const memberData = memberRes.data;
                setFormData(memberData);
                setOriginalData({ ...memberData });

                const settingsData = settingsRes.data?.data ?? settingsRes.data;
                setSettings(settingsData);
            } catch (error) {
                toast.error('Failed to load member data');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        if (memberId) fetchData();
    }, [memberId, onClose]);

    // Stop camera on unmount
    useEffect(() => {
        return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Camera helpers ──────────────────────────────────────────────────────────

    const startCamera = async (mode = facingMode) => {
        setIsCameraOpen(true);
        setTempCapture(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (modalVideoRef.current) modalVideoRef.current.srcObject = stream;
        } catch {
            toast.error('Could not access camera');
            setIsCameraOpen(false);
        }
    };

    const switchCamera = () => {
        const next = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(next);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        startCamera(next);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (modalVideoRef.current) modalVideoRef.current.srcObject = null;
        setIsCameraOpen(false);
        setTempCapture(null);
    };

    const captureFrame = () => {
        const video = modalVideoRef.current;
        const canvas = modalCanvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        setTempCapture(canvas.toDataURL('image/jpeg', 0.95));
    };

    const saveCroppedPhoto = () => {
        const canvas = modalCanvasRef.current;
        if (!canvas || !tempCapture) return;
        const size = Math.min(canvas.width, canvas.height);
        const startX = (canvas.width - size) / 2;
        const startY = (canvas.height - size) / 2;
        const crop = document.createElement('canvas');
        crop.width = 600;
        crop.height = 600;
        crop.getContext('2d').drawImage(canvas, startX, startY, size, size, 0, 0, 600, 600);
        crop.toBlob((blob) => {
            setPhotoBlob(blob);
            setPhotoPreview(URL.createObjectURL(blob));
            stopCamera();
            toast.success('Photo captured');
        }, 'image/jpeg', 0.8);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoBlob(file);
        setPhotoPreview(URL.createObjectURL(file));
        toast.success('Photo selected');
    };

    const clearPhoto = () => {
        setPhotoBlob(null);
        setPhotoPreview(null);
    };

    // ── Plan helpers ────────────────────────────────────────────────────────────

    const computePlanDays = (planName) => {
        if (!settings?.plans) return null;
        const plan = settings.plans.find(p => p.name === planName);
        if (!plan) return null;
        const type = plan.durationType || 'months';
        if (type === 'days') return plan.duration;
        if (type === 'weeks') return plan.duration * 7;
        return plan.duration * 30;
    };

    const getPlans = () => {
        if (settings?.plans && settings.plans.length > 0) {
            return settings.plans.filter(p => p.isActive).map(p => ({
                value: p.name, label: p.name,
            }));
        }
        return [
            { value: '1-Month',  label: '1 Month'  },
            { value: '2-Month',  label: '2 Months' },
            { value: '3-Month',  label: '3 Months' },
            { value: '6-Month',  label: '6 Months' },
            { value: '12-Month', label: '1 Year'   },
        ];
    };

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const planChanged   = formData.plan   !== originalData.plan;
            const amountChanged = formData.amount !== originalData.amount;
            const isRenewal     = planChanged || amountChanged;

            // Build payload — use FormData if a new photo was selected
            let payload;
            let headers = {};

            if (photoBlob) {
                payload = new FormData();
                payload.append('name',   formData.name);
                payload.append('phone',  formData.phone);
                payload.append('plan',   formData.plan);
                payload.append('gender', formData.gender);
                payload.append('date',   formData.date);
                payload.append('profileImage', photoBlob, 'profile.jpg');
                if (!isRenewal) {
                    payload.append('paymentStatus', formData.paymentStatus || 'Paid');
                    payload.append('paymentMethod', formData.paymentMethod || 'Cash');
                }
                if (isRenewal) {
                    payload.append('_isRenewal', 'true');
                    payload.append('amount',   formData.amount   ? String(parseInt(formData.amount))   : '0');
                    payload.append('discount',  formData.discount ? String(parseInt(formData.discount)) : '0');
                    const planDays = computePlanDays(formData.plan);
                    if (planDays) payload.append('planDays', String(planDays));
                }
                headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                payload = {
                    name:   formData.name,
                    phone:  formData.phone,
                    plan:   formData.plan,
                    gender: formData.gender,
                    date:   formData.date,
                    ...(isRenewal ? {} : {
                        paymentStatus: formData.paymentStatus,
                        paymentMethod: formData.paymentMethod,
                    }),
                };
                if (isRenewal) {
                    payload._isRenewal = true;
                    payload.amount   = formData.amount   ? parseInt(formData.amount)   : 0;
                    payload.discount = formData.discount ? parseInt(formData.discount) : 0;
                    const planDays = computePlanDays(formData.plan);
                    if (planDays) payload.planDays = planDays;
                }
            }

            const res = await api.put(`/contacts/${formData._id}`, payload, { headers });
            const responseData = res.data;

            if (isRenewal && responseData?.transaction) {
                toast.success('Membership renewed! Record payment below.');
                onClose();
                navigate(`/members/${formData._id}/card?txn=${responseData.transaction._id}`);
            } else {
                toast.success('Member updated successfully');
                if (onUpdate) onUpdate(payload);
                onClose();
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !formData) return null;

    const plans = getPlans();

    // Existing photo URL (from S3 presigned or legacy path)
    const existingPhotoUrl = formData.profileImage
        ? (formData.profileImage.startsWith('http') ? formData.profileImage : `${backendUrl}${formData.profileImage}`)
        : null;

    // What to show in the avatar: new preview > existing > initials
    const displayPhoto = photoPreview || existingPhotoUrl;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Member</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <FaTimes className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Profile Photo — only if feature enabled */}
                        {hasFeature('profilePhoto') && (
                            <div className="flex flex-col items-center gap-3 pb-1">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700 shadow-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                        {displayPhoto ? (
                                            <img src={displayPhoto} alt={formData.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-gray-400 dark:text-zinc-500">
                                                {formData.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {/* Remove overlay */}
                                    {displayPhoto && (
                                        <button
                                            type="button"
                                            onClick={clearPhoto}
                                            className="absolute -top-1 -right-1 w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-zinc-700 transition-colors"
                                            title="Remove photo"
                                        >
                                            <FaTimes size={9} />
                                        </button>
                                    )}
                                </div>

                                {/* Camera / Upload buttons */}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => startCamera()}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-colors"
                                    >
                                        <FaCamera size={11} /> Camera
                                    </button>
                                    <label className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 cursor-pointer transition-colors border border-gray-200 dark:border-zinc-700">
                                        <FaUpload size={11} /> Upload
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Phone Number</label>
                            <PhoneInput
                                country="in"
                                value={formData.phone}
                                onlyCountries={['in']}
                                onChange={(value) => setFormData({ ...formData, phone: value })}
                                inputClass="!w-full !py-2.5 !px-4 !h-auto !rounded-xl !bg-gray-50 dark:!bg-zinc-950 !border-gray-200 dark:!border-zinc-800 !text-gray-900 dark:!text-white !text-sm"
                                buttonClass="!bg-gray-50 dark:!bg-zinc-950 !border-gray-200 dark:!border-zinc-800 !rounded-l-xl"
                                dropdownClass="!bg-white dark:!bg-zinc-900 !text-gray-900 dark:!text-white"
                            />
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Membership Plan</label>
                            <select
                                value={formData.plan}
                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                            >
                                {plans.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Gender</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.gender === 'Male' ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
                                    <input type="radio" value="Male" checked={formData.gender === 'Male'} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="hidden" />
                                    <FaMale /> Male
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.gender === 'Female' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
                                    <input type="radio" value="Female" checked={formData.gender === 'Female'} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="hidden" />
                                    <FaFemale /> Female
                                </label>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Start Date</label>
                            <DatePicker
                                value={toISTDateInputValue(formData.date)}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="!bg-gray-50 dark:!bg-zinc-950 border-gray-200 dark:border-zinc-800"
                            />
                        </div>

                        {/* Payment */}
                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
                                    <select
                                        value={formData.paymentStatus || 'Paid'}
                                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Partial">Partial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Method</label>
                                    <select
                                        value={formData.paymentMethod || 'Cash'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Card</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full pl-8 px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white text-sm focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {submitting ? <ButtonSpinner /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Camera Modal */}
            <AnimatePresence>
                {isCameraOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                    >
                        <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Camera Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                    <FaCamera className="text-zinc-500" /> Photo Capture
                                </span>
                                <button onClick={stopCamera} className="p-2 text-white/50 hover:text-white transition-colors">
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Video / Preview */}
                            <div className="relative aspect-square bg-black overflow-hidden">
                                {!tempCapture ? (
                                    <>
                                        <video ref={modalVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                        {/* Guide frame */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-52 h-52 border-2 border-white/30 border-dashed rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                                        </div>
                                    </>
                                ) : (
                                    <img src={tempCapture} alt="Captured" className="w-full h-full object-cover" />
                                )}
                                <canvas ref={modalCanvasRef} className="hidden" />
                            </div>

                            {/* Controls */}
                            <div className="p-5 bg-zinc-950 flex items-center justify-center gap-3">
                                {!tempCapture ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={stopCamera}
                                            className="px-5 py-2.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={captureFrame}
                                            className="px-8 py-2.5 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full animate-pulse" />
                                            Snap
                                        </button>
                                        <button
                                            type="button"
                                            onClick={switchCamera}
                                            className="px-5 py-2.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                            title="Switch Camera"
                                        >
                                            <FaSyncAlt size={12} /> Flip
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setTempCapture(null)}
                                            className="px-5 py-2.5 bg-white/5 text-white/70 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                        >
                                            Retake
                                        </button>
                                        <button
                                            type="button"
                                            onClick={saveCroppedPhoto}
                                            className="px-8 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <FaCropAlt /> Use Photo
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default EditMemberModal;

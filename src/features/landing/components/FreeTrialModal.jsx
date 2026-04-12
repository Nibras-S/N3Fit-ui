import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMail, FiPhone, FiHome, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import api from '../../../shared/services/api';

const INITIAL = { name: '', email: '', phone: '', gymName: '', message: '' };

/**
 * FreeTrialModal
 *
 * Appears when "Start Free Trial" is clicked on the landing page.
 * Submits to POST /api/v1/enquiries (public, no auth).
 *
 * Props:
 *   isOpen  – boolean
 *   onClose – () => void
 */
export default function FreeTrialModal({ isOpen, onClose }) {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.gymName) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/enquiries', form);
            setSubmitted(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm(INITIAL);
        setSubmitted(false);
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top accent bar */}
                        <div className="h-1.5 bg-gradient-to-r from-zinc-700 to-zinc-400" />

                        {/* Close */}
                        <button
                            onClick={handleClose}
                            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="p-8">
                            {submitted ? (
                                // ── Success state ───────────────────────────
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheckCircle size={32} className="text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        You're on the list!
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Thanks, <strong>{form.name}</strong>! We've received your request for{' '}
                                        <strong>{form.gymName}</strong>. Our team will reach out within 24 hours to get you started.
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                // ── Form ─────────────────────────────────────
                                <>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            Start Your Free Trial
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                            14 days free · No credit card · Setup in minutes
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Name */}
                                        <div className="relative">
                                            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                name="name"
                                                type="text"
                                                placeholder="Your name *"
                                                value={form.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                name="email"
                                                type="email"
                                                placeholder="Email address *"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="relative">
                                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                name="phone"
                                                type="tel"
                                                placeholder="Phone number *"
                                                value={form.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Gym Name */}
                                        <div className="relative">
                                            <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                name="gymName"
                                                type="text"
                                                placeholder="Gym / fitness centre name *"
                                                value={form.gymName}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="relative">
                                            <FiMessageSquare className="absolute left-3.5 top-3.5 text-gray-400" />
                                            <textarea
                                                name="message"
                                                placeholder="Anything you'd like us to know? (optional)"
                                                value={form.message}
                                                onChange={handleChange}
                                                rows={3}
                                                maxLength={1000}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/30 focus:border-zinc-500 transition-all text-sm resize-none"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-zinc-900 text-sm text-center">{error}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-zinc-900/20"
                                        >
                                            {loading ? 'Submitting…' : 'Start Free Trial →'}
                                        </button>

                                        <p className="text-xs text-center text-gray-400">
                                            By submitting you agree to our terms. No spam, ever.
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaMobileAlt } from 'react-icons/fa';

/**
 * PWA Install Prompt — floating bottom-right modal with high z-index.
 * Replaces the old sidebar banner.
 */
export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(
        () => localStorage.getItem('pwa-dismissed') === 'true'
    );

    useEffect(() => {
        if (dismissed) return;
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Slight delay so it doesn't pop immediately on load
            setTimeout(() => setVisible(true), 1500);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [dismissed]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setVisible(false);
        }
    };

    const handleDismiss = () => {
        setVisible(false);
        setDismissed(true);
        localStorage.setItem('pwa-dismissed', 'true');
    };

    if (!visible || dismissed) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                animation: 'pwaSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            <style>{`
                @keyframes pwaSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
            `}</style>

            <div className="relative w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)' }}
            >
                {/* Decorative glow */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #f87171, transparent)' }} />

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Dismiss"
                >
                    <FaTimes size={11} />
                </button>

                {/* Content */}
                <div className="p-5 pr-8">
                    {/* Icon + title */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
                            <FaMobileAlt className="text-white" size={18} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Install Fit App</p>
                            <p className="text-red-200 text-[11px] mt-0.5">Faster &amp; works offline</p>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-1 mb-4">
                        {['Instant access from home screen', 'Works without internet', 'No browser chrome'].map(f => (
                            <li key={f} className="flex items-center gap-2 text-[11px] text-red-100">
                                <span className="w-1 h-1 rounded-full bg-red-300 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={handleInstall}
                        className="w-full py-2.5 rounded-xl bg-white text-zinc-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all shadow-lg shadow-red-900/30"
                    >
                        <FaDownload size={12} />
                        Install Now
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

/**
 * PWA Install Banner — shows "Install App" prompt when browser supports it.
 */
export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (!deferredPrompt || dismissed) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-2 mx-2 mb-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
            <FaDownload className="shrink-0 text-sm" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight">Install Fit</p>
                <p className="text-[10px] opacity-80 leading-tight">Get the app experience</p>
            </div>
            <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-white text-blue-600 text-[10px] font-bold rounded-lg shrink-0 hover:bg-blue-50 transition-colors"
            >
                Install
            </button>
            <button
                onClick={() => setDismissed(true)}
                className="p-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
            >
                <FaTimes className="text-xs" />
            </button>
        </div>
    );
}

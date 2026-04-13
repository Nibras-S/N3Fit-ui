import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/index.css';
import App from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';

// Interceptors are now in shared/services/api.js — import to register them
import './shared/services/api';

// Suppress the harmless "ResizeObserver loop completed" error from the dev
// overlay. The browser fires it when resize callbacks can't all finish in one
// frame — cosmetic only, no functional impact.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver loop')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  // Recharts 3.x logs a width(-1)/height(-1) warning on the first render of
  // every ResponsiveContainer because ResizeObserver hasn't measured yet.
  // The chart renders correctly on the next commit — suppress the noise.
  const _consoleWarn = console.warn;
  console.warn = (...args) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('of chart should be greater than 0')) {
      return;
    }
    _consoleWarn.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);

// Register service worker for PWA (production only — in dev it breaks
// code-split chunks after rebuilds by caching the HTML fallback as JS).
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.log('SW registration failed:', err));
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    }
  }
}

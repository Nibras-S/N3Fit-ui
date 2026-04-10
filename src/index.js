import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/index.css';
import App from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';

// Interceptors are now in shared/services/api.js — import to register them
import './shared/services/api';

// Suppress the harmless ResizeObserver "loop completed" error.
// This error is cosmetic — the browser fires it when resize callbacks can't
// all finish in one frame. It doesn't affect functionality.
if (typeof window !== 'undefined') {
  // Suppress from error overlay
  window.addEventListener('error', (e) => {
    if (e.message?.includes('ResizeObserver loop')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  // Patch ResizeObserver to debounce callbacks via rAF
  if (window.ResizeObserver) {
    const _ResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
      constructor(callback) {
        super((entries, observer) => {
          window.requestAnimationFrame(() => {
            callback(entries, observer);
          });
        });
      }
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.log('SW registration failed:', err));
  });
}

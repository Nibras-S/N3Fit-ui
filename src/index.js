import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/index.css';
import App from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';

// Interceptors are now in shared/services/api.js — import to register them
import './shared/services/api';

// Patch ResizeObserver to heavily debounce/RAF the callbacks and prevent the 'loop limit' UI overlay crash
if (typeof window !== 'undefined' && window.ResizeObserver) {
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

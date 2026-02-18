import React from 'react';
import ReactDOM from 'react-dom/client';
import './shared/styles/index.css';
import App from './app/App';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';

// Interceptors are now in shared/services/api.js — import to register them
import './shared/services/api';

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

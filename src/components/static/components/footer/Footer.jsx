import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer style={{ marginTop: '4rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '4rem', paddingBottom: '3rem' }}>
      <div className="section__container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem' }} className="footer-grid">
          <div style={{ textAlign: 'left' }}>
            <div className="logo" style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>
              <span className="logo-box">N3</span>
              <span className="logo-text">FIT</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '350px' }}>
              The all-in-one SaaS platform for modern gym management. Built for owners who want to grow without limits.
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Product</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }}>Features</span>
              <span style={{ cursor: 'pointer' }}>Pricing</span>
              <span style={{ cursor: 'pointer' }}>Success Stories</span>
              <span style={{ cursor: 'pointer' }}>Documentation</span>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Have Questions?</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }}>Call us: +1 (234) 567-890</span>
              <span style={{ cursor: 'pointer' }}>Email: support@n3fit.com</span>
              <span style={{ cursor: 'pointer' }}>Live Chat</span>
              <span style={{ cursor: 'pointer' }}>Help Center</span>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '1.5rem' }}>Social</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }}>Instagram</span>
              <span style={{ cursor: 'pointer' }}>Twitter / X</span>
              <span style={{ cursor: 'pointer' }}>LinkedIn</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p>© 2026 N3 FIT. All rights reserved.</p>
          <p>Created with precision and ✨ by the N3 FIT Team.</p>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import './Header.css';

export default function Header() {
  return (
    <div className="section__container" style={{ paddingTop: '12rem', paddingBottom: '8rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.3fr',
        gap: '6rem',
        alignItems: 'center',
        textAlign: 'left'
      }} className="hero-grid">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="header__content"
        >
          <div style={{ marginBottom: '2rem' }}>
            <span className="glass-master" style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '99px',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: 'var(--accent-indigo)',
              background: 'white',
              boxShadow: 'var(--shadow-floating)'
            }}>
              <span className="pulse" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', marginRight: '0.75rem' }}></span>
              SaaS Platform — Now Live
            </span>
          </div>

          <h1 className="section__header">
            Your Gym, <br />
            <span className="text-gradient">One Dashboard.</span>
          </h1>

          <p style={{
            fontSize: '1.4rem',
            color: 'var(--text-secondary)',
            marginBottom: '3rem',
            lineHeight: '1.5',
            maxWidth: '580px',
            letterSpacing: '-0.02em'
          }}>
            N3 Gym is the all-in-one management platform — members, payments, staff, reminders, and analytics in one powerful dashboard.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-landing" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => window.location.href = '/login'}>
              Start Free Trial <i className="ri-rocket-2-line"></i>
            </button>
            <button className="btn-landing btn-landing-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
              View Pricing
            </button>
          </div>

          <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '900' }}>500+</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Gyms</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '900' }}>50K+</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Members Managed</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '900' }}>99.9%</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Uptime</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative' }}
        >
          <div className="floating-card" style={{ height: '650px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <img
              src="/assets/dashboard_preview.png"
              alt="N3 Dashboard Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              className="pulse"
            />
          </div>

          {/* Floating Notification Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="glass-master"
            style={{
              position: 'absolute',
              top: '15%',
              right: '-5%',
              padding: '1.25rem',
              borderRadius: '1.5rem',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '220px'
            }}
          >
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>New Member Joined</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="glass-master"
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '-10%',
              padding: '1.25rem',
              borderRadius: '1.5rem',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '220px'
            }}
          >
            <div style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>₹5,000 Payment Received</span>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

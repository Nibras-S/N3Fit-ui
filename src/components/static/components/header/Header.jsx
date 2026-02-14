import React from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <div className="section__container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
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
            <motion.span
              className="glass-master"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '99px',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: 'var(--accent-indigo)',
                background: 'white',
                boxShadow: 'var(--shadow-floating)',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="pulse"
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  marginRight: '0.75rem'
                }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              SaaS Platform — Now Live
            </motion.span>
          </div>

          <motion.h1
            className="section__header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your Gym, <br />
            <span className="text-gradient">One Dashboard.</span>
          </motion.h1>

          <motion.p
            style={{
              fontSize: '1.4rem',
              color: 'var(--text-secondary)',
              marginBottom: '3rem',
              lineHeight: '1.5',
              maxWidth: '580px',
              letterSpacing: '-0.02em'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            N3 FIT is the all-in-one management platform — members, payments, staff, reminders, and analytics in one powerful dashboard.
          </motion.p>

          <motion.div
            style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              className="btn-landing"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
              onClick={() => window.location.href = '/login'}
            >
              Start Free Trial <i className="ri-rocket-2-line"></i>
            </button>
            <button
              className="btn-landing btn-landing-outline"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Pricing
            </button>
          </motion.div>

          <motion.div
            style={{ marginTop: '4rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <motion.span
                style={{ fontSize: '1.75rem', fontWeight: '900' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
              >
                500+
              </motion.span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Gyms</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <motion.span
                style={{ fontSize: '1.75rem', fontWeight: '900' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
              >
                50K+
              </motion.span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Members Managed</span>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#eee' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <motion.span
                style={{ fontSize: '1.75rem', fontWeight: '900' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
              >
                99.9%
              </motion.span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Uptime</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative' }}
        >
          <div
            className="floating-card"
            style={{
              height: '650px',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              position: 'relative'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -1
              }}
            />

            <motion.img
              src="https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=2070"
              alt="Gym Management"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.2))',
                borderRadius: '2rem'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          </div>

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
              maxWidth: '220px',
              zIndex: 10
            }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.div
              style={{
                width: '12px',
                height: '12px',
                background: '#10b981',
                borderRadius: '50%'
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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
              maxWidth: '220px',
              zIndex: 10
            }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.div
              style={{
                width: '12px',
                height: '12px',
                background: '#6366f1',
                borderRadius: '50%'
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>₹5,000 Payment Received</span>
          </motion.div>
        </motion.div>

      </div>
    </div>
  )
}

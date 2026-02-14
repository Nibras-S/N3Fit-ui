import React from 'react';
import { motion } from 'framer-motion';

export default function Program() {
  return (
    <section className="section__container" id="features" style={{ paddingBottom: '6rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="section__header">Built for <span className="text-gradient">Infinite Scale.</span></h2>
        <p className="section__subheader">
          A modular intelligence platform designed to grow with your ambition.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: 'minmax(200px, auto)',
        gap: '2.5rem'
      }}>

        {/* Large Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="floating-card"
          style={{ gridColumn: 'span 8', padding: '4rem', textAlign: 'left', background: 'var(--secondary-bg)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--accent-indigo)', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Intelligence</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '1rem 0', letterSpacing: '-0.04em' }}>The Command Hub.</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Complete visibility over members, payments, and staff in a single, high-performance interface. No lag, just data.
              </p>
              <button className="btn-landing btn-landing--sm" style={{ background: 'var(--accent-indigo)' }}>Explore Hub</button>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow-floating)' }}>
              <img src="/assets/dashboard_preview.png" alt="Hub" style={{ width: '100%', borderRadius: '1rem' }} />
            </div>
          </div>
        </motion.div>

        {/* Small Feature 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="floating-card"
          style={{ gridColumn: 'span 4', padding: '3.5rem', textAlign: 'left' }}
        >
          <div style={{ width: '50px', height: '50px', background: '#10b98115', color: '#10b981', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>
            <i className="ri-smartphone-line"></i>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Branded App.</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            A world-class experience for your members to book, track, and pay.
          </p>
        </motion.div>

        {/* Small Feature 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="floating-card"
          style={{ gridColumn: 'span 4', padding: '3.5rem', textAlign: 'left' }}
        >
          <div style={{ width: '50px', height: '50px', background: '#f59e0b15', color: '#f59e0b', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '2rem' }}>
            <i className="ri-pulse-line"></i>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Pulse Entry.</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Seamless biometric access that works even when your internet doesn't.
          </p>
        </motion.div>

        {/* Large Feature 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="floating-card"
          style={{ gridColumn: 'span 8', padding: '4rem', textAlign: 'left', background: 'var(--text-main)', color: 'white' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', alignItems: 'center' }}>
            <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <img src="https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=2070" alt="Scaling" style={{ width: '100%' }} />
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth Engine</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '1rem 0', letterSpacing: '-0.04em' }}>Scale Without Limits.</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Manage multi-location networks with centralized finance and member roaming capabilities.
              </p>
              <button className="btn-landing" style={{ background: 'white', color: 'black', boxShadow: 'none' }}>Scale Now</button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

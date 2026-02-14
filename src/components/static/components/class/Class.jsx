import React from 'react';
import { motion } from 'framer-motion';

export default function Class() {
  return (
    <div
      className="section__container"
      id="benefits"
      style={{
        background: 'var(--secondary-bg)',
        borderRadius: '3rem',
        padding: '3rem 4rem',
        margin: '2rem auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} className="class-grid">

        <motion.div
          style={{ position: 'relative' }}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="image-mask" style={{ height: '500px', transform: 'rotate(-2deg)' }}>
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=2070"
              alt="Gym Management Impact"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <motion.div
            className="floating-card"
            style={{
              position: 'absolute',
              top: '10%',
              right: '-10%',
              padding: '2rem',
              maxWidth: '250px',
              background: 'white'
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <motion.h4
              style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-indigo)' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              20hr+
            </motion.h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Admin time saved per week by our average partner studio.
            </p>
          </motion.div>

          <motion.div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '-5%',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(249, 115, 22, 0.2))',
              borderRadius: '25px',
              transform: 'rotate(-15deg)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            animate={{ rotate: [-15, -25, -15] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section__header" style={{ textAlign: 'left' }}>
            The Human Impact <br />of <span className="text-gradient">Smart Automation.</span>
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            marginBottom: '3rem'
          }}>
            We believe that technology should serve people, not the other way around. By automating the mechanical tasks, we free up your team to do what they do best.
          </p>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {[
              {
                icon: 'ri-check-line',
                title: 'Reclaim Your Vision',
                desc: 'Stop being your own accountant and start being a gym owner again.',
                color: 'var(--accent-indigo)'
              },
              {
                icon: 'ri-check-line',
                title: 'Empower Your Trainers',
                desc: 'Give staff the tools to provide personalized attention to every member.',
                color: '#10b981'
              },
              {
                icon: 'ri-check-line',
                title: 'Scale with Confidence',
                desc: 'Built for growth, from single studio to multi-branch franchise.',
                color: '#f59e0b'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
              >
                <motion.div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: item.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0
                  }}
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <i className={item.icon}></i>
                </motion.div>
                <div>
                  <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

import React from 'react';
import { motion } from 'framer-motion';

export default function Class() {
  return (
    <div className="section__container" id="benefits" style={{ background: 'var(--secondary-bg)', borderRadius: '3rem', padding: '6rem 4rem', margin: '4rem auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

        <div style={{ position: 'relative' }}>
          <div className="image-mask" style={{ height: '500px', transform: 'rotate(-2deg)' }}>
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=2070"
              alt="Gym Management Impact"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="floating-card" style={{ position: 'absolute', top: '10%', right: '-10%', padding: '2rem', maxWidth: '250px' }}>
            <h4 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-indigo)' }}>20hr+</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin time saved per week by our average partner studio.</p>
          </div>
        </div>

        <div>
          <h2 className="section__header" style={{ textAlign: 'left' }}>The Human Impact <br />of <span className="text-gradient">Smart Automation.</span></h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '3rem' }}>
            We believe that technology should serve people, not the other way around. By automating the mechanical tasks, we free up your team to do what they do best.
          </p>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-indigo)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <i className="ri-check-line"></i>
              </div>
              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Reclaim Your Vision</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Stop being your own accountant and start being a gym owner again.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-indigo)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <i className="ri-check-line"></i>
              </div>
              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Empower Your Trainers</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Give staff the tools to provide personalized attention to every member.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-indigo)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <i className="ri-check-line"></i>
              </div>
              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Scale with Confidence</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Built for growth, from single studio to multi-branch franchise.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

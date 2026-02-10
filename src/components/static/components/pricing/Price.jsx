import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Price() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      price: '₹499',
      period: '/mo',
      description: 'Perfect for small & boutique gyms just getting started.',
      features: [
        'Up to 100 Members',
        '2 Staff Accounts',
        'Member Management',
        'Payment Tracking',
        'Invoice Generation',
        'Email Support',
      ],
      cta: 'Start Basic',
      highlight: false,
    },
    {
      name: 'Professional',
      price: '₹999',
      period: '/mo',
      description: 'Complete automation for growing fitness studios.',
      features: [
        'Up to 500 Members',
        '5 Staff Accounts',
        'Everything in Basic',
        'WhatsApp Reminders',
        'Advanced Reports',
        'Priority Support',
      ],
      cta: 'Start Pro',
      highlight: true,
      badge: 'MOST POPULAR',
    },
    {
      name: 'Enterprise',
      price: '₹1,999',
      period: '/mo',
      description: 'Full power for large gyms & multi-location chains.',
      features: [
        'Up to 5,000 Members',
        '20 Staff Accounts',
        'Everything in Pro',
        'Custom Branding',
        'Multi-Location Admin',
        '24/7 Dedicated Support',
      ],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div className="section__container" id="pricing" style={{ paddingBottom: '12rem' }}>

      <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
        <h2 className="section__header">
          Simple, <span className="text-gradient">Transparent</span> Pricing.
        </h2>
        <p className="section__subheader">
          No hidden fees. No surprises. Pick the plan that fits your gym and scale as you grow.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'center' }}>

        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: plan.highlight ? -15 : -10 }}
            className="floating-card"
            style={{
              padding: plan.highlight ? '5rem 3.5rem' : '4rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              background: plan.highlight ? 'var(--text-main)' : 'white',
              color: plan.highlight ? 'white' : 'inherit',
              transform: plan.highlight ? 'scale(1.05)' : 'none',
              zIndex: plan.highlight ? 10 : 1,
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'var(--accent-indigo)',
                color: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.05em',
              }}>
                {plan.badge}
              </div>
            )}

            <span style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: plan.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}>
              {plan.name}
            </span>

            <div style={{
              fontSize: '3.5rem',
              fontWeight: '900',
              color: plan.highlight ? 'white' : 'var(--text-main)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.05em',
            }}>
              {plan.price}
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                color: plan.highlight ? 'rgba(255,255,255,0.4)' : 'var(--text-muted)',
              }}>
                {plan.period}
              </span>
            </div>

            <p style={{
              color: plan.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)',
              marginBottom: '3rem',
              fontSize: '1.1rem',
            }}>
              {plan.description}
            </p>

            <div style={{
              borderTop: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.1)' : '#f0f0f0'}`,
              paddingTop: '3rem',
              flex: 1,
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.25rem' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <i className="ri-check-line" style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate('/login')}
              className={plan.highlight ? 'btn-landing' : 'btn-landing btn-landing-outline'}
              style={{
                marginTop: '4rem',
                width: '100%',
                borderRadius: '1rem',
                ...(plan.highlight ? { background: 'white', color: 'black', boxShadow: 'none' } : {}),
              }}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        marginTop: '10rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        borderRadius: '2rem',
        padding: '6rem 4rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative Glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '900',
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
          }}>
            Ready to Transform Your Gym?
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '550px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
          }}>
            Join 500+ gyms that trust N3 for member management, payments, and growth analytics.
          </p>
          <button
            className="btn-landing"
            onClick={() => navigate('/login')}
            style={{
              padding: '1.1rem 3rem',
              fontSize: '1.1rem',
              background: 'white',
              color: '#0a0a0a',
              boxShadow: '0 0 40px rgba(255,255,255,0.1)',
            }}
          >
            Get Started Free <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '8rem', borderTop: '1px solid #f3f4f6', paddingTop: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '5rem' }} className="footer-grid">
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '900', fontSize: '1.75rem', marginBottom: '1.5rem', letterSpacing: '-0.06em' }}>
              <span style={{ background: '#0a0a0a', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', marginRight: '0.5rem' }}>N3</span>
              GYM
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '350px', fontSize: '1rem' }}>
              The all-in-one SaaS platform for modern gym management. Built for owners who want to grow.
            </p>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1.5rem' }}>Product</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ cursor: 'pointer' }}>Dashboard</span>
              <span style={{ cursor: 'pointer' }}>Member Management</span>
              <span style={{ cursor: 'pointer' }}>Payment Tracking</span>
              <span style={{ cursor: 'pointer' }}>WhatsApp Reminders</span>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1.5rem' }}>Company</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ cursor: 'pointer' }}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Pricing</span>
              <span style={{ cursor: 'pointer' }}>Contact</span>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '1.5rem' }}>Connect</h4>
            <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ cursor: 'pointer' }}>Instagram</span>
              <span style={{ cursor: 'pointer' }}>Twitter / X</span>
              <span style={{ cursor: 'pointer' }}>LinkedIn</span>
              <span style={{ cursor: 'pointer' }}>YouTube</span>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '5rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p>© 2025 N3 Technology Group. All rights reserved.</p>
          <p>Made with ❤️ for Gym Owners.</p>
        </div>
      </footer>

    </div>
  )
}

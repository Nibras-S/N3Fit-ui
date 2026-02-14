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
    <div className="section__container" id="pricing" style={{ paddingBottom: '6rem' }}>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
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

      {/* CTA Section and Footer removed to be handled by PageHome or dedicated Footer component */}
    </div>
  )
}

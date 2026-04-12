import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const plans = [
  {
    name: 'Basic',
    price: '5,999',
    tagline: 'Perfect for small gyms',
    features: [
      'Up to 100 Members',
      'Basic Dashboard',
      'Attendance Tracking',
      'Payment Reminders',
      'Email Support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '7,999',
    tagline: 'Most popular for growing gyms',
    features: [
      'Unlimited Members',
      'Advanced Analytics',
      'WhatsApp Integration',
      'Staff Management',
      'Expense Tracking',
      'Invoice Generation',
      'Priority Support',
    ],
    cta: 'Start Pro Plan',
    popular: true,
  },
  {
    name: 'Premium',
    price: '30,000',
    tagline: 'For multi-branch chains',
    features: [
      'Multi-Branch Support',
      'White-label Dashboard',
      'Dedicated Account Manager',
      'Custom Reports & API',
      '24/7 Priority Support',
      'Data Migration Support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 lg:py-28"
      style={{ background: 'var(--landing-bg-alt)' }}
    >
      <div className="landing-container">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="landing-section-label">Pricing</span>
          <h2 className="landing-heading">
            Simple, Transparent{' '}
            <span className="landing-heading-gradient">Pricing</span>
          </h2>
          <p className="landing-subheading mx-auto text-center">
            Choose the plan that fits your gym. No hidden fees. Cancel anytime.
            All plans billed yearly.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: plan.popular
                  ? 'var(--landing-primary)'
                  : 'var(--landing-surface)',
                border: plan.popular
                  ? 'none'
                  : '1px solid var(--landing-border)',
                boxShadow: plan.popular
                  ? '0 8px 30px rgba(0, 0, 0, 0.35)'
                  : 'var(--landing-shadow-sm)',
                color: plan.popular ? '#ffffff' : 'var(--landing-text)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-zinc-900">
                  Most Popular
                </div>
              )}

              <h3
                className="text-xl font-bold mb-1"
                style={{ color: plan.popular ? '#fff' : 'var(--landing-text)' }}
              >
                {plan.name}
              </h3>
              <p
                className="text-sm mb-5"
                style={{
                  color: plan.popular
                    ? 'rgba(255,255,255,0.75)'
                    : 'var(--landing-text-muted)',
                }}
              >
                {plan.tagline}
              </p>

              <div className="flex items-baseline mb-6">
                <span
                  className="text-4xl font-extrabold"
                  style={{
                    color: plan.popular ? '#fff' : 'var(--landing-text)',
                  }}
                >
                  ₹{plan.price}
                </span>
                <span
                  className="ml-2 text-sm"
                  style={{
                    color: plan.popular
                      ? 'rgba(255,255,255,0.6)'
                      : 'var(--landing-text-light)',
                  }}
                >
                  /year
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <FiCheck
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{
                        color: plan.popular
                          ? 'rgba(255,255,255,0.9)'
                          : 'var(--landing-primary)',
                      }}
                    />
                    <span
                      style={{
                        color: plan.popular
                          ? 'rgba(255,255,255,0.9)'
                          : 'var(--landing-text-secondary)',
                      }}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={plan.popular ? 'landing-btn-primary landing-btn-full' : 'landing-btn-outline'}
                style={plan.popular ? { padding: '0.75rem 1.5rem', background: '#ffffff', color: 'var(--landing-primary)' } : {}}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

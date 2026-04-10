import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    q: 'Is N3 Fit cloud-based?',
    a: 'Yes! N3 Fit is 100% cloud-based. Access your gym\'s data from any device — laptop, tablet, or phone — securely from anywhere.',
  },
  {
    q: 'Does N3 Fit support multi-branch gyms?',
    a: 'Absolutely! Our Premium plan supports unlimited branches. Manage all locations from a single Super Admin dashboard with per-branch analytics.',
  },
  {
    q: 'Can I migrate data from Excel or another software?',
    a: 'Yes, we offer free CSV/Excel data import. Upload your member list and N3 Fit auto-maps the fields. Our team assists with complex migrations.',
  },
  {
    q: 'How does the WhatsApp integration work?',
    a: 'N3 Fit connects to the WhatsApp Cloud API to send automated renewal reminders, bulk announcements, and personalized birthday wishes — all from your dashboard.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, we offer a 14-day free trial on all plans with full access to features. No credit card required. Cancel anytime.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-20 lg:py-28"
      style={{ background: 'var(--landing-bg-alt)' }}
    >
      <div className="landing-container max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="landing-section-label">FAQ</span>
          <h2 className="landing-heading">
            Got <span className="landing-heading-gradient">Questions?</span>
          </h2>
          <p className="landing-subheading mx-auto text-center">
            Everything you need to know about N3 Fit.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: isActive
                    ? 'var(--landing-primary-50)'
                    : 'var(--landing-surface)',
                  border: isActive
                    ? '1px solid var(--landing-primary-200)'
                    : '1px solid var(--landing-border)',
                }}
              >
                <button
                  className="w-full text-left p-5 flex justify-between items-center gap-4"
                  onClick={() => toggle(index)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit' }}
                >
                  <span
                    className="font-semibold text-[15px]"
                    style={{
                      color: isActive
                        ? 'var(--landing-primary)'
                        : 'var(--landing-text)',
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isActive
                        ? 'var(--landing-primary)'
                        : 'var(--landing-bg-alt)',
                      color: isActive ? '#ffffff' : 'var(--landing-text-muted)',
                      transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <FiChevronDown size={16} />
                  </span>
                </button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: 'var(--landing-text-muted)' }}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

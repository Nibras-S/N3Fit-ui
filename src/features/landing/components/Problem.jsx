import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';

const oldWay = [
  'Registers, Excel sheets & paper receipts',
  'Manual follow-ups that get forgotten',
  'Inaccurate billing and missed payments',
  'Zero visibility into revenue or retention',
];

const newWay = [
  'Digital profiles with complete member history',
  'Automated WhatsApp reminders & alerts',
  '100% accurate invoices generated instantly',
  'Live revenue dashboard on any device',
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Problem() {
  return (
    <section
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
          <span className="landing-section-label">Why N3 Fit</span>
          <h2
            className="landing-heading"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
          >
            The cost of chaos.
          </h2>
          <p className="landing-subheading mx-auto text-center">
            Every lost receipt, forgotten follow-up, and manual billing error is
            actively leaking revenue. Stop managing paper and start managing
            growth.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto relative">
          {/* VS badge — center */}
          <div
            className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full items-center justify-center text-xs font-bold"
            style={{
              background: 'var(--landing-bg-alt)',
              border: '2px solid var(--landing-border)',
              color: 'var(--landing-text-muted)',
            }}
          >
            vs
          </div>

          {/* The Old Way */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-8"
            style={{
              background: 'var(--landing-surface)',
              border: '1px solid var(--landing-border)',
            }}
          >
            <h3
              className="text-lg font-bold mb-6"
              style={{ color: 'var(--landing-text-light)' }}
            >
              The Old Way
            </h3>
            <ul className="space-y-4">
              {oldWay.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'var(--landing-bg-section)',
                      color: 'var(--landing-text-light)',
                    }}
                  >
                    <FiX size={12} />
                  </div>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--landing-text-muted)' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* N3 Fit Way */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl p-8"
            style={{
              background: 'var(--landing-surface)',
              border: '1px solid var(--landing-primary-200)',
            }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--landing-primary)' }}
              />
              <span style={{ color: 'var(--landing-text)' }}>N3 Fit</span>
            </h3>
            <ul className="space-y-4">
              {newWay.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'var(--landing-primary-50)',
                      color: 'var(--landing-primary)',
                    }}
                  >
                    <FiCheck size={12} />
                  </div>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--landing-text-secondary)' }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

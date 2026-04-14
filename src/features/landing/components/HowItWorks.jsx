import React from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUserPlus, FiZap } from 'react-icons/fi';

const steps = [
  {
    num: '01',
    icon: FiSettings,
    title: 'Set Up Your Gym',
    desc: 'Configure your gym profile, membership plans, and staff roles in under 10 minutes.',
  },
  {
    num: '02',
    icon: FiUserPlus,
    title: 'Add Members',
    desc: 'Import existing members via Excel or register new ones with a quick digital form.',
  },
  {
    num: '03',
    icon: FiZap,
    title: 'Automate & Grow',
    desc: 'Let N3FitBook handle billing, reminders, and analytics while you focus on scaling.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
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
          <span className="landing-section-label">Getting Started</span>
          <h2 className="landing-heading">
            Go Live in{' '}
            <span className="landing-heading-gradient">3 Simple Steps</span>
          </h2>
          <p className="landing-subheading mx-auto text-center">
            No credit card. No complex setup. Be running in minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden md:block absolute top-14 left-[20%] right-[20%] h-[2px]"
            style={{ background: 'var(--landing-border)' }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="text-center relative z-10"
              >
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-200 hover:scale-105"
                  style={{
                    background: 'var(--landing-primary-50)',
                    border: '1px solid var(--landing-primary-100)',
                  }}
                >
                  <Icon
                    size={28}
                    className="md:w-8 md:h-8"
                    style={{ color: 'var(--landing-primary)' }}
                  />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: 'var(--landing-primary)', opacity: 0.7 }}
                >
                  Step {step.num}
                </span>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--landing-text)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed px-2"
                  style={{ color: 'var(--landing-text-muted)' }}
                >
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

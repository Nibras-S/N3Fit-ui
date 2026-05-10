import React from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiCreditCard,
  FiMessageCircle,
  FiBarChart2,
  FiDollarSign,
  FiZap,
} from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ─── Mini visual components for bento cards ─── */

function MemberListVisual() {
  const members = [
    { name: 'Rahul K.', plan: 'Pro', status: 'active' },
    { name: 'Priya S.', plan: 'Basic', status: 'active' },
    { name: 'Ahmed J.', plan: 'Pro', status: 'expiring' },
  ];
  return (
    <div className="mt-4 space-y-2">
      {members.map((m, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2.5 rounded-lg"
          style={{ background: 'var(--landing-bg-alt)', border: '1px solid var(--landing-border-light)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: i === 0 ? 'var(--landing-primary)' : i === 1 ? '#7c3aed' : '#059669' }}
          >
            {m.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--landing-text)' }}>{m.name}</div>
            <div className="text-xs" style={{ color: 'var(--landing-text-muted)' }}>{m.plan} Plan</div>
          </div>
          <span
            className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
            style={{
              background: m.status === 'active' ? '#d1fae5' : '#fef3c7',
              color: m.status === 'active' ? '#059669' : '#d97706',
            }}
          >
            {m.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function WhatsAppVisual() {
  return (
    <div className="mt-4 flex flex-col gap-2.5 max-w-[240px]">
      <div
        className="self-start px-3.5 py-2.5 rounded-xl rounded-tl-sm text-xs leading-relaxed"
        style={{ background: 'var(--landing-text)', color: '#fff', maxWidth: '200px' }}
      >
        Hi Rahul! Your membership expires in 3 days. Renew now to continue. 💪
      </div>
      <div
        className="self-end px-3.5 py-2 rounded-xl rounded-br-sm text-xs"
        style={{ background: '#dcf8c6', color: '#1a1a1a', maxWidth: '140px' }}
      >
        Thanks, renewing now!
      </div>
    </div>
  );
}

function RevenueChartVisual() {
  const bars = [35, 50, 40, 65, 55, 75, 60, 80, 70, 90, 85, 95];
  return (
    <div className="mt-4 flex items-end gap-1.5 h-[80px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${h}%`,
            background: i >= 9
              ? 'var(--landing-primary)'
              : 'var(--landing-primary-100)',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

function BillingVisual() {
  return (
    <div className="mt-4 space-y-2.5">
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{ background: 'var(--landing-bg-alt)', border: '1px solid var(--landing-border-light)' }}
      >
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--landing-text)' }}>INV-2024-0042</div>
          <div className="text-[10px]" style={{ color: 'var(--landing-text-muted)' }}>Rahul K. &bull; Pro Plan</div>
        </div>
        <div className="text-sm font-bold" style={{ color: '#059669' }}>₹2,999</div>
      </div>
      <div
        className="flex items-center justify-between p-2.5 rounded-lg"
        style={{ background: 'var(--landing-bg-alt)', border: '1px solid var(--landing-border-light)' }}
      >
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--landing-text)' }}>INV-2024-0043</div>
          <div className="text-[10px]" style={{ color: 'var(--landing-text-muted)' }}>Priya S. &bull; Basic Plan</div>
        </div>
        <div className="text-sm font-bold" style={{ color: '#059669' }}>₹1,499</div>
      </div>
    </div>
  );
}

/* ─── Bento Grid ─── */

const bentoItems = [
  {
    icon: FiUsers,
    title: 'Complete Member Profiles',
    desc: 'Track every member\'s history, attendance, payments, and health stats in one unified view.',
    visual: MemberListVisual,
    span: 'col-span-1 md:col-span-2',
  },
  {
    icon: FiMessageCircle,
    title: 'WhatsApp Automation',
    desc: 'Send renewal reminders, birthday wishes, and announcements automatically.',
    visual: WhatsAppVisual,
    span: 'col-span-1',
  },
  {
    icon: FiDollarSign,
    title: 'Smart Invoicing',
    desc: 'Never miss a payment. Generate GST-compliant invoices in one click.',
    visual: BillingVisual,
    span: 'col-span-1',
  },
  {
    icon: FiBarChart2,
    title: 'Revenue Analytics',
    desc: 'Track profitability in real-time. Revenue, retention, and growth — all at a glance.',
    visual: RevenueChartVisual,
    span: 'col-span-1 md:col-span-2',
    dark: true,
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-20 lg:py-28"
      style={{ background: 'var(--landing-bg)' }}
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
          <span className="landing-section-label">Features</span>
          <h2
            className="landing-heading"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
          >
            Everything you need.
            <br />
            <span className="landing-heading-gradient">Nothing you don't.</span>
          </h2>
          <p className="landing-subheading mx-auto text-center">
            Powerful features mapped to a clean, intuitive interface. Built for
            gym owners, not IT experts.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {bentoItems.map((item, index) => {
            const Icon = item.icon;
            const Visual = item.visual;
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`${item.span} rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
                style={{
                  background: item.dark
                    ? 'var(--landing-text)'
                    : 'var(--landing-surface)',
                  border: item.dark
                    ? 'none'
                    : '1px solid var(--landing-border)',
                  boxShadow: item.dark ? 'none' : 'var(--landing-shadow-sm)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: item.dark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'var(--landing-primary-50)',
                    color: item.dark
                      ? 'var(--landing-primary-light)'
                      : 'var(--landing-primary)',
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  className="text-lg font-bold mb-1.5"
                  style={{
                    color: item.dark ? '#ffffff' : 'var(--landing-text)',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: item.dark
                      ? 'rgba(255,255,255,0.6)'
                      : 'var(--landing-text-muted)',
                  }}
                >
                  {item.desc}
                </p>
                <Visual />
              </motion.div>
            );
          })}
        </div>

        {/* Extra feature pills */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {[
            { icon: FiCreditCard, label: 'Multi-Payment Modes' },
            { icon: FiZap, label: 'Staff Management' },
            { icon: FiUsers, label: 'Multi-Branch Ready' },
          ].map((pill, i) => {
            const PIcon = pill.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{
                  background: 'var(--landing-bg-alt)',
                  border: '1px solid var(--landing-border)',
                  color: 'var(--landing-text-secondary)',
                }}
              >
                <PIcon size={16} style={{ color: 'var(--landing-primary)' }} />
                {pill.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

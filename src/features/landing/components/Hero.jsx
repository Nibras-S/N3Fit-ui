import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

/* ─── Animated Counter ─── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Dashboard Mockup ─── */
function DashboardMockup() {
  return (
    <div className="mockup-browser">
      {/* Browser chrome */}
      <div className="mockup-chrome">
        <div className="mockup-dots">
          <span style={{ background: '#71717a' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <div className="mockup-url">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          n3fitbook.in/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div className="mockup-body">
        {/* Mini sidebar */}
        <div className="mockup-sidebar">
          <div className="mockup-sidebar-item" style={{ background: '#18181b' }} />
          <div className="mockup-sidebar-item" />
          <div className="mockup-sidebar-item" />
          <div className="mockup-sidebar-item" />
          <div className="mockup-sidebar-item" />
        </div>

        {/* Main area */}
        <div className="mockup-main">
          {/* Top bar */}
          <div className="mockup-topbar">
            <div className="mockup-line" style={{ width: '120px', height: '14px' }} />
            <div className="mockup-avatar" />
          </div>

          {/* Stat cards */}
          <div className="mockup-stats">
            <div className="mockup-stat-card">
              <div className="mockup-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
              </div>
              <div>
                <div className="mockup-stat-label">TODAY'S REVENUE</div>
                <div className="mockup-stat-value">₹12,450</div>
              </div>
            </div>
            <div className="mockup-stat-card">
              <div className="mockup-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="mockup-stat-label">ACTIVE MEMBERS</div>
                <div className="mockup-stat-value">248</div>
              </div>
            </div>
          </div>

          {/* Content lines */}
          <div className="mockup-content-lines">
            <div className="mockup-line" style={{ width: '100%', height: '10px' }} />
            <div className="mockup-line" style={{ width: '80%', height: '10px' }} />
            <div className="mockup-line" style={{ width: '60%', height: '10px' }} />
          </div>

          {/* Floating notification */}
          <motion.div
            className="mockup-notification"
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mockup-notif-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className="mockup-notif-title">Payment Received</div>
              <div className="mockup-notif-detail">Rahul K. &bull; ₹2,999</div>
            </div>
            <div className="mockup-notif-bar" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero({ onOpenTrial }) {

  const stats = [
    { value: 50, suffix: '+', label: 'Active Clubs' },
    { value: 500, suffix: '+', label: 'Members Managed' },
    { value: 99.9, suffix: '%', label: 'Uptime SLA' },
    { value: 4.9, suffix: '/5', label: 'User Rating' },
  ];

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--landing-bg)' }}
    >
      {/* Decorative gradient blobs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[120px] pointer-events-none"
        style={{ background: 'var(--landing-primary-200)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.1] blur-[100px] pointer-events-none"
        style={{ background: 'var(--landing-primary-100)' }}
      />

      <div className="landing-container relative z-10 pt-36 pb-16 lg:pt-44 lg:pb-24">
        {/* Hero split layout */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
              className="landing-heading mb-5"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)' }}
            >
              The complete
              <br />
              software for{' '}
              <span className="landing-heading-gradient">gym management.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.1 }}
              className="landing-subheading mb-8 mx-auto lg:mx-0"
              style={{ maxWidth: '520px', fontSize: '1.0625rem' }}
            >
              Stop losing revenue to fragmented tools. Manage members, billing,
              staff, and daily expenses from one perfectly engineered interface.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-6"
            >
              <button
                className="landing-btn-primary landing-btn-lg"
                onClick={onOpenTrial}
              >
                Get Started Now
                <FiArrowRight size={18} />
              </button>
              <button
                className="landing-btn-secondary landing-btn-lg"
                onClick={() => {
                  const el = document.querySelector('#features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See Features
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-5 justify-center lg:justify-start"
            >
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--landing-text-muted)' }}>
                <FiCheck size={16} style={{ color: '#059669' }} />
                No credit card
              </span>
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--landing-text-muted)' }}>
                <FiCheck size={16} style={{ color: '#059669' }} />
                14-day free trial
              </span>
            </motion.div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div
            className="flex-1 w-full max-w-[560px] lg:max-w-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto pt-10 border-t"
          style={{ borderColor: 'var(--landing-border)' }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl md:text-3xl font-extrabold mb-1"
                style={{ color: 'var(--landing-text)' }}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: 'var(--landing-text-muted)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

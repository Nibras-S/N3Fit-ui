import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stats = [
  { value: '3+', label: 'Years Building' },
  { value: '50+', label: 'Projects Shipped' },
  { value: '98%', label: 'Client Satisfaction' },
];

export default function About() {
  return (
    <section
      id="about"
      className="py-20 lg:py-28"
      style={{ background: 'var(--landing-bg-alt)' }}
    >
      <div className="landing-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Left: copy */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="landing-section-label">About</span>
            <h2 className="landing-heading">
              Built by{' '}
              <span className="landing-heading-gradient">N3 Global Tech</span>
            </h2>
            <span className="landing-heading-accent" />
            <p
              className="leading-relaxed mb-4"
              style={{ color: 'var(--landing-text-secondary)', fontSize: '1.0625rem' }}
            >
              We build modern software designed to solve real-world business
              challenges. Founded by a team of engineers from Kannur, Kerala,
              our journey started with a shared vision &mdash; creating
              technology that is practical, scalable, and impactful.
            </p>
            <p
              className="leading-relaxed mb-6"
              style={{ color: 'var(--landing-text-muted)', fontSize: '1rem' }}
            >
              From custom software and SaaS platforms to AI-powered systems
              and business automation, we focus on products that help
              businesses grow smarter and operate more efficiently. N3FitBook
              is one of our flagship platforms, built to simplify fitness
              business management through technology.
            </p>

            <a
              href="https://www.n3global.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-btn-secondary landing-btn-lg"
              style={{ display: 'inline-flex' }}
            >
              Visit n3global.tech
              <FiArrowUpRight size={18} />
            </a>
          </motion.div>

          {/* Right: stat tiles */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4"
          >
            {stats.map((s, i) => (
              <div
                key={i}
                className="landing-card flex items-baseline justify-between gap-4"
                style={{ background: 'var(--landing-surface)' }}
              >
                <div
                  className="text-4xl font-extrabold"
                  style={{ color: 'var(--landing-text)' }}
                >
                  {s.value}
                </div>
                <div
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ color: 'var(--landing-text-muted)' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

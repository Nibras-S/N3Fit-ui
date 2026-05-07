import React from 'react';
import { motion } from 'framer-motion';

export default function LegalPageLayout({
  eyebrow,
  title,
  updatedOn,
  intro,
  children,
}) {
  return (
    <main className="legal-page">
      {/* Hero band */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--landing-bg-alt)' }}
      >
        <div className="landing-container pt-36 pb-12 lg:pt-44 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {eyebrow && <span className="landing-section-label">{eyebrow}</span>}
            <h1 className="landing-heading mb-3">{title}</h1>
            {updatedOn && (
              <p
                className="text-sm mb-5"
                style={{ color: 'var(--landing-text-muted)' }}
              >
                Last updated {updatedOn}
              </p>
            )}
            {intro && <p className="landing-subheading">{intro}</p>}
          </motion.div>
        </div>
      </section>

      {/* Article body */}
      <section className="py-14 lg:py-20" style={{ background: 'var(--landing-bg)' }}>
        <div className="landing-container">
          <article className="legal-content max-w-3xl mx-auto">
            {children}
          </article>
        </div>
      </section>
    </main>
  );
}

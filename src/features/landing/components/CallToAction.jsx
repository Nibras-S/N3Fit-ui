import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CallToAction({ onOpenTrial }) {

  return (
    <section className="py-20 lg:py-28" style={{ background: 'var(--landing-bg)' }}>
      <div className="landing-container">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden px-6 py-16 md:px-12 md:py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, var(--landing-primary), var(--landing-primary-dark))',
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full opacity-10 pointer-events-none"
            style={{ background: '#ffffff' }}
          />
          <div
            className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] rounded-full opacity-10 pointer-events-none"
            style={{ background: '#ffffff' }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
              style={{ letterSpacing: '-0.025em' }}
            >
              Ready to Transform
              <br />
              Your Fitness Business?
            </h2>
            <p className="text-lg text-white/75 mb-8 max-w-xl mx-auto leading-relaxed">
              Join 500+ gym owners who switched to N3 Fit and never looked back.
              Start your free trial today — setup takes under 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                className="landing-cta-primary"
                onClick={onOpenTrial}
              >
                Get Started Free
                <FiArrowRight size={18} />
              </button>
              <button className="landing-cta-secondary">
                Book a Demo
              </button>
            </div>

            <p className="text-sm text-white/50">
              Free 14-day trial &middot; No setup fee &middot; Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

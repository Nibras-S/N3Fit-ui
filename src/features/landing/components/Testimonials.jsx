import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Azeez',
    role: 'Gym Trainer, AzeeFit',
    text: 'We have been using this management software for 1 year and are well satisfied with the results. It made our daily operations so much easier.',
    avatar: 'A',
    color: 'var(--landing-primary)',
  },
  {
    name: 'John D.',
    role: 'Owner, German Fitness',
    text: 'Billing used to be a nightmare. Now it\'s automated and seamless. Best investment we made for our gym this year.',
    avatar: 'J',
    color: '#7c3aed',
  },
  {
    name: 'Mike R.',
    role: 'Manager, Iron Gym',
    text: 'The membership tracking is flawless. We\'ve reduced dropouts by 20% in just 3 months using the renewal reminders.',
    avatar: 'M',
    color: '#059669',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Testimonials() {
  return (
    <section
      id="testimonials"
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
          <span className="landing-section-label">Reviews</span>
          <h2 className="landing-heading">
            Trusted by{' '}
            <span className="landing-heading-gradient">Top Clubs</span>
          </h2>
          <p className="landing-subheading mx-auto text-center">
            Join hundreds of fitness centers that have transformed their
            management with N3FitBook.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="landing-card flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    fill="#f59e0b"
                    style={{ color: '#f59e0b' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{ color: 'var(--landing-text-secondary)' }}
              >
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--landing-border-light)' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: 'var(--landing-text)' }}
                  >
                    {t.name}
                  </h4>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--landing-text-muted)' }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

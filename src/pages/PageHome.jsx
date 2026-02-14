import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/static/components/navbar/Navbar';
import Header from '../components/static/components/header/Header';
import Program from '../components/static/components/program/Program';
import Class from '../components/static/components/class/Class';
import SocialProof from '../components/static/components/social/SocialProof';
import Price from '../components/static/components/pricing/Price';
import Footer from '../components/static/components/footer/Footer'; // Added Footer import
import './Splash.css';

export default function PageHome() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  useEffect(() => {
    // cursor glow effect
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    const moveCursor = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      cursor.remove();
    };
  }, []);

  return (
    <div className="landing-page-wrapper" ref={containerRef}>
      {/* Animated Background */}
      <div className="animated-background">
        <motion.div className="rotating-shape blue-circle" style={{ y: y1 }} />
        <motion.div className="rotating-shape orange-triangle" style={{ y: y2 }} />
        <motion.div className="rotating-shape purple-square" style={{ rotate }} />
      </div>

      <Navbar />

      <main>
        <Header />

        <section className="stats-section">
          <div className="section__container">
            <div className="stats-grid">
              {[
                { icon: 'ri-team-line', num: '50,000+', label: 'Active Members' },
                { icon: 'ri-building-line', num: '500+', label: 'Partner Gyms' },
                { icon: 'ri-line-chart-line', num: '99.9%', label: 'Uptime SLA' },
                { icon: 'ri-shield-check-line', num: '24/7', label: 'Support Available' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="stat-card glass-master"
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-icon" style={{
                    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
                    width: '80px', height: '80px', margin: '0 auto 1.5rem', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white'
                  }}>
                    <i className={stat.icon}></i>
                  </div>
                  <h3 className="stat-number" style={{
                    fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, var(--text-main), var(--text-secondary))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>{stat.num}</h3>
                  <p className="stat-label" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Program />
        <Class />
        <SocialProof />

        {/* Video Demo Section */}
        <section className="video-demo-section" style={{ padding: '4rem 0', background: 'var(--secondary-bg)' }}>
          <div className="section__container">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center' }}
            >
              <h2 className="section__header">
                See N3 in <span className="text-gradient">Action</span>
              </h2>
              <p className="section__subheader" style={{ marginBottom: '2rem' }}>
                Watch how N3 transforms gym management in under 2 minutes
              </p>

              <div className="video-wrapper glass-master">
                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                  <div className="play-button">
                    <i className="ri-play-fill"></i>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1594882645126-14020914d58d?auto=format&fit=crop&q=80&w=2070"
                    alt="Video Thumbnail"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Price />

        {/* FAQ Section */}
        <section className="faq-section" style={{ padding: '4rem 0' }}>
          <div className="section__container">
            <h2 className="section__header" style={{ textAlign: 'center' }}>
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="section__subheader" style={{ marginBottom: '2.5rem' }}>
              Everything you need to know about N3 FIT
            </p>

            <div className="faq-grid">
              {[
                {
                  q: "How long does it take to set up N3?",
                  a: "Most gyms are fully operational within 24 hours. Our team handles data migration and provides hands-on onboarding."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! N3 operates on a month-to-month basis with no long-term contracts. Cancel anytime with zero penalties."
                },
                {
                  q: "Is my member data secure?",
                  a: "Absolutely. We use bank-level encryption and are fully GDPR compliant."
                }
              ].map((faq, i) => (
                <motion.details
                  key={i}
                  className="faq-item glass-master"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <summary className="faq-question" style={{ listStyle: 'none', cursor: 'pointer', padding: '1rem', fontWeight: '700' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{faq.q}</span>
                      <i className="ri-add-line" style={{ color: 'var(--accent-indigo)' }}></i>
                    </div>
                  </summary>
                  <p className="faq-answer" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{faq.a}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        <Footer /> {/* Added Footer component */}
      </main>

      {/* Scroll to top button */}
      <motion.button
        className="scroll-to-top"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="ri-arrow-up-line"></i>
      </motion.button>
    </div>
  );
}

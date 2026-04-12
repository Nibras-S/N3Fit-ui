import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';
import FreeTrialModal from '../components/FreeTrialModal';
import { FiArrowUp } from 'react-icons/fi';

import '../styles/landing.css';

export default function LandingPage() {
  const [trialOpen, setTrialOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    document.title = 'N3 Fit — All-in-One Fitness Management Platform';
  }, []);

  return (
    <div className="landing-page-wrapper min-h-screen">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999]"
        style={{ scaleX, background: 'var(--landing-primary)' }}
      />

      <Navbar onOpenTrial={() => setTrialOpen(true)} />

      <main>
        <Hero onOpenTrial={() => setTrialOpen(true)} />
        <Problem />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CallToAction onOpenTrial={() => setTrialOpen(true)} />
      </main>

      <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />

      <Footer />

      {/* Scroll to top */}
      <motion.button
        className="fixed bottom-6 right-6 w-11 h-11 rounded-xl flex items-center justify-center z-40 landing-btn-primary"
        style={{ padding: 0 }}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: '0px 0px -300px 0px' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <FiArrowUp size={18} />
      </motion.button>
    </div>
  );
}

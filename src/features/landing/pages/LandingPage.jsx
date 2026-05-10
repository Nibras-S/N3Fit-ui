import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import { FiArrowUp } from 'react-icons/fi';
import useDocumentMeta from '../../../shared/hooks/useDocumentMeta';

import '../styles/landing.css';

// Below-the-fold sections — split out of the initial chunk so the hero
// becomes interactive faster on first paint. They load in the background
// once the main bundle has parsed; <Suspense fallback={null}> hides the
// hand-off so users don't see a flash.
const FAQ = lazy(() => import('../components/FAQ'));
const About = lazy(() => import('../components/About'));
const CallToAction = lazy(() => import('../components/CallToAction'));
const Footer = lazy(() => import('../components/Footer'));
const FreeTrialModal = lazy(() => import('../components/FreeTrialModal'));

export default function LandingPage() {
  const [trialOpen, setTrialOpen] = useState(false);
  const { hash } = useLocation();

  // Scroll to a hash target after the lazy below-the-fold sections have had
  // a chance to mount. The footer links from /privacy and /terms navigate
  // here as `/#faq`; without this the browser can't find #faq because the
  // FAQ chunk hasn't rendered yet.
  useEffect(() => {
    if (!hash) return;
    const tryScroll = (attempt = 0) => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (attempt < 10) {
        setTimeout(() => tryScroll(attempt + 1), 200);
      }
    };
    tryScroll();
  }, [hash]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useDocumentMeta({
    title: 'Gym Management Software India | N3FitBook',
    description: "Complete gym management software for India. Track members, billing, attendance, expenses & WhatsApp reminders from one platform. Start your free trial today.",
    canonical: 'https://www.n3fitbook.in/',
    ogTitle: 'N3FitBook — All-in-One Gym Management Platform',
    ogDescription: "Members, billing, attendance, expenses, WhatsApp reminders — every gym management tool in one platform. Built for Indian gyms.",
    ogImage: 'https://www.n3fitbook.in/og-image.png',
    ogType: 'website',
  });

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
        <Pricing onOpenTrial={() => setTrialOpen(true)} />
        <Testimonials />
        <Suspense fallback={null}>
          <FAQ />
          <About />
          <CallToAction onOpenTrial={() => setTrialOpen(true)} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <FreeTrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
        <Footer />
      </Suspense>

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

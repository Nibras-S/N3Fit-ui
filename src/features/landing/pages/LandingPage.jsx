import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import LogoCloud from '../components/LogoCloud';
import Problem from '../components/Problem';
import Features from '../components/Features';
import DashboardShowcase from '../components/DashboardShowcase';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import { motion, useScroll, useSpring } from 'framer-motion';

import '../styles/landing.css';

export default function PageHome() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    document.title = 'N3 Fit — All-in-One Fitness Management Platform';
  }, []);

  return (
    <div className="landing-page-wrapper min-h-screen relative" style={{ background: '#0a0a0a' }}>
      {/* Scroll Progress Bar — Accent Color */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[9999]"
        style={{
          scaleX,
          background: 'linear-gradient(to right, #4040e0, #00e5ff)',
        }}
      />

      <Navbar />

      <main>
        <Hero />
        <LogoCloud />
        <Problem />
        <Features />
        <DashboardShowcase />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>

      <Footer />

      {/* Scroll to top — Dark + Accent */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 rounded-xl flex items-center justify-center z-40 transition-shadow"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: "0px 0px -200px 0px" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          background: 'linear-gradient(135deg, #4040e0, #00d4ff)',
          color: '#ffffff',
        }}
      >
        <i className="ri-arrow-up-line text-xl font-bold"></i>
      </motion.button>
    </div>
  );
}

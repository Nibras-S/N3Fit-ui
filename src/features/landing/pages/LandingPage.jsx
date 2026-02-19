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
    document.title = 'Fit — All-in-One Fitness Management Platform';
  }, []);

  return (
    <div className="landing-page-wrapper bg-white min-h-screen relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 origin-left z-[9999]"
        style={{ scaleX }}
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

      {/* Scroll to top */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center z-40 hover:shadow-xl transition-shadow"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, margin: "0px 0px -200px 0px" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="ri-arrow-up-line text-xl"></i>
      </motion.button>
    </div>
  );
}

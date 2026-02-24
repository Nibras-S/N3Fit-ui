import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import n3Logo from '../../../assets/n3Logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={n3Logo} alt="Fit" style={{ height: '36px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.2)' }} />
            <span className="logo-text">Fit</span>
          </div>

          <div className="nav-links">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link"
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <button className="btn-nav-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-nav-primary" onClick={() => navigate('/login')}>
              Start Free Trial
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <i className={mobileOpen ? 'ri-close-line' : 'ri-menu-3-line'}></i>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu — Dark Glass */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-[999] mx-4 mt-2 rounded-2xl border shadow-xl p-6"
            style={{
              background: 'rgba(10,10,10,0.95)',
              backdropFilter: 'blur(24px)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-medium text-lg py-2 transition-colors"
                  style={{ color: '#aaa' }}
                  onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
                  onMouseLeave={(e) => e.target.style.color = '#aaa'}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                >
                  {link.label}
                </a>
              ))}
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <button
                className="w-full py-3 rounded-xl font-bold"
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
              >
                Sign In
              </button>
              <button
                className="w-full py-3 rounded-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #4040e0, #00d4ff)', color: '#ffffff' }}
                onClick={() => { setMobileOpen(false); navigate('/login'); }}
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  );
}

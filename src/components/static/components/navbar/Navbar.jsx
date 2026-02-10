import React, { useState, useEffect } from 'react';
import './navbar.css';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__container">
        <div className="nav__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="logo-icon--minimal">N3</span>
          <span className="logo-text--minimal">GYM</span>
        </div>

        <ul className="nav__links--minimal desktop-only">
          <li className="link--minimal" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Solutions</li>
          <li className="link--minimal" onClick={() => document.getElementById('benefits').scrollIntoView({ behavior: 'smooth' })}>Impact</li>
          <li className="link--minimal" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>Pricing</li>
        </ul>

        <div className="nav__actions--minimal">
          <button onClick={() => navigate("/login")} className="btn-text--minimal">Log in</button>
          <button onClick={() => navigate("/register")} className="btn-landing--sm">Start Free Trial</button>
        </div>
      </div>
    </nav>
  )
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import n3Logo from '../../../assets/n3Logo.png';

export default function Footer() {
  const navigate = useNavigate();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Email: contact@n3solution.com', href: 'mailto:contact@n3solution.com' },
      { label: 'WhatsApp Chat', href: '#' },
      { label: 'Documentation', href: '#' },
    ],
  };

  const socials = [
    { icon: 'ri-instagram-line', href: '#' },
    { icon: 'ri-twitter-x-line', href: '#' },
    { icon: 'ri-linkedin-fill', href: '#' },
    { icon: 'ri-youtube-line', href: '#' },
  ];

  const scrollTo = (href) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="pt-20 pb-8" style={{ background: '#050505' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5 cursor-pointer" onClick={() => navigate('/')}>
              <img src={n3Logo} alt="Fit" style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(1.2)' }} />
              <span
                className="text-xl font-extrabold"
                style={{ color: '#fff', fontFamily: "'Outfit', sans-serif" }}
              >
                N3 Fit
              </span>
            </div>
            <p className="leading-relaxed max-w-sm mb-6 text-sm" style={{ color: '#555' }}>
              The all-in-one SaaS platform for modern fit club management. Built for owners who want to automate operations, boost retention, and grow revenue.
            </p>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#555',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,212,255,0.1)';
                    e.currentTarget.style.color = '#00d4ff';
                    e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#555';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <i className={`${s.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="font-bold mb-5 text-sm uppercase tracking-wider"
                style={{ color: '#00d4ff', letterSpacing: '0.12em' }}
              >
                {title}
              </h4>
              <div className="flex flex-col gap-3">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    onClick={(e) => { if (link.href.startsWith('#')) { e.preventDefault(); scrollTo(link.href); } }}
                    className="transition-colors text-sm"
                    style={{ color: '#555' }}
                    onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
                    onMouseLeave={(e) => e.target.style.color = '#555'}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#333' }}
        >
          <p>© 2026 N3 Fit. All rights reserved.</p>
          <div className="flex gap-6">
            <a
              href="#"
              className="transition-colors"
              style={{ color: '#444' }}
              onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
              onMouseLeave={(e) => e.target.style.color = '#444'}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors"
              style={{ color: '#444' }}
              onMouseEnter={(e) => e.target.style.color = '#00d4ff'}
              onMouseLeave={(e) => e.target.style.color = '#444'}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer >
  );
}

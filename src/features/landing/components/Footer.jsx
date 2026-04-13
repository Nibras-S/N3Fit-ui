import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import n3Logo from '../../../assets/n3Logo.png';

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
    { label: 'contact@n3solution.com', href: 'mailto:contact@n3solution.com' },
    { label: 'WhatsApp Chat', href: '#' },
    { label: 'Documentation', href: '#' },
  ],
};

const socials = [
  { icon: FaInstagram, href: '#' },
  { icon: FaTwitter, href: '#' },
  { icon: FaLinkedinIn, href: '#' },
  { icon: FaYoutube, href: '#' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export default function Footer() {
  const navigate = useNavigate();

  const scrollTo = (href) => {
    if (href.startsWith('#') && href.length > 1) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="pt-16 pb-8"
      style={{
        background: 'var(--landing-primary-dark)',
        color: 'rgba(255,255,255,0.6)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div
              className="flex items-center gap-2 mb-4 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img
                src={n3Logo}
                alt="N3 Fit"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(2)',
                }}
              />
              <span className="text-lg font-extrabold text-white">N3 Fit</span>
            </div>
            <p className="leading-relaxed max-w-sm mb-5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              The all-in-one SaaS platform for modern gym management. Built for
              owners who want to automate operations and grow revenue.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a
                    key={i}
                    href={s.href}
                    className="landing-footer-social"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="font-semibold text-sm mb-4 uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        scrollTo(link.href);
                      }
                    }}
                    className="text-sm landing-footer-link"
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
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} N3 Fit. All rights reserved.
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('#')) {
                    e.preventDefault();
                    scrollTo(link.href);
                  }
                }}
                className="landing-footer-link-dim"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

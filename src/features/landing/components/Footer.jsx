import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import n3fitbookLogo from '../../../assets/n3fitbook-192.webp';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ],
  Company: [
    { label: 'About Us', href: 'https://www.n3global.tech', external: true },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: 'mailto:contact@n3global.tech' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'contact@n3global.tech', href: 'mailto:contact@n3global.tech' },
    { label: 'WhatsApp Chat', href: 'https://wa.me/919645091256' },
    { label: 'Documentation', href: '#' },
  ],
};

const socials = [
  { icon: FaInstagram, href: 'https://www.instagram.com/n3globaltech' },
  { icon: FaTwitter, href: '#' },
  { icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/n3-global-tech' },
  { icon: FaYoutube, href: '#' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
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
                src={n3fitbookLogo}
                alt="N3FitBook"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: '7px',
                }}
              />
              <span className="text-lg font-extrabold text-white">N3FitBook</span>
            </div>
            <p className="leading-relaxed max-w-sm mb-5 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              N3FitBook is a product by N3 Global Tech &mdash; Kannur, Kerala.
              Built for gym owners who want to automate operations and grow
              revenue.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s, i) => {
                const Icon = s.icon;
                const isExternal = s.href.startsWith('http');
                return (
                  <a
                    key={i}
                    href={s.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
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
                {links.map((link, i) => {
                  const isExternal = link.href.startsWith('http');
                  return (
                    <a
                      key={i}
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault();
                          scrollTo(link.href);
                        }
                      }}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-sm landing-footer-link"
                    >
                      {link.label}
                    </a>
                  );
                })}
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
            &copy; {new Date().getFullYear()} N3FitBook by N3 Global Tech. All rights reserved.
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link, i) => (
              <a
                key={i}
                href={link.to}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.to);
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

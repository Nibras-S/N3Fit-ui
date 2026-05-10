import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaXTwitter } from 'react-icons/fa6';
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
    { label: 'Blog', href: 'https://www.n3global.tech/blog/custom-software-saas-kerala/' },
    // The mailto opens the user's email client. We also surface the address
    // via the title attribute so visitors on a desktop browser without an
    // email app configured can hover/long-press to read and copy it.
    { label: 'Contact', href: 'mailto:contact@n3global.tech', title: 'Email contact@n3global.tech' },
  ],
  Support: [
    // Help Center previously pointed to "#" which scrolled to top and did
    // nothing useful. Both items below resolve to real destinations: FAQ
    // smooth-scrolls to the on-page FAQ section; Email Support opens the
    // mail client with the address ready to copy via title attribute.
    { label: 'FAQ', href: '#faq' },
    { label: 'Email Support', href: 'mailto:contact@n3global.tech', title: 'Email contact@n3global.tech' },
  ],
};

// Social presence. Instagram is the N3FitBook product handle; X is the parent
// company N3 Global Tech (so the brand-attribution lines up with the "by N3
// Global Tech" tagline visible just above these icons). Add more rows when
// new accounts come online — the rendered <a> reads `s.brand` for the
// aria-label so attribution stays accurate per row.
const socials = [
  { icon: FaInstagram, brand: 'N3FitBook', platform: 'Instagram', href: 'https://www.instagram.com/n3fitbook' },
  { icon: FaXTwitter,  brand: 'N3 Global Tech', platform: 'X', href: 'https://x.com/N3Globaltech' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

export default function Footer() {
  const navigate = useNavigate();

  // Anchor-link scroll. The Footer renders on /, /privacy, /terms, and the
  // 404 page — Privacy/Terms/404 don't have #features, #pricing, #faq etc.
  // anywhere on them. When the target id isn't on the current page we
  // navigate home with the hash so the homepage scrolls to it on mount.
  const scrollTo = (href) => {
    if (!href.startsWith('#') || href.length <= 1) return;
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/${href}`);
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-2">
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
                const label = `${s.brand} on ${s.platform}`;
                return (
                  <a
                    key={i}
                    href={s.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="landing-footer-social"
                    aria-label={label}
                    title={label}
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
                      title={link.title}
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

import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      { label: 'Email: support@n3fit.com', href: 'mailto:support@n3fit.com' },
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
    <footer className="bg-slate-900 text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-1.5 mb-5 cursor-pointer" onClick={() => navigate('/')}>
              <span className="bg-gradient-to-br from-blue-400 to-blue-600 text-white px-2.5 py-1 rounded-lg text-xl font-extrabold font-display">N3</span>
              <span className="text-xl font-extrabold font-display text-white">FIT</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm mb-6 text-sm">
              The all-in-one SaaS platform for modern gym management. Built for owners who want to automate operations, boost retention, and grow revenue.
            </p>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <i className={`${s.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">{title}</h4>
              <div className="flex flex-col gap-3">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    onClick={(e) => { if (link.href.startsWith('#')) { e.preventDefault(); scrollTo(link.href); } }}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 N3 FIT. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

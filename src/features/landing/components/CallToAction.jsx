import React from 'react';
import { motion } from 'framer-motion';

const CallToAction = () => {
    return (
        <section className="py-24 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
                        style={{
                            background: 'rgba(0,212,255,0.08)',
                            color: '#00d4ff',
                            border: '1px solid rgba(0,212,255,0.15)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00d4ff' }}></span>
                        14-Day Free Trial — No Credit Card
                    </div>

                    <h2
                        className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
                        style={{ fontFamily: "'Outfit', sans-serif", color: '#fff', letterSpacing: '-0.03em' }}
                    >
                        READY TO TRANSFORM
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #4040e0, #00e5ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            YOUR FITNESS BUSINESS?
                        </span>
                    </h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#666' }}>
                        Join 500+ fit club owners who switched to N3 Fit and never looked back. Start your free trial today — setup takes under 10 minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 rounded-xl font-bold text-lg transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #4040e0, #00d4ff)',
                                color: '#ffffff',
                            }}
                        >
                            <i className="ri-rocket-2-line mr-2"></i>
                            Get Started Free
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 rounded-xl font-bold text-lg transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#e0e0e0',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <i className="ri-calendar-line mr-2"></i>
                            Book a Demo
                        </motion.button>
                    </div>

                    <p className="text-sm" style={{ color: '#444' }}>
                        ✓ Free 14-day trial &nbsp; ✓ No setup fee &nbsp; ✓ Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToAction;

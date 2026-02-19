import React from 'react';
import { motion } from 'framer-motion';

const CallToAction = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Blue gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-blue-100 text-sm font-medium border border-white/10 mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        14-Day Free Trial — No Credit Card
                    </div>

                    <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Ready to Transform
                        <br />
                        Your Fit Club Operations?
                    </h2>
                    <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join 500+ fit club owners who switched to Fit and never looked back. Start your free trial today — setup takes under 10 minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                        >
                            <i className="ri-rocket-2-line mr-2"></i>
                            Get Started Free
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
                        >
                            <i className="ri-calendar-line mr-2"></i>
                            Book a Demo
                        </motion.button>
                    </div>

                    <p className="text-sm text-blue-300/60">
                        ✓ Free 14-day trial &nbsp; ✓ No setup fee &nbsp; ✓ Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToAction;

import React from 'react';
import { motion } from 'framer-motion';

const LogoCloud = () => {
    const logos = [
        { name: 'PowerFit', icon: 'ri-boxing-line' },
        { name: 'Iron Paradise', icon: 'ri-sword-line' },
        { name: 'Yoga Bliss', icon: 'ri-mental-health-line' },
        { name: 'FitZone', icon: 'ri-heart-pulse-line' },
        { name: 'CrossFit Elite', icon: 'ri-fire-line' },
        { name: 'Muscle Factory', icon: 'ri-shield-star-line' },
    ];

    return (
        <section className="py-14 bg-white border-y border-slate-100">
            <div className="container mx-auto px-4">
                <p className="text-center text-sm text-slate-400 font-medium mb-8 tracking-wider uppercase">
                    Trusted by leading fitness brands across India
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                    {logos.map((logo, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-slate-300 hover:text-blue-500 transition-colors cursor-default"
                        >
                            <i className={`${logo.icon} text-2xl`}></i>
                            <span className="text-lg font-bold tracking-tight">{logo.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoCloud;
